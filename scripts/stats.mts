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
const users = auth?.users ?? [];
const newUsers = users.filter((u) => u.created_at >= sinceIso).length;

const [done, sessions, marks, goals] = await Promise.all([
  db.from("tasks").select("user_id").eq("status", "done").gte("completed_at", sinceIso),
  db.from("study_sessions").select("user_id, minutes").gte("started_at", sinceIso),
  db.from("class_marks").select("user_id").gte("on_date", sinceDay),
  db.from("goals").select("user_id").eq("status", "active"),
]);

const active = new Set<string>();
for (const r of [...(done.data ?? []), ...(sessions.data ?? []), ...(marks.data ?? [])]) active.add(r.user_id);
const minutes = (sessions.data ?? []).reduce((n, s) => n + (s.minutes ?? 0), 0);
const planned = new Set((goals.data ?? []).map((g) => g.user_id)).size;

// shared-key Ask questions, from the daily counters in vault/_usage/<day>/
let asks = 0;
for (let i = 0; i < days; i++) {
  const day = new Date(Date.now() + 330 * 60_000 - i * 86_400_000).toISOString().slice(0, 10);
  const { data: files } = await db.storage.from("vault").list(`_usage/${day}`);
  for (const f of files ?? []) {
    const { data } = await db.storage.from("vault").download(`_usage/${day}/${f.name}`);
    if (data) asks += Number((JSON.parse(await data.text()) as { used?: number }).used) || 0;
  }
}

console.log(`last ${days} days`);
console.log(`  accounts           ${users.length} (${newUsers} new)`);
console.log(`  active students    ${active.size}`);
console.log(`  with an exam plan  ${planned}`);
console.log(`  blocks ticked      ${done.data?.length ?? 0}`);
console.log(`  study minutes      ${minutes}`);
console.log(`  classes marked     ${marks.data?.length ?? 0}`);
console.log(`  Ask questions      ${asks} (shared key only)`);
