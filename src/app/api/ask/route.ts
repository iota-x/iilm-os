import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

const MODEL = "claude-opus-5";

/** Tools Claude can call to actually change your data, not just describe changes. */
const TOOLS: Anthropic.Tool[] = [
  {
    name: "add_checkpoints",
    description:
      "Add one or more steps to a topic's Breakdown checklist. Use when the user wants a topic split into things to work through. Skips any step whose title already exists on that topic.",
    input_schema: {
      type: "object",
      properties: {
        topic_code: { type: "string", description: "The topic code, e.g. calc-u1-limits" },
        titles: {
          type: "array",
          items: { type: "string" },
          description: "Short imperative step titles, in the order they should be worked.",
        },
      },
      required: ["topic_code", "titles"],
      additionalProperties: false,
    },
    strict: true,
  },
  {
    name: "add_question",
    description:
      "Add a question to the question bank against a topic. Use for past papers, tutorial problems, or anything the teacher indicated would be asked. The answer supports markdown and $LaTeX$.",
    input_schema: {
      type: "object",
      properties: {
        topic_code: { type: "string" },
        prompt: { type: "string", description: "The question as it would be asked." },
        answer: { type: "string", description: "Worked answer or key steps." },
        marks: { type: ["integer", "null"] },
        source: {
          type: ["string", "null"],
          description: 'Where it came from, e.g. "Tutorial sheet 2" or "Class 17 Sept".',
        },
        kind: { type: "string", enum: ["pyq", "practice", "quiz", "example", "viva"] },
      },
      required: ["topic_code", "prompt", "answer", "marks", "source", "kind"],
      additionalProperties: false,
    },
    strict: true,
  },
  {
    name: "create_note",
    description:
      "Create a note, optionally filed under a topic. Use when the user wants class material written up properly. Content is markdown with $LaTeX$.",
    input_schema: {
      type: "object",
      properties: {
        title: { type: "string" },
        content: { type: "string" },
        topic_code: { type: ["string", "null"] },
      },
      required: ["title", "content", "topic_code"],
      additionalProperties: false,
    },
    strict: true,
  },
];

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: "No ANTHROPIC_API_KEY set on the server. Add it in Vercel and redeploy." },
      { status: 501 },
    );
  }

  const db = await createClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const body = (await req.json()) as {
    messages: { role: "user" | "assistant"; content: string }[];
    attachmentIds?: string[];
  };
  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return Response.json({ error: "No messages" }, { status: 400 });
  }

  /* ── context: the syllabus, so Claude can name real topic codes ── */
  const [subjectsRes, unitsRes, topicsRes, notesRes] = await Promise.all([
    db.from("subjects").select("id, slug, name, short_name, midsem_scope").order("sort_order"),
    db.from("units").select("id, subject_id, number, title, in_midsem").order("number"),
    db
      .from("topics")
      .select("id, subject_id, unit_id, code, title, status, in_midsem")
      .order("sort_order"),
    db.from("notes").select("title, content, updated_at").order("updated_at", { ascending: false }).limit(8),
  ]);

  const subjects = subjectsRes.data ?? [];
  const units = unitsRes.data ?? [];
  const topics = topicsRes.data ?? [];

  const syllabus = subjects
    .map((s) => {
      const us = units.filter((u) => u.subject_id === s.id);
      if (!us.length) return `## ${s.name} (${s.short_name}) — no course plan loaded yet`;
      const lines = us.map((u) => {
        const ts = topics
          .filter((t) => t.unit_id === u.id)
          .map((t) => `    - ${t.code} — ${t.title} [${t.status}]`)
          .join("\n");
        return `  Unit ${u.number}: ${u.title}${u.in_midsem ? " (in mid-sem)" : ""}\n${ts}`;
      });
      return `## ${s.name} (${s.short_name})\n  mid-sem scope: ${s.midsem_scope ?? "unknown"}\n${lines.join("\n")}`;
    })
    .join("\n\n");

  const recentNotes = (notesRes.data ?? [])
    .map((n) => `- ${n.title}: ${(n.content ?? "").slice(0, 300)}`)
    .join("\n");

  /* ── any inbox images the user attached ── */
  const imageBlocks: Anthropic.ImageBlockParam[] = [];
  if (body.attachmentIds?.length) {
    const { data: atts } = await db
      .from("attachments")
      .select("storage_path, mime")
      .in("id", body.attachmentIds.slice(0, 6));
    for (const a of atts ?? []) {
      const mime = (a.mime as string) ?? "";
      if (!mime.startsWith("image/")) continue;
      const { data: file } = await db.storage.from("vault").download(a.storage_path as string);
      if (!file) continue;
      const b64 = Buffer.from(await file.arrayBuffer()).toString("base64");
      imageBlocks.push({
        type: "image",
        source: {
          type: "base64",
          media_type: mime as "image/png" | "image/jpeg" | "image/gif" | "image/webp",
          data: b64,
        },
      });
    }
  }

  const system = `You are helping Ankit, a first-year B.Tech CSE student at IILM University Gurugram, study for his Semester I mid-sems (5–11 October). He is three days into the course.

You are wired into his study app. You can read his syllabus and notes, and you can change his data using the tools provided.

His syllabus, with real topic codes — always use these exact codes when calling tools:

${syllabus}

His most recent notes:
${recentNotes || "(none yet)"}

How to be useful here:
- When he shows you a photo of the board or a tutorial sheet, read it carefully and turn it into something concrete: checkpoints on the right topic, questions in the bank, or a written-up note. Prefer doing it with a tool over describing what he could do.
- Match content to the right topic_code from the list above. If nothing fits well, say so rather than forcing it.
- If he tells you something his teacher said that contradicts the syllabus data — scope changes, what will be asked — say clearly that the data should be corrected and what to change. You cannot edit the syllabus files from here; that is done in Claude Code.
- Three subjects have no course plan loaded (Digital Electronics, and Units 2+ of Design Thinking and AI), and Linux has lab experiments but no topics. Don't invent topic codes for those.
- Be concise and concrete. He is short on time. Don't pad, don't over-explain, don't flatter.
- Maths renders with KaTeX — use $...$ and $$...$$.`;

  const client = new Anthropic();

  const messages: Anthropic.MessageParam[] = body.messages.map((m, i) => {
    // attach images to the latest user message
    if (i === body.messages.length - 1 && m.role === "user" && imageBlocks.length) {
      return { role: "user", content: [...imageBlocks, { type: "text", text: m.content }] };
    }
    return { role: m.role, content: m.content };
  });

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj: unknown) =>
        controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"));

      try {
        for (let turn = 0; turn < 6; turn++) {
          const run = client.messages.stream({
            model: MODEL,
            max_tokens: 16000,
            system,
            messages,
            tools: TOOLS,
            thinking: { type: "adaptive" },
          });

          run.on("text", (t) => send({ type: "text", text: t }));

          const final = await run.finalMessage();
          messages.push({ role: "assistant", content: final.content });

          if (final.stop_reason === "refusal") {
            send({ type: "error", text: "I can't help with that one." });
            break;
          }
          if (final.stop_reason !== "tool_use") break;

          const results: Anthropic.ToolResultBlockParam[] = [];
          for (const block of final.content) {
            if (block.type !== "tool_use") continue;
            const out = await runTool(block.name, block.input, db, user.id, topics);
            send({ type: "tool", name: block.name, summary: out.summary });
            results.push({
              type: "tool_result",
              tool_use_id: block.id,
              content: out.text,
              is_error: out.isError,
            });
          }
          messages.push({ role: "user", content: results });
        }
        send({ type: "done" });
      } catch (e) {
        send({
          type: "error",
          text: e instanceof Anthropic.APIError ? `API error ${e.status}: ${e.message}` : String(e),
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "content-type": "application/x-ndjson; charset=utf-8" },
  });
}

type Db = Awaited<ReturnType<typeof createClient>>;
type TopicRow = { id: string; subject_id: string; code: string; unit_id: string };

async function runTool(
  name: string,
  raw: unknown,
  db: Db,
  userId: string,
  topics: TopicRow[],
): Promise<{ text: string; summary: string; isError: boolean }> {
  const input = raw as Record<string, unknown>;
  const findTopic = (code: unknown) => topics.find((t) => t.code === code);

  try {
    if (name === "add_checkpoints") {
      const topic = findTopic(input.topic_code);
      if (!topic) return err(`No topic with code "${input.topic_code}".`);
      const titles = (input.titles as string[]).map((t) => t.trim()).filter(Boolean);
      if (!titles.length) return err("No titles given.");

      const { data: existing } = await db
        .from("checkpoints")
        .select("title, sort_order")
        .eq("topic_id", topic.id);
      const seen = new Set((existing ?? []).map((c) => c.title as string));
      const start = Math.max(-1, ...(existing ?? []).map((c) => (c.sort_order as number) ?? 0)) + 1;

      const rows = titles
        .filter((t) => !seen.has(t))
        .map((title, i) => ({ user_id: userId, topic_id: topic.id, title, sort_order: start + i }));
      if (!rows.length) return ok("All of those steps are already on that topic.", "no new steps");

      const { error } = await db.from("checkpoints").insert(rows);
      if (error) return err(error.message);
      return ok(
        `Added ${rows.length} step(s) to ${input.topic_code}.`,
        `added ${rows.length} step${rows.length === 1 ? "" : "s"} to ${input.topic_code}`,
      );
    }

    if (name === "add_question") {
      const topic = findTopic(input.topic_code);
      if (!topic) return err(`No topic with code "${input.topic_code}".`);
      const { error } = await db.from("questions").insert({
        user_id: userId,
        subject_id: topic.subject_id,
        topic_id: topic.id,
        prompt: String(input.prompt),
        answer: String(input.answer),
        marks: typeof input.marks === "number" ? input.marks : null,
        source: input.source ? String(input.source) : null,
        kind: (input.kind as string) || "practice",
      });
      if (error) return err(error.message);
      return ok(`Question added to ${input.topic_code}.`, `question added to ${input.topic_code}`);
    }

    if (name === "create_note") {
      const topic = input.topic_code ? findTopic(input.topic_code) : undefined;
      const { data, error } = await db
        .from("notes")
        .insert({
          user_id: userId,
          title: String(input.title),
          content: String(input.content),
          subject_id: topic?.subject_id ?? null,
          unit_id: topic?.unit_id ?? null,
          topic_id: topic?.id ?? null,
        })
        .select("id")
        .single();
      if (error) return err(error.message);
      return ok(`Note created (id ${data.id}).`, `note "${input.title}" created`);
    }

    return err(`Unknown tool ${name}.`);
  } catch (e) {
    return err(e instanceof Error ? e.message : String(e));
  }
}

const ok = (text: string, summary: string) => ({ text, summary, isError: false });
const err = (text: string) => ({ text, summary: text, isError: true });
