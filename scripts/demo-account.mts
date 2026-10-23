// A demo student for pitches and live demos, so nobody's real data is on a
// projector: `npx tsx --env-file=.env.local scripts/demo-account.mts`.
//
// Makes demo.student.26@gg.iilm.edu through the normal sign-up (dev server on
// :3000), its password saved as DEMO_PASSWORD in .env.local, then fills seven
// weeks of a believable term: classes marked (~85% attended), the first third
// of each subject started, and a week of study sessions. Re-running keeps the
// account and rewrites only those rows. Goals come from the app's own
// "Plan all end-sems" button, not from here.
//
// The data is made up. It is for showing the product, never for numbers:
// `npm run stats` leaves this account out.
import { createClient } from "@supabase/supabase-js";
import { randomBytes } from "node:crypto";
import { appendFileSync, readFileSync } from "node:fs";
import { holidayOn } from "../src/lib/holidays";

export const DEMO_EMAIL = "demo.student.26@gg.iilm.edu";
const FROM = "2026-09-07"; // the timetable's w.e.f. date
const GROUP = 2;

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { persistSession: false },
});

// the same numbers every run, so screenshots don't shift between takes
let seed = 26;
const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
const ist = (d = new Date()) => new Date(d.getTime() + 330 * 60_000).toISOString().slice(0, 10);

const { data: list } = await db.auth.admin.listUsers({ perPage: 1000 });
let user = list?.users.find((u) => u.email === DEMO_EMAIL);
if (!user) {
  const password = randomBytes(9).toString("base64url");
  const res = await fetch("http://localhost:3000/api/signup", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: DEMO_EMAIL, password, group: GROUP }),
  });
  if (!res.ok) throw new Error(`sign-up failed: ${await res.text()}`);
  if (!/^DEMO_PASSWORD=/m.test(readFileSync(".env.local", "utf8"))) {
    appendFileSync(".env.local", `\n# demo student for pitches (scripts/demo-account.mts)\nDEMO_PASSWORD=${password}\n`);
  }
  const { data: again } = await db.auth.admin.listUsers({ perPage: 1000 });
  user = again!.users.find((u) => u.email === DEMO_EMAIL)!;
  console.log("created", DEMO_EMAIL, "(password in .env.local as DEMO_PASSWORD)");
}
const uid = user.id;
await db.from("profiles").update({ display_name: "Aarav" }).eq("id", uid);

// ── classes: every slot from the timetable's start to yesterday ──────
const { data: slots } = await db.from("timetable_slots").select("id, day, subject_id, lab_group").eq("user_id", uid);
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const marks: Record<string, unknown>[] = [];
for (let d = new Date(FROM + "T00:00:00Z"); ist(d) < ist(); d = new Date(d.getTime() + 86_400_000)) {
  const date = d.toISOString().slice(0, 10);
  if (holidayOn(date)) continue;
  for (const s of slots ?? []) {
    if (s.day !== DAYS[d.getUTCDay()] || (s.lab_group && s.lab_group !== GROUP)) continue;
    marks.push({ user_id: uid, on_date: date, slot_id: s.id, subject_id: s.subject_id, attended: rand() < 0.86 });
  }
}
await db.from("class_marks").delete().eq("user_id", uid);
const { error: mErr } = await db.from("class_marks").insert(marks);
if (mErr) throw mErr;

// ── topics: the first third of each subject under way ────────────────
const { data: topics } = await db.from("topics").select("id, subject_id, sort_order").eq("user_id", uid).order("sort_order");
const bySubject = new Map<string, { id: string }[]>();
for (const t of topics ?? []) bySubject.set(t.subject_id, [...(bySubject.get(t.subject_id) ?? []), t]);
await db.from("topics").update({ status: "not_started", confidence: 0, last_studied_at: null }).eq("user_id", uid);
let started = 0;
for (const ts of bySubject.values()) {
  for (const t of ts.slice(0, Math.round(ts.length * 0.33))) {
    const days = 2 + Math.floor(rand() * 30);
    await db
      .from("topics")
      .update({
        status: rand() < 0.6 ? "learning" : "revising",
        confidence: 2 + Math.floor(rand() * 3),
        last_studied_at: new Date(Date.now() - days * 86_400_000).toISOString(),
      })
      .eq("id", t.id);
    started++;
  }
}

// ── a week of study ──────────────────────────────────────────────────
const subjects = [...bySubject.keys()];
const sessions: Record<string, unknown>[] = [];
for (let back = 7; back >= 1; back--) {
  for (let n = 0; n < 1 + Math.floor(rand() * 2); n++) {
    const minutes = 35 + Math.floor(rand() * 60);
    const start = new Date(Date.now() - back * 86_400_000 - (3 + n * 2) * 3_600_000);
    sessions.push({
      user_id: uid,
      subject_id: subjects[Math.floor(rand() * subjects.length)],
      started_at: start.toISOString(),
      ended_at: new Date(start.getTime() + minutes * 60_000).toISOString(),
      minutes,
      kind: "learn",
      note: "demo",
    });
  }
}
await db.from("study_sessions").delete().eq("user_id", uid);
const { error: sErr } = await db.from("study_sessions").insert(sessions);
if (sErr) throw sErr;

const attended = marks.filter((m) => m.attended).length;
console.log(`classes ${attended}/${marks.length} · topics started ${started} · sessions ${sessions.length}`);
