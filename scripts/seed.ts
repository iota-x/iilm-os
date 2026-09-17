/**
 * Pushes src/data/* into Supabase.
 *
 *   npm run seed
 *
 * Idempotent — re-run it any time you edit the syllabus files (e.g. after the
 * Digital Electronics course plan turns up). It upserts by natural key and
 * never touches your notes, tasks, marks or screenshots.
 */
import { config } from "dotenv";
config({ path: [".env.local", ".env"] });
import { createClient } from "@supabase/supabase-js";
import { subjects, SEMESTER, exams } from "../src/data";
import { slots } from "../src/data/timetable";
import { resources } from "../src/data/resources";
import { planDays } from "../src/data/plan";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const EMAIL = process.env.SEED_EMAIL;
const PASSWORD = process.env.SEED_PASSWORD;

if (!URL || !SERVICE) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}
if (!EMAIL) {
  console.error("Missing SEED_EMAIL in .env.local");
  process.exit(1);
}

const db = createClient(URL, SERVICE, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const ok = (label: string, n?: number) =>
  console.log(`  \x1b[32m✓\x1b[0m ${label}${n !== undefined ? ` \x1b[2m(${n})\x1b[0m` : ""}`);

function die(label: string, error: unknown): never {
  console.error(`\n  \x1b[31m✗\x1b[0m ${label}`);
  console.error(error);
  process.exit(1);
}

async function getOrCreateUser(): Promise<string> {
  const { data: list, error: listErr } = await db.auth.admin.listUsers({ perPage: 200 });
  if (listErr) die("listing users", listErr);
  const existing = list.users.find((u) => u.email?.toLowerCase() === EMAIL!.toLowerCase());
  if (existing) {
    ok(`user ${EMAIL} (existing)`);
    return existing.id;
  }
  if (!PASSWORD) {
    die(
      "creating user",
      `No user with email ${EMAIL} exists and SEED_PASSWORD is not set. Either sign up in the app first, or set SEED_PASSWORD in .env.local.`,
    );
  }
  const { data, error } = await db.auth.admin.createUser({
    email: EMAIL!,
    password: PASSWORD,
    email_confirm: true,
  });
  if (error) die("creating user", error);
  ok(`user ${EMAIL} (created)`);
  return data.user!.id;
}

async function main() {
  console.log("\n\x1b[1mSeeding IILM OS\x1b[0m\n");

  const userId = await getOrCreateUser();

  // profile
  await db
    .from("profiles")
    .upsert({ id: userId, display_name: "Manvendra", lab_group: 2 }, { onConflict: "id" });
  ok("profile");

  // ─── semester ─────────────────────────────────────────────────────
  const { data: sem, error: semErr } = await db
    .from("semesters")
    .upsert(
      {
        user_id: userId,
        name: SEMESTER.name,
        number: SEMESTER.number,
        section: SEMESTER.section,
        batch: SEMESTER.batch,
        session_label: SEMESTER.session,
        university: SEMESTER.university,
        school: SEMESTER.school,
        start_date: SEMESTER.startDate,
        is_active: true,
      },
      { onConflict: "user_id,number" },
    )
    .select()
    .single();
  if (semErr) die("semester", semErr);
  const semesterId = sem!.id as string;
  ok("semester");

  // ─── subjects and their children ──────────────────────────────────
  const subjectIdBySlug: Record<string, string> = {};
  const unitIdByKey: Record<string, string> = {};
  const topicIdByCode: Record<string, string> = {};

  for (const [i, s] of subjects.entries()) {
    const { data: sub, error } = await db
      .from("subjects")
      .upsert(
        {
          user_id: userId,
          semester_id: semesterId,
          slug: s.slug,
          name: s.name,
          short_name: s.shortName,
          code: s.code,
          credits: s.credits,
          ltpc: s.ltpc,
          color: s.color,
          status: s.status,
          teacher: s.teacher,
          lab_teacher: s.labTeacher ?? null,
          has_lab: s.hasLab,
          lab_title: s.labTitle ?? null,
          lab_code: s.labCode ?? null,
          lab_ltpc: s.labLtpc ?? null,
          overview: s.overview,
          midsem_scope: s.midsemScope,
          midsem_confirmed: s.midsemConfirmed,
          objectives: s.objectives,
          gaps: s.gaps,
          local_files: s.localFiles,
          sort_order: i,
        },
        { onConflict: "semester_id,slug" },
      )
      .select()
      .single();
    if (error) die(`subject ${s.slug}`, error);
    const subjectId = sub!.id as string;
    subjectIdBySlug[s.slug] = subjectId;

    // outcomes
    if (s.outcomes.length) {
      const { error: e } = await db.from("outcomes").upsert(
        s.outcomes.map((o) => ({
          user_id: userId,
          subject_id: subjectId,
          code: o.code,
          text: o.text,
          bloom: o.bloom,
        })),
        { onConflict: "subject_id,code" },
      );
      if (e) die(`outcomes ${s.slug}`, e);
    }

    // units + topics
    for (const u of s.units) {
      const { data: unit, error: ue } = await db
        .from("units")
        .upsert(
          {
            user_id: userId,
            subject_id: subjectId,
            number: u.number,
            title: u.title,
            sessions: u.sessions,
            co: u.co,
            assessment: u.assessment,
            in_midsem: u.inMidsem,
            sort_order: u.number,
          },
          { onConflict: "subject_id,number" },
        )
        .select()
        .single();
      if (ue) die(`unit ${s.slug} U${u.number}`, ue);
      const unitId = unit!.id as string;
      unitIdByKey[`${s.slug}-u${u.number}`] = unitId;

      if (u.topics.length) {
        const { data: rows, error: te } = await db
          .from("topics")
          .upsert(
            u.topics.map((t, j) => ({
              user_id: userId,
              subject_id: subjectId,
              unit_id: unitId,
              code: t.code,
              session: t.session,
              title: t.title,
              weight: t.weight,
              in_midsem: t.inMidsem,
              outcome: t.outcome ?? null,
              sort_order: j,
            })),
            { onConflict: "user_id,code" },
          )
          .select("id, code");
        if (te) die(`topics ${s.slug} U${u.number}`, te);
        for (const r of rows ?? []) topicIdByCode[r.code as string] = r.id as string;
      }
    }

    // experiments
    if (s.experiments.length) {
      const { error: e } = await db.from("experiments").upsert(
        s.experiments.map((x) => ({
          user_id: userId,
          subject_id: subjectId,
          number: x.number,
          title: x.title,
          co: x.co,
          objective: x.objective,
          tasks: x.tasks,
          in_midsem: x.inMidsem,
        })),
        { onConflict: "subject_id,number" },
      );
      if (e) die(`experiments ${s.slug}`, e);
    }

    // components, strategies and books are replace-on-seed (no natural key)
    await db.from("components").delete().eq("subject_id", subjectId);
    if (s.components.length) {
      const { error: e } = await db.from("components").insert(
        s.components.map((c, j) => ({
          user_id: userId,
          subject_id: subjectId,
          name: c.name,
          marks: c.marks,
          weightage: c.weightage,
          scope: c.scope,
          timing: c.timing,
          co: c.co,
          track: c.track,
          sort_order: j,
        })),
      );
      if (e) die(`components ${s.slug}`, e);
    }

    await db.from("strategies").delete().eq("subject_id", subjectId);
    if (s.strategies.length) {
      const { error: e } = await db.from("strategies").insert(
        s.strategies.map((st, j) => ({
          user_id: userId,
          subject_id: subjectId,
          title: st.title,
          body: st.body,
          sort_order: j,
        })),
      );
      if (e) die(`strategies ${s.slug}`, e);
    }

    await db.from("books").delete().eq("subject_id", subjectId);
    const allBooks = [
      ...s.textbooks.map((b) => ({ ...b, kind: "textbook" as const })),
      ...s.references.map((b) => ({ ...b, kind: "reference" as const })),
    ];
    if (allBooks.length) {
      const { error: e } = await db.from("books").insert(
        allBooks.map((b, j) => ({
          user_id: userId,
          subject_id: subjectId,
          title: b.title,
          author: b.author,
          note: b.note ?? null,
          kind: b.kind,
          sort_order: j,
        })),
      );
      if (e) die(`books ${s.slug}`, e);
    }

    // attendance placeholder
    await db
      .from("attendance")
      .upsert({ user_id: userId, subject_id: subjectId }, { onConflict: "user_id,subject_id" });
  }
  ok("subjects, outcomes, units, topics, experiments, components, strategies, books", subjects.length);

  // ─── curated resources ────────────────────────────────────────────
  await db.from("resources").delete().eq("user_id", userId).eq("is_curated", true);
  const resourceRows = resources.map((r) => {
    const topicId = topicIdByCode[r.target];
    const unitId = unitIdByKey[r.target];
    const subjectId =
      subjectIdBySlug[r.target] ??
      (topicId ? subjects.find((s) => s.units.some((u) => u.topics.some((t) => t.code === r.target)))
        ? subjectIdBySlug[
            subjects.find((s) => s.units.some((u) => u.topics.some((t) => t.code === r.target)))!.slug
          ]
        : null : null);
    return {
      user_id: userId,
      subject_id: subjectId ?? null,
      unit_id: unitId ?? null,
      topic_id: topicId ?? null,
      title: r.title,
      url: r.url,
      kind: r.kind,
      source: r.source,
      rank: r.rank,
      minutes: r.minutes ?? null,
      why: r.why,
      is_curated: true,
    };
  });
  {
    const { error } = await db.from("resources").insert(resourceRows);
    if (error) die("resources", error);
  }
  ok("curated resources", resourceRows.length);

  // ─── timetable ────────────────────────────────────────────────────
  await db.from("timetable_slots").delete().eq("semester_id", semesterId);
  {
    const { error } = await db.from("timetable_slots").insert(
      slots.map((s) => ({
        user_id: userId,
        semester_id: semesterId,
        day: s.day,
        periods: s.periods,
        start_time: s.start,
        end_time: s.end,
        subject_id: subjectIdBySlug[s.subject] ?? null,
        kind: s.kind,
        lab_group: s.group,
        room: s.room,
        teacher: s.teacher,
      })),
    );
    if (error) die("timetable", error);
  }
  ok("timetable slots", slots.length);

  // ─── exams ────────────────────────────────────────────────────────
  {
    const { error } = await db.from("exams").upsert(
      exams.map((e) => ({
        user_id: userId,
        semester_id: semesterId,
        subject_id: e.subject ? subjectIdBySlug[e.subject] : null,
        key: e.key,
        name: e.name,
        kind: e.kind,
        exam_date: e.date,
        window_label: e.window,
        max_marks: e.maxMarks,
        weightage: e.weightage,
        scope: e.scope,
      })),
      { onConflict: "user_id,key" },
    );
    if (error) die("exams", error);
  }
  ok("exams", exams.length);

  // ─── study plan ───────────────────────────────────────────────────
  await db.from("tasks").delete().eq("user_id", userId).eq("source", "plan");
  let taskCount = 0;
  for (const d of planDays) {
    const { error: pe } = await db.from("plan_days").upsert(
      {
        user_id: userId,
        date: d.date,
        phase: d.phase,
        budget: d.budget,
        headline: d.headline,
        note: d.note ?? null,
      },
      { onConflict: "user_id,date" },
    );
    if (pe) die(`plan day ${d.date}`, pe);

    if (d.blocks.length) {
      const { error } = await db.from("tasks").insert(
        d.blocks.map((b, j) => ({
          user_id: userId,
          subject_id: subjectIdBySlug[b.subject] ?? null,
          title: b.label,
          detail: b.topics.join("\n"),
          topic_codes: b.topics.filter((t) => topicIdByCode[t]),
          due_date: d.date,
          minutes: b.minutes,
          kind: b.kind,
          source: "plan",
          sort_order: j,
        })),
      );
      if (error) die(`plan blocks ${d.date}`, error);
      taskCount += d.blocks.length;
    }
  }
  ok("plan days", planDays.length);
  ok("plan tasks", taskCount);

  console.log("\n\x1b[1m\x1b[32mDone.\x1b[0m Run `npm run dev` and sign in as " + EMAIL + "\n");
}

main().catch((e) => die("seed", e));
