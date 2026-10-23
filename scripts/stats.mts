// Section-wide numbers for a pitch or a progress check — counts only, never
// who did what. `npx tsx scripts/stats.mts [days]` (default 7).
//
// "Active" = did something real in the window: ticked a study block, logged a
// study session or marked a class. A remembered login doesn't count.
import { createClient } from "@supabase/supabase-js";

const days = Number(process.argv[2]) || 7;
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { persistSession: false },
});
const since = new Date(Date.now() - days * 86_400_000);
const sinceIso = since.toISOString();
const sinceDay = sinceIso.slice(0, 10);

const { data: auth } = await db.auth.admin.listUsers({ perPage: 1000 });
// the demo student (scripts/demo-account.mts) is made-up data: never counted
const DEMO = "demo.student.26@gg.iilm.edu";
const users = (auth?.users ?? []).filter((u) => u.email !== DEMO);
const demoId = auth?.users.find((u) => u.email === DEMO)?.id;
const newUsers = users.filter((u) => u.created_at >= sinceIso).length;

const [done, sessions, marks, goals] = await Promise.all([
  db.from("tasks").select("user_id").eq("status", "done").gte("completed_at", sinceIso),
  db.from("study_sessions").select("user_id, minutes").gte("started_at", sinceIso),
  db.from("class_marks").select("user_id").gte("on_date", sinceDay),
  db.from("goals").select("user_id").eq("status", "active"),
]);

const active = new Set<string>();
for (const r of [...(done.data ?? []), ...(sessions.data ?? []), ...(marks.data ?? [])]) if (r.user_id !== demoId) active.add(r.user_id);
const real = <T extends { user_id: string }>(rows: T[] | null) => (rows ?? []).filter((r) => r.user_id !== demoId);
const minutes = real(sessions.data).reduce((n, s) => n + (s.minutes ?? 0), 0);
const planned = new Set(real(goals.data).map((g) => g.user_id)).size;

// shared-key Ask questions, from the daily counters in vault/_usage/<day>/
let asks = 0;
for (let i = 0; i < days; i++) {
  const day = new Date(Date.now() + 330 * 60_000 - i * 86_400_000).toISOString().slice(0, 10);
  const { data: files } = await db.storage.from("vault").list(`_usage/${day}`);
  for (const f of (files ?? []).filter((f) => f.name !== `${demoId}.json`)) {
    const { data } = await db.storage.from("vault").download(`_usage/${day}/${f.name}`);
    if (data) asks += Number((JSON.parse(await data.text()) as { used?: number }).used) || 0;
  }
}

console.log(`last ${days} days`);
console.log(`  accounts           ${users.length} (${newUsers} new)`);
console.log(`  active students    ${active.size}`);
console.log(`  with an exam plan  ${planned}`);
console.log(`  blocks ticked      ${real(done.data).length}`);
console.log(`  study minutes      ${minutes}`);
console.log(`  classes marked     ${real(marks.data).length}`);
console.log(`  Ask questions      ${asks} (shared key only)`);
