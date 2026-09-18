import { streamText, tool, isStepCount, type ModelMessage } from "ai";
import { z } from "zod";
import { resolveModel } from "@/lib/ai-model";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

type TopicRow = {
  id: string;
  subject_id: string;
  unit_id: string;
  code: string;
  title: string;
  status: string;
  in_midsem: boolean;
};

export async function POST(req: Request) {
  const db = await createClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  // The student's own key, if they've added one in Settings.
  const { data: prof } = await db.from("profiles").select("gemini_key").eq("id", user.id).maybeSingle();
  const resolved = resolveModel(prof?.gemini_key ?? null);
  if (!resolved) {
    return Response.json(
      { error: "No AI key yet. Add your Gemini key in Settings — it takes two minutes and is free." },
      { status: 501 },
    );
  }

  const body = (await req.json()) as {
    messages: { role: "user" | "assistant"; content: string }[];
    attachmentIds?: string[];
  };
  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return Response.json({ error: "No messages" }, { status: 400 });
  }

  /* ── context: the real syllabus, so it can name real topic codes ── */
  const [subjectsRes, unitsRes, topicsRes, notesRes] = await Promise.all([
    db.from("subjects").select("id, name, short_name, midsem_scope").order("sort_order"),
    db.from("units").select("id, subject_id, number, title, in_midsem").order("number"),
    db
      .from("topics")
      .select("id, subject_id, unit_id, code, title, status, in_midsem")
      .order("sort_order"),
    db
      .from("notes")
      .select("title, content")
      .order("updated_at", { ascending: false })
      .limit(6),
  ]);

  const subjects = subjectsRes.data ?? [];
  const units = unitsRes.data ?? [];
  const topics = (topicsRes.data ?? []) as TopicRow[];

  const syllabus = subjects
    .map((s) => {
      const us = units.filter((u) => u.subject_id === s.id);
      if (!us.length) return `## ${s.name} (${s.short_name}) — no course plan loaded yet`;
      const body = us
        .map((u) => {
          const ts = topics
            .filter((t) => t.unit_id === u.id)
            .map((t) => `    - ${t.code} — ${t.title} [${t.status}]`)
            .join("\n");
          return `  Unit ${u.number}: ${u.title}${u.in_midsem ? " (in mid-sem)" : ""}\n${ts}`;
        })
        .join("\n");
      return `## ${s.name} (${s.short_name})\n  mid-sem scope: ${s.midsem_scope ?? "unknown"}\n${body}`;
    })
    .join("\n\n");

  const recentNotes = (notesRes.data ?? [])
    .map((n) => `- ${n.title}: ${(n.content ?? "").slice(0, 250)}`)
    .join("\n");

  const system = `You are helping Ankit, a first-year B.Tech CSE student at IILM University Gurugram, study for Semester I mid-sems (5–11 October). He is a few days into the course.

You are wired into his study app: you can read his syllabus and notes, and you can change his data with the tools provided.

His syllabus, with the real topic codes — always use these exact codes in tool calls:

${syllabus}

Recent notes:
${recentNotes || "(none yet)"}

When to use the tools — this matters:
- Use them ONLY when he asks you to change something, or when he is clearly handing you class material to capture (a board photo, a tutorial sheet, "we covered X today").
- A question asked for its own sake — "what is the difference between X and Y", "explain Z", "what should I study" — is answered in the chat and nothing is written. Do not add a note or a question to the bank just because the topic came up. Writing to his data uninvited is worse than being unhelpful.
- When he does hand you material, turn it into something concrete rather than describing what he could do.
- Match content to the correct topic_code above. If nothing fits, say so instead of forcing it.
- If he reports something a teacher said that contradicts the syllabus data (scope changes, what will be asked), say clearly what should be corrected. You cannot edit the syllabus data files from here — that is done in Claude Code.
- Digital Electronics has no course plan, Design Thinking and AI have only Unit 1, and Linux Administration has lab experiments but no topics. Never invent topic codes for those.
- Be concise and concrete. He is short on time. No padding, no flattery.
- Maths renders with KaTeX: use $...$ and $$...$$.`;

  /* ── attached inbox files: images and PDFs ── */
  const ATTACHABLE = (m: string) => m.startsWith("image/") || m === "application/pdf";
  const imageParts: { type: "file"; mediaType: string; data: string }[] = [];
  if (resolved.vision && body.attachmentIds?.length) {
    const { data: atts } = await db
      .from("attachments")
      .select("storage_path, mime")
      .in("id", body.attachmentIds.slice(0, 6));
    for (const a of atts ?? []) {
      const mime = (a.mime as string) ?? "";
      if (!ATTACHABLE(mime)) continue;
      const { data: file } = await db.storage.from("vault").download(a.storage_path as string);
      if (!file) continue;
      imageParts.push({
        type: "file",
        mediaType: mime,
        data: Buffer.from(await file.arrayBuffer()).toString("base64"),
      });
    }
  }

  const messages: ModelMessage[] = body.messages.map((m, i) => {
    if (i === body.messages.length - 1 && m.role === "user" && imageParts.length) {
      return { role: "user", content: [{ type: "text", text: m.content }, ...imageParts] };
    }
    return { role: m.role, content: m.content };
  });

  const findTopic = (code: string) => topics.find((t) => t.code === code);

  const tools = {
    add_checkpoints: tool({
      description:
        "Add steps to a topic's Breakdown checklist. Use when a topic should be split into things to work through. Skips titles already present.",
      inputSchema: z.object({
        topic_code: z.string().describe("Exact topic code, e.g. calc-u1-limits"),
        titles: z.array(z.string()).describe("Short step titles, in working order"),
      }),
      execute: async ({ topic_code, titles }) => {
        const topic = findTopic(topic_code);
        if (!topic) return { ok: false, message: `No topic with code "${topic_code}".` };
        const clean = titles.map((t) => t.trim()).filter(Boolean);
        if (!clean.length) return { ok: false, message: "No titles given." };

        const { data: existing } = await db
          .from("checkpoints")
          .select("title, sort_order")
          .eq("topic_id", topic.id);
        const seen = new Set((existing ?? []).map((c) => c.title as string));
        const start =
          Math.max(-1, ...(existing ?? []).map((c) => (c.sort_order as number) ?? 0)) + 1;

        const rows = clean
          .filter((t) => !seen.has(t))
          .map((title, i) => ({
            user_id: user.id,
            topic_id: topic.id,
            title,
            sort_order: start + i,
          }));
        if (!rows.length) return { ok: true, message: "Those steps were already there." };

        const { error } = await db.from("checkpoints").insert(rows);
        if (error) return { ok: false, message: error.message };
        return { ok: true, message: `Added ${rows.length} step(s) to ${topic_code}.` };
      },
    }),

    add_question: tool({
      description:
        "Add a question to the question bank against a topic — past papers, tutorial problems, anything the teacher signalled would be asked. Answer supports markdown and $LaTeX$.",
      inputSchema: z.object({
        topic_code: z.string(),
        prompt: z.string().describe("The question as it would be asked"),
        answer: z.string().describe("Worked answer or key steps"),
        marks: z.number().int().nullable().optional(),
        source: z.string().nullable().optional().describe('e.g. "Tutorial sheet 2"'),
        kind: z.enum(["pyq", "practice", "quiz", "example", "viva"]).optional(),
      }),
      execute: async ({ topic_code, prompt, answer, marks, source, kind }) => {
        const topic = findTopic(topic_code);
        if (!topic) return { ok: false, message: `No topic with code "${topic_code}".` };
        const { error } = await db.from("questions").insert({
          user_id: user.id,
          subject_id: topic.subject_id,
          topic_id: topic.id,
          prompt,
          answer,
          marks: marks ?? null,
          source: source ?? null,
          kind: kind ?? "practice",
        });
        if (error) return { ok: false, message: error.message };
        return { ok: true, message: `Question added to ${topic_code}.` };
      },
    }),

    create_note: tool({
      description:
        "Create a note, optionally filed under a topic. Use when class material should be written up properly. Markdown with $LaTeX$.",
      inputSchema: z.object({
        title: z.string(),
        content: z.string(),
        topic_code: z.string().nullable().optional(),
      }),
      execute: async ({ title, content, topic_code }) => {
        const topic = topic_code ? findTopic(topic_code) : undefined;
        const { error } = await db.from("notes").insert({
          user_id: user.id,
          title,
          content,
          subject_id: topic?.subject_id ?? null,
          unit_id: topic?.unit_id ?? null,
          topic_id: topic?.id ?? null,
        });
        if (error) return { ok: false, message: error.message };
        return { ok: true, message: `Note "${title}" created.` };
      },
    }),
  };

  const result = streamText({
    model: resolved.model,
    system,
    messages,
    tools,
    stopWhen: isStepCount(6),
  });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (o: unknown) => controller.enqueue(encoder.encode(JSON.stringify(o) + "\n"));
      try {
        for await (const part of result.fullStream) {
          if (part.type === "text-delta") {
            send({ type: "text", text: part.text });
          } else if (part.type === "tool-result") {
            const out = part.output as { ok?: boolean; message?: string };
            send({ type: "tool", name: part.toolName, summary: out?.message ?? part.toolName });
          } else if (part.type === "tool-error") {
            send({ type: "tool", name: part.toolName, summary: `${part.toolName} failed` });
          } else if (part.type === "error") {
            send({ type: "error", text: String(part.error) });
          }
        }
        send({ type: "done" });
      } catch (e) {
        send({ type: "error", text: e instanceof Error ? e.message : String(e) });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "content-type": "application/x-ndjson; charset=utf-8" },
  });
}
