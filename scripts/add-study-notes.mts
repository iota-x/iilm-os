/**
 * npx tsx scripts/add-study-notes.mts [--apply] [--refresh]
 *
 * Puts the study notes in content/study-notes/<subject>.json into the
 * SEED_EMAIL account: one note per mid-sem topic (on that topic) and a pinned
 * one-page revision sheet per unit. Tagged "study-notes".
 *
 * Re-running adds only what's missing. --refresh also rewrites notes that
 * still match what this script last wrote — a note you've edited in the app
 * is never overwritten. Dry run unless --apply.
 */
import { config } from "dotenv";
config({ path: [".env.local", ".env"] });
import { createClient } from "@supabase/supabase-js";
import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const apply = process.argv.includes("--apply");
const refresh = process.argv.includes("--refresh");
const TAG = "study-notes";
const DIR = join(process.cwd(), "content/study-notes");
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { persistSession: false },
});

type FileNote = { topic: string | null; unit: number | null; title: string; content: string; pinned: boolean };
// the hash of what we wrote rides along as a second tag, so --refresh can
// tell an untouched note from one edited in the app
const hashTag = (content: string) => `sn:${createHash("sha1").update(content).digest("hex").slice(0, 10)}`;

async function main() {
  const { data: users } = await db.auth.admin.listUsers({ perPage: 1000 });
  const me = users!.users.find((u) => u.email?.toLowerCase() === process.env.SEED_EMAIL?.toLowerCase());
  if (!me) throw new Error("SEED_EMAIL account not found");

  const [{ data: subjects }, { data: units }, { data: topics }, { data: existing }] = await Promise.all([
    db.from("subjects").select("id, slug").eq("user_id", me.id),
    db.from("units").select("id, subject_id, number").eq("user_id", me.id),
    db.from("topics").select("id, code, unit_id, subject_id").eq("user_id", me.id),
    db.from("notes").select("id, subject_id, title, content, tags").eq("user_id", me.id).contains("tags", [TAG]),
  ]);
  const subjectBySlug = new Map((subjects ?? []).map((s) => [s.slug as string, s.id as string]));
  const topicByCode = new Map((topics ?? []).map((t) => [t.code as string, t]));
  const have = new Map((existing ?? []).map((n) => [`${n.subject_id}::${n.title}`, n]));

  let add = 0, upd = 0, kept = 0;
  for (const file of readdirSync(DIR).filter((f) => f.endsWith(".json")).sort()) {
    const { subject, notes } = JSON.parse(readFileSync(join(DIR, file), "utf8")) as { subject: string; notes: FileNote[] };
    const subjectId = subjectBySlug.get(subject);
    if (!subjectId) throw new Error(`no subject ${subject} — reseed first`);
    for (const n of notes) {
      const topic = n.topic ? topicByCode.get(n.topic) : null;
      if (n.topic && !topic) throw new Error(`no topic ${n.topic} — reseed first`);
      const unitId =
        topic?.unit_id ??
        (n.unit !== null ? (units ?? []).find((u) => u.subject_id === subjectId && u.number === n.unit)?.id : null) ??
        null;
      const row = {
        user_id: me.id,
        subject_id: subjectId,
        unit_id: unitId,
        topic_id: topic?.id ?? null,
        title: n.title,
        content: n.content,
        tags: [TAG, hashTag(n.content)],
        pinned: n.pinned,
      };
      const prev = have.get(`${subjectId}::${n.title}`);
      if (!prev) {
        add++;
        console.log(`  + ${subject.padEnd(30)} ${n.title}`);
        if (apply) {
          const { error } = await db.from("notes").insert(row);
          if (error) throw error;
        }
        continue;
      }
      const untouched = (prev.tags as string[]).includes(hashTag(prev.content as string));
      if (refresh && untouched && prev.content !== n.content) {
        upd++;
        console.log(`  ~ ${subject.padEnd(30)} ${n.title}`);
        if (apply) {
          const { error } = await db.from("notes").update({ ...row, updated_at: new Date().toISOString() }).eq("id", prev.id);
          if (error) throw error;
        }
      } else kept++;
    }
  }
  console.log(`\n${add} new, ${upd} refreshed, ${kept} left as they are${apply ? "" : " (dry run — add --apply)"}.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
