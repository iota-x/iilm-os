/**
 * Pulls your notes out of Supabase into ./inbox/notes/ as plain markdown,
 * downloading any pasted screenshots alongside them.
 *
 *   npm run pull            # notes touched in the last 7 days
 *   npm run pull -- 30      # last 30 days
 *   npm run pull -- all     # everything
 *
 * The point is to give Claude something readable on disk, so it can turn
 * what you actually covered in class into checkpoints, questions and
 * corrections to the syllabus data. Nothing here writes to the database.
 */
import { config } from "dotenv";
config({ path: [".env.local", ".env"] });
import { createClient } from "@supabase/supabase-js";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !SERVICE) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const db = createClient(URL, SERVICE, { auth: { persistSession: false } });

const arg = process.argv[2] ?? "7";
const days = arg === "all" ? null : Number(arg);
if (days !== null && (!Number.isFinite(days) || days <= 0)) {
  console.error(`Expected a number of days or "all", got "${arg}"`);
  process.exit(1);
}

function slug(s: string) {
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60) || "untitled"
  );
}

async function main() {
  const OUT = join(process.cwd(), "inbox", "notes");
  await mkdir(OUT, { recursive: true });

  let q = db.from("notes").select("*").order("updated_at", { ascending: false });
  if (days !== null) {
    const since = new Date(Date.now() - days * 86_400_000).toISOString();
    q = q.gte("updated_at", since);
  }
  const { data: notes, error } = await q;
  if (error) {
    console.error("Could not read notes:", error.message);
    process.exit(1);
  }
  if (!notes?.length) {
    console.log(`No notes ${days === null ? "at all" : `touched in the last ${days} days`}.`);
    return;
  }

  const [{ data: subjects }, { data: topics }, { data: units }] = await Promise.all([
    db.from("subjects").select("id, name, short_name"),
    db.from("topics").select("id, title, code"),
    db.from("units").select("id, number, title"),
  ]);

  let images = 0;

  for (const n of notes) {
    const subject = subjects?.find((s) => s.id === n.subject_id);
    const topic = topics?.find((t) => t.id === n.topic_id);
    const unit = units?.find((u) => u.id === n.unit_id);

    const front = [
      `# ${n.title || "Untitled"}`,
      "",
      `- updated: ${n.updated_at}`,
      subject ? `- subject: ${subject.name}` : null,
      unit ? `- unit: Unit ${unit.number} — ${unit.title}` : null,
      topic ? `- topic: ${topic.title} (${topic.code})` : null,
      "",
      "---",
      "",
    ]
      .filter(Boolean)
      .join("\n");

    // pull down any screenshots this note references
    const { data: atts } = await db.from("attachments").select("*").eq("note_id", n.id);
    let body: string = n.content ?? "";

    for (const a of atts ?? []) {
      const { data: file, error: dlErr } = await db.storage
        .from("vault")
        .download(a.storage_path as string);
      if (dlErr || !file) continue;
      const name = `${slug(n.title || "note")}-${(a.filename as string) || "image.png"}`;
      await writeFile(join(OUT, name), Buffer.from(await file.arrayBuffer()));
      body = body.split(`/api/vault/${a.storage_path}`).join(`./${name}`);
      images++;
    }

    const file = `${n.updated_at.slice(0, 10)}-${slug(n.title || "untitled")}.md`;
    await writeFile(join(OUT, file), front + body + "\n");
  }

  console.log(
    `\nPulled ${notes.length} note${notes.length === 1 ? "" : "s"}` +
      (images ? ` and ${images} image${images === 1 ? "" : "s"}` : "") +
      ` into inbox/notes/`,
  );
  console.log("Point Claude at that folder and say what you want done with it.\n");
}

main();
