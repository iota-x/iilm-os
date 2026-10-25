/**
 * End-to-end check of migration 013 against the live database, as real
 * signed-in users (RLS and triggers included). Makes two students and a
 * teacher in the unused "Another programme" class, exercises everything,
 * then deletes all three — their posts, votes and papers go with them.
 *
 *   npx tsx --env-file=.env.local scripts/test-board-plus.mts
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { randomBytes } from "node:crypto";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const admin = createClient(URL, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
const COHORT = "iilm-gurugram/other";
const tag = randomBytes(3).toString("hex");
const made: string[] = [];
let failures = 0;

function check(name: string, ok: boolean, extra?: unknown) {
  console.log(`${ok ? "  ✓" : "  ✗"} ${name}${!ok && extra !== undefined ? `  → ${JSON.stringify(extra)}` : ""}`);
  if (!ok) failures++;
}

async function user(name: string, opts: { teacher?: boolean } = {}) {
  const email = `semwise-test-${name}-${tag}@example.com`;
  const password = randomBytes(12).toString("hex");
  const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { name } });
  if (error) throw error;
  made.push(data.user.id);
  const { error: pe } = await admin.from("profiles").update({
    display_name: `Test ${name}`,
    university_id: "iilm-gurugram",
    cohort_id: opts.teacher ? null : COHORT,
    is_faculty: Boolean(opts.teacher),
    faculty_status: opts.teacher ? "approved" : null,
  }).eq("id", data.user.id);
  if (pe) throw pe;
  const db = createClient(URL, ANON, { auth: { persistSession: false } });
  const { error: se } = await db.auth.signInWithPassword({ email, password });
  if (se) throw se;
  return { id: data.user.id, db };
}

async function points(db: SupabaseClient, id: string) {
  const { data } = await db.rpc("class_points", { since: null });
  return (data ?? []).find((r: { user_id: string }) => r.user_id === id)?.points ?? 0;
}

async function main() {
  const a = await user("a");
  const b = await user("b");
  const t = await user("teacher", { teacher: true });

  console.log("profile guard");
  await a.db.from("profiles").update({ is_admin: true, is_faculty: true, cohort_id: "iilm-gurugram/btech-cse-2026/s1/e" }).eq("id", a.id);
  const { data: ap } = await admin.from("profiles").select("is_admin, is_faculty, cohort_id").eq("id", a.id).single();
  check("a student can't make themselves admin, teacher, or change class", !ap!.is_admin && !ap!.is_faculty && ap!.cohort_id === COHORT, ap);

  console.log("posts, points, pin/verify guard");
  const { data: res, error: re } = await a.db.from("posts").insert({ user_id: a.id, title: `test resource ${tag}`, kind: "resource", pinned: true, verified_by: a.id }).select("id, pinned, verified_by").single();
  check("post created", !re, re);
  check("author can't pin or verify their own post", res?.pinned === false && res?.verified_by === null, res);
  await b.db.from("post_votes").insert({ post_id: res!.id, user_id: b.id });
  check("a Helpful from a classmate is a brownie point", (await points(b.db, a.id)) === 1);
  await a.db.from("post_votes").insert({ post_id: res!.id, user_id: a.id });
  check("voting for yourself earns nothing", (await points(b.db, a.id)) === 1);

  console.log("anonymous questions");
  const { data: anonId, error: ae } = await a.db.rpc("create_anonymous_post", { p_title: `anon q ${tag}`, p_body: "", p_subject: "" });
  check("anonymous post created", !ae && typeof anonId === "string", ae);
  const { data: seenByB } = await b.db.from("posts").select("user_id, anonymous").eq("id", anonId).single();
  check("classmates see no author", seenByB?.user_id === null && seenByB?.anonymous === true, seenByB);
  const { data: ownersB } = await b.db.from("post_owners").select("user_id").eq("post_id", anonId);
  check("classmates can't read who wrote it", (ownersB ?? []).length === 0);
  const { data: ownersA } = await a.db.from("post_owners").select("user_id").eq("post_id", anonId);
  check("the author can", ownersA?.[0]?.user_id === a.id);
  const { error: delB } = await b.db.from("posts").delete().eq("id", anonId);
  const { data: still } = await admin.from("posts").select("id").eq("id", anonId);
  check("a classmate can't delete it", !delB && (still ?? []).length === 1);

  console.log("teachers");
  const { data: n, error: te } = await t.db.rpc("teacher_post", { p_title: `notice ${tag}`, p_body: "read me", p_kind: "notice", p_cohorts: [COHORT] });
  check("teacher posts to a class", !te && n === 1, te ?? n);
  const { error: se } = await a.db.rpc("teacher_post", { p_title: "x", p_body: "", p_kind: "notice", p_cohorts: [COHORT] });
  check("a student can't use teacher_post", Boolean(se));
  const { error: ve } = await t.db.rpc("set_post_verified", { p_id: res!.id, p_on: true });
  const { data: vr } = await b.db.from("posts").select("verified_by").eq("id", res!.id).single();
  check("teacher verifies a post the class can see", !ve && vr?.verified_by === t.id, ve ?? vr);
  const { data: tn } = await b.db.from("member_names").select("is_faculty").eq("id", t.id).single();
  check("students see the teacher marked as a teacher", tn?.is_faculty === true, tn);

  console.log("notice read receipts");
  const { data: notice } = await b.db.from("posts").select("id").eq("title", `notice ${tag}`).single();
  await b.db.from("post_reads").insert({ post_id: notice!.id, user_id: b.id });
  const { data: rB } = await b.db.rpc("notice_reach", { p_id: notice!.id });
  check("seen 1 of 2, and a student sees no names", rB?.[0]?.seen === 1 && rB?.[0]?.total === 2 && rB?.[0]?.can_see_names === false, rB);
  const { data: rT } = await t.db.rpc("notice_reach", { p_id: notice!.id });
  check("the teacher sees who hasn't read it", JSON.stringify(rT?.[0]?.unseen) === JSON.stringify(["Test a"]), rT);

  console.log("past papers and events");
  const { data: paper, error: pe } = await a.db.from("papers").insert({ user_id: a.id, subject_slug: "applied-calculus", year: 2025, exam: "end-sem", url: "https://example.com/p.pdf" }).select("id").single();
  check("paper added", !pe, pe);
  await b.db.from("paper_votes").insert({ paper_id: paper!.id, user_id: b.id });
  check("a vote on your paper is a point too", (await points(b.db, a.id)) === 2);
  const { data: ev, error: ee } = await a.db.from("events").insert({ user_id: a.id, title: `event ${tag}`, starts_at: new Date(Date.now() + 86400_000).toISOString() }).select("id").single();
  check("event posted", !ee, ee);
  await b.db.from("event_rsvps").insert({ event_id: ev!.id, user_id: b.id });
  const { data: evB } = await b.db.from("events").select("id, event_rsvps(count)").eq("id", ev!.id).single();
  check("classmate sees it and is going", (evB?.event_rsvps as { count: number }[])?.[0]?.count === 1, evB);
  await admin.from("events").delete().eq("id", ev!.id);

  console.log("existing goal tasks still allowed");
  const { error: ge } = await a.db.from("tasks").insert({ user_id: a.id, title: "t", source: "goal" });
  check("tasks.source 'goal' still valid", !ge, ge);
}

main()
  .catch((e) => {
    console.error(e);
    failures++;
  })
  .finally(async () => {
    // anonymous posts have no user_id, so deleting the users wouldn't take them
    await admin.from("posts").delete().eq("cohort_id", COHORT).like("title", `%${tag}%`);
    for (const id of made) await admin.auth.admin.deleteUser(id);
    console.log(`\ncleaned up ${made.length} test accounts — ${failures ? `${failures} FAILED` : "all passed"}`);
    process.exit(failures ? 1 : 0);
  });
