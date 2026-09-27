/**
 * npx tsx scripts/attach-notes.mts [--apply]
 *
 * Puts the pages of handed-out notes and decks on the topics they teach, in
 * the SEED_EMAIL account. Page ranges come from src/data/coverage.ts, so the
 * pictures on a topic page are exactly the pages its "In your notes" card
 * cites. Images are pre-rendered into ~/Desktop/iilm/<subject>/slides/.
 *
 * Stored under <user>/notes/<topic>/… — that prefix keeps them out of the
 * inbox and the photo wall (see getInboxFiles). Re-running skips pages that
 * are already there. Dry run unless --apply.
 */
import { config } from "dotenv";
config({ path: [".env.local", ".env"] });
import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { coverage } from "../src/data/coverage";

const apply = process.argv.includes("--apply");
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { persistSession: false },
});

// which notes have page images, where they are, and when the class got them
const DECKS: Record<string, { dir: string; image: (n: number) => string; label: string; takenAt: string }> = {
  "DENotes.pdf": {
    dir: "digital_electronics/slides",
    image: (n) => `DENotes-p${String(n).padStart(2, "0")}.jpg`,
    label: "DENotes p.",
    takenAt: "2026-09-22T12:00:00+05:30",
  },
  "Unit_2_Two_Variable_Calculus.pptx": {
    dir: "applied_calculus/slides",
    image: (n) => `Unit2-s${String(n).padStart(2, "0")}.jpg`,
    label: "Unit 2 deck, slide",
    takenAt: "2026-09-25T12:00:00+05:30",
  },
};

/** "p. 19", "pp. 26–29", "slide 79", "slides 4–16" → page numbers */
function pages(where: string): number[] {
  const m = where.match(/(\d+)(?:\s*[–-]\s*(\d+))?/);
  if (!m) return [];
  const a = Number(m[1]);
  const b = m[2] ? Number(m[2]) : a;
  return Array.from({ length: b - a + 1 }, (_, i) => a + i);
}

async function main() {
  const { data: users, error } = await db.auth.admin.listUsers({ perPage: 1000 });
  if (error) throw error;
  const me = users.users.find((u) => u.email?.toLowerCase() === process.env.SEED_EMAIL?.toLowerCase());
  if (!me) throw new Error("SEED_EMAIL account not found");

  const { data: topics } = await db.from("topics").select("id, code, subject_id").eq("user_id", me.id);
  const topicByCode = new Map((topics ?? []).map((t) => [t.code as string, t]));
  const { data: existing } = await db.from("attachments").select("storage_path").eq("user_id", me.id).like("storage_path", "%/notes/%");
  const have = new Set((existing ?? []).map((a) => a.storage_path as string));

  let added = 0;
  let skipped = 0;
  for (const [code, cov] of Object.entries(coverage)) {
    const topic = topicByCode.get(code);
    for (const src of cov.sources) {
      const deck = DECKS[src.file];
      if (!deck) continue; // text-only handouts have no page images
      if (!topic) {
        console.log(`  ! ${code}: no such topic in the account — reseed first`);
        continue;
      }
      for (const n of pages(src.where)) {
        const file = deck.image(n);
        const local = join(homedir(), "Desktop/iilm", deck.dir, file);
        const path = `${me.id}/notes/${code}/${file}`;
        if (have.has(path)) {
          skipped++;
          continue;
        }
        if (!existsSync(local)) {
          console.log(`  ! missing image ${local}`);
          continue;
        }
        const caption = `${deck.label} ${n}${src.what ? ` — ${src.what}` : ""}`;
        console.log(`  + ${code.padEnd(26)} ${file}`);
        added++;
        if (!apply) continue;
        const body = readFileSync(local);
        const up = await db.storage.from("vault").upload(path, body, { contentType: "image/jpeg", upsert: true });
        if (up.error) throw new Error(`${path}: ${up.error.message}`);
        const ins = await db.from("attachments").insert({
          user_id: me.id,
          subject_id: topic.subject_id,
          topic_id: topic.id,
          storage_path: path,
          filename: file,
          mime: "image/jpeg",
          size_bytes: statSync(local).size,
          caption,
          taken_at: deck.takenAt,
        });
        if (ins.error) throw new Error(`${path}: ${ins.error.message}`);
        have.add(path);
      }
    }
  }
  console.log(`\n${added} ${apply ? "attached" : "to attach (dry run — add --apply)"}, ${skipped} already there.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
