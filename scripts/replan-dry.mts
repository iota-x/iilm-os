// Read-only dry run of the Sprint "Replan" button on a real plan. Writes nothing.
// npx tsx --env-file=.env.local scripts/replan-dry.mts <email> [--holidays]
import { createClient } from "@supabase/supabase-js";
import { replan, PLAN_TAG, type ReplanTask } from "../src/lib/replan";
import { istToday } from "../src/lib/utils";

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
const { data: auth } = await db.auth.admin.listUsers({ perPage: 1000 });
const u = auth!.users.find((x) => x.email === process.argv[2])!;
const [tasks, days, subs, exams, sess] = await Promise.all([
  db.from("tasks").select("*").eq("user_id", u.id).eq("source", "plan"),
  db.from("plan_days").select("date,phase").eq("user_id", u.id),
  db.from("subjects").select("id,short_name").eq("user_id", u.id),
  db.from("exams").select("subject_id,exam_date").eq("user_id", u.id).eq("kind", "ese"),
  db.from("study_sessions").select("task_id").eq("user_id", u.id),
]);
const { tenantOf } = await import("../src/lib/universities");
const { data: prof } = await db.from("profiles").select("*").eq("id", u.id).single();
const holidays = tenantOf(prof).calendar.holidays;
const hasSession = new Set((sess.data ?? []).map((s) => s.task_id));
const name = Object.fromEntries(subs.data!.map((s) => [s.id, s.short_name]));
const es: ReplanTask[] = tasks.data!
  .filter((t) => (t.detail ?? "").includes(PLAN_TAG))
  .map((t) => ({ ...t, movable: t.status === "todo" && !hasSession.has(t.id), done: t.status === "done" }));
const papers = Object.fromEntries(exams.data!.filter((e) => e.subject_id && e.exam_date).map((e) => [e.subject_id, e.exam_date]));
const r = replan({
  today: istToday(), tasks: es, papers, holidays,
  phaseByDate: Object.fromEntries(days.data!.map((d) => [d.date, d.phase])),
  useHolidays: process.argv.includes("--holidays"), keepAll: process.argv.includes("--keep"),
});
console.log("today", istToday(), "holidays", JSON.stringify(holidays.filter((h) => h.to >= istToday())));
console.log(`${r.movableCount} blocks to move, ${(r.movableMinutes / 60).toFixed(1)} h; mode ${r.mode}; over at normal budget ${(r.overMinutes / 60).toFixed(1)} h; new body ends ${r.endsOn}; stayed ${r.stayed}; left out ${r.leftOut.length}`);
for (const d of r.days) console.log(d.date, d.isExam ? "EXAM" : d.isHoliday ? "hol " : "    ", `${d.minutes}/${d.budget}`, d.over ? "OVER" : "", d.subjects.map((s) => name[s]).join("+"));
console.log("left out:", r.leftOut.map((t) => `${name[t.subject_id!]}: ${t.title}`));
const track = tasks.data!.filter((t) => t.status === "todo" && t.due_date < istToday() && (t.topic_codes ?? []).some((c: string) => c.startsWith("track:")));
console.log("old missed DSA/GSoC todo:", track.length);
