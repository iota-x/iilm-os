import { requestAuth } from "@/lib/supabase/server";
import { resolveModel } from "@/lib/ai-model";
import { decrypt } from "@/lib/secret";
import { SHARED_ASK_DAILY, takeSharedAsk } from "@/lib/ask-quota";
import { extractDeadlines, sameDeadline } from "@/lib/deadlines";
import { istToday } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_IMAGE = 4 * 1024 * 1024; // base64 characters; Vercel caps the body at 4.5 MB

/**
 * Read the deadlines out of a WhatsApp message, an exported group chat or a
 * screenshot of the ERP. Nothing is saved here: the student checks the list
 * and saves what's right (saveCaught), so a misread date never lands silently.
 *
 * POST /api/catch  { text?: string, image?: { data: base64, mediaType }, stash?: id }
 *   → { items: [{ title, subject, due_date, due_time, kind, quote, in_planner, on_board }] }
 * `stash` is a chat the Android share sheet sent to /api/share, parked in the
 * student's own vault folder. Works with the web cookie or a mobile bearer token.
 */
export async function POST(req: Request) {
  const { db, user } = await requestAuth(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as {
    text?: string;
    image?: { data?: string; mediaType?: string };
    stash?: string;
  };
  let text = typeof body.text === "string" ? body.text : "";
  if (body.stash) {
    if (!/^[a-z0-9]{6,40}$/.test(body.stash)) return Response.json({ error: "Bad stash" }, { status: 400 });
    const path = `${user.id}/_catch/${body.stash}.txt`;
    const { data } = await db.storage.from("vault").download(path);
    if (!data) return Response.json({ error: "That shared message has already been read. Share it again." }, { status: 404 });
    text = await data.text();
    await db.storage.from("vault").remove([path]);
  }
  const image =
    body.image?.data && /^image\/(png|jpe?g|webp|heic|heif)$/.test(body.image.mediaType ?? "") && body.image.data.length <= MAX_IMAGE
      ? { data: body.image.data, mediaType: body.image.mediaType! }
      : undefined;
  if (body.image && !image) return Response.json({ error: "Send a PNG, JPEG or WebP screenshot under 3 MB." }, { status: 400 });
  if (!text.trim() && !image) return Response.json({ error: "Paste a message or add a screenshot." }, { status: 400 });

  const { data: prof } = await db.from("profiles").select("gemini_key, cohort_id").eq("id", user.id).maybeSingle();
  const resolved = resolveModel(decrypt(prof?.gemini_key ?? null));
  if (!resolved) return Response.json({ error: "Reading messages needs an AI key. Add your free Gemini key in Settings." }, { status: 501 });
  if (image && !resolved.vision) return Response.json({ error: "This server's AI can't read screenshots. Paste the text instead." }, { status: 400 });
  if (!resolved.own && (await takeSharedAsk(user.id)) < 0) {
    return Response.json(
      { error: `That's today's ${SHARED_ASK_DAILY} free AI uses on the shared key. Add your own free Gemini key in Settings for no limit.` },
      { status: 429 },
    );
  }

  const today = istToday();
  const { data: subjects } = await db.from("subjects").select("slug, name, short_name, code, teacher").order("sort_order");
  let items;
  try {
    items = await extractDeadlines({ model: resolved.model, today, subjects: subjects ?? [], text, image });
  } catch (e) {
    console.error("catch: extract failed", e);
    return Response.json({ error: "Couldn't read that just now. Try again in a minute." }, { status: 502 });
  }
  if (!items.length) return Response.json({ items: [] });

  // already on your Planner, or already posted to the class board?
  const dates = [...new Set(items.map((i) => i.due_date))];
  const [{ data: tasks }, board] = await Promise.all([
    db.from("tasks").select("title, due_date").in("due_date", dates),
    prof?.cohort_id
      ? db.from("posts").select("id, title, due_date").eq("cohort_id", prof.cohort_id).in("due_date", dates)
      : Promise.resolve({ data: [] as { id: string; title: string; due_date: string }[] }),
  ]);
  return Response.json({
    items: items.map((i) => ({
      ...i,
      in_planner: (tasks ?? []).some((t) => sameDeadline(t, i)),
      // before migration 014 the board has no due dates; the query errors and nothing matches
      on_board: (board.data ?? []).find((p) => sameDeadline(p, i))?.id ?? null,
    })),
  });
}
