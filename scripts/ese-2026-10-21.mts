// One-off for the end-sem schedule out on 21-10-2026: upsert only the new "ese" exam rows
// for every account, instead of a full reseed. Dry run by default; --apply writes.
import { config } from "dotenv";
config({ path: [".env.local", ".env"] });
import { createClient } from "@supabase/supabase-js";
import { exams } from "../src/data/index.ts";
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
const ese = exams.filter((e) => e.kind === "ese");
const { data: subs, error } = await db.from("subjects").select("id, slug, user_id, semester_id");
if (error) throw error;
const users = [...new Set(subs!.map((s) => s.user_id))];
const rows = users.flatMap((uid) => {
  const mine = subs!.filter((s) => s.user_id === uid);
  return ese.map((e) => ({
    user_id: uid,
    semester_id: mine[0].semester_id,
    subject_id: e.subject ? mine.find((s) => s.slug === e.subject)!.id : null,
    key: e.key, name: e.name, kind: e.kind, exam_date: e.date, window_label: e.window,
    max_marks: e.maxMarks, weightage: e.weightage, scope: e.scope,
  }));
});
console.log(`${ese.length} end-sem exams × ${users.length} accounts = ${rows.length} rows`);
if (process.argv.includes("--apply")) {
  const { error: e2 } = await db.from("exams").upsert(rows, { onConflict: "user_id,key" });
  if (e2) throw e2;
  console.log("upserted");
}
