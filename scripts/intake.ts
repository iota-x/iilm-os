/**
 * npm run intake [--all]
 *
 * Pulls the inbox out of the app onto disk so Claude can read it: every
 * photo and PDF that hasn't been placed on a topic yet is downloaded to
 * inbox/<subject>/, named by when it was taken, and listed in
 * inbox/_index.md with the class it was filed to and an empty topic column.
 *
 * Photos get into the app from the phone (share sheet or /inbox), and the
 * app already knows when each was taken and which lecture that was. This
 * script just brings that ledger somewhere readable. Nothing here writes
 * to the database — placing a photo on a topic happens in the app.
 *
 * --all includes photos that are already placed.
 */

import { config } from "dotenv";
config({ path: [".env.local", ".env"] });

import { createClient } from "@supabase/supabase-js";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
);

const ROOT = join(process.cwd(), "inbox");
const includePlaced = process.argv.includes("--all");

type Row = {
  id: string;
  storage_path: string;
  filename: string | null;
  mime: string | null;
  caption: string | null;
  taken_at: string | null;
  created_at: string;
  subject_id: string | null;
  slot_id: string | null;
  topic_id: string | null;
};

function pad(n: number) {
  return String(n).padStart(2, "0");
}
function stamp(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}`;
}
function fmtTime(t: string) {
  return t.slice(0, 5);
}

async function main() {
  const [{ data: rows, error }, { data: subjects }, { data: slots }, { data: topics }] =
    await Promise.all([
      db
        .from("attachments")
        .select("id, storage_path, filename, mime, caption, taken_at, created_at, subject_id, slot_id, topic_id")
        .is("note_id", null)
        .order("taken_at", { ascending: true, nullsFirst: false }),
      db.from("subjects").select("id, short_name, slug"),
      db.from("timetable_slots").select("id, day, start_time, end_time, kind, room"),
      db.from("topics").select("id, code, title"),
    ]);
  if (error) throw error;

  const subjectById = new Map((subjects ?? []).map((s) => [s.id, s]));
  const slotById = new Map((slots ?? []).map((s) => [s.id, s]));
  const topicById = new Map((topics ?? []).map((t) => [t.id, t]));

  const wanted = (rows as Row[]).filter((r) => includePlaced || !r.topic_id);
  if (!wanted.length) {
    console.log("Inbox is empty — nothing waiting to be placed.");
    return;
  }

  const lines = [
    "# Inbox — what's waiting to be placed",
    "",
    `Pulled from the app by \`npm run intake\`. ${wanted.length} file${wanted.length === 1 ? "" : "s"}${includePlaced ? " (including placed)" : " not yet on a topic"}.`,
    "",
    "| taken | class | file | caption | topic |",
    "|---|---|---|---|---|",
  ];

  let downloaded = 0;
  for (const r of wanted) {
    const subject = r.subject_id ? subjectById.get(r.subject_id) : null;
    const slot = r.slot_id ? slotById.get(r.slot_id) : null;
    const topic = r.topic_id ? topicById.get(r.topic_id) : null;
    const when = r.taken_at ?? r.created_at;

    const folder = join(ROOT, subject?.slug ?? "_unfiled");
    mkdirSync(folder, { recursive: true });
    const ext = (r.filename ?? r.storage_path).split(".").pop() || "bin";
    const local = join(folder, `${stamp(when)}_${r.id.slice(0, 8)}.${ext}`);

    if (!existsSync(local)) {
      const { data, error: dlErr } = await db.storage.from("vault").download(r.storage_path);
      if (dlErr || !data) {
        console.log(`  ! couldn't download ${r.storage_path}: ${dlErr?.message}`);
        continue;
      }
      writeFileSync(local, Buffer.from(await data.arrayBuffer()));
      downloaded++;
    }

    const klass = slot
      ? `${subject?.short_name ?? "?"} ${slot.kind} ${slot.day} ${fmtTime(slot.start_time)}`
      : subject
        ? `${subject.short_name} (no class matched)`
        : "unfiled";
    lines.push(
      `| ${when.slice(0, 16).replace("T", " ")} | ${klass} | \`${local.replace(process.cwd() + "/", "")}\` | ${r.caption ?? ""} | ${topic ? `${topic.code} — ${topic.title}` : ""} |`,
    );
  }

  lines.push("", "Place a file by giving its attachment id a topic_id in the app (Claude does this via the vault); `--all` shows placed ones too.", "");
  mkdirSync(ROOT, { recursive: true });
  writeFileSync(join(ROOT, "_index.md"), lines.join("\n"));
  console.log(`  ${wanted.length} in the ledger, ${downloaded} newly downloaded → inbox/_index.md`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
