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
import { questions } from "../src/data/questions";
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

const ok = (label: string, n?: number | string) =>
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

  // profile — never clobber what you've set in Settings. The display name comes
  // from SEED_DISPLAY_NAME, else the email local-part, and only on first insert.
  const { data: existingProfile } = await db
    .from("profiles")
    .select("display_name, lab_group")
    .eq("id", userId)
    .maybeSingle();

  const fallbackName =
    process.env.SEED_DISPLAY_NAME?.trim() || EMAIL!.split("@")[0];

  const { error: profileErr } = await db.from("profiles").upsert(
    {
      id: userId,
      display_name: existingProfile?.display_name ?? fallbackName,
      lab_group: existingProfile?.lab_group ?? 2,
    },
    { onConflict: "id" },
  );
  if (profileErr) die("profile", profileErr);
  ok(`profile (${existingProfile?.display_name ?? fallbackName})`);

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
  // A resource's `target` may name a unit or a topic rather than a subject, so
  // remember which subject each of those belongs to.
  let checkpointCount = 0;
  const subjectIdByUnitKey: Record<string, string> = {};
  const subjectIdByTopicCode: Record<string, string> = {};

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
      subjectIdByUnitKey[`${s.slug}-u${u.number}`] = subjectId;

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
        for (const r of rows ?? []) {
          topicIdByCode[r.code as string] = r.id as string;
          subjectIdByTopicCode[r.code as string] = subjectId;
        }

        // Checkpoints — the steps inside a topic. Upserted on
        // (topic_id, title) so re-seeding never unticks what you've done,
        // and anything you added in the app is left alone.
        const cps = u.topics.flatMap((t) =>
          (t.subtopics ?? []).map((title, k) => ({
            user_id: userId,
            topic_id: topicIdByCode[t.code],
            title,
            sort_order: k,
          })),
        );
        if (cps.length) {
          const { error: ce } = await db
            .from("checkpoints")
            .upsert(cps, { onConflict: "topic_id,title", ignoreDuplicates: true });
          if (ce) die(`checkpoints ${s.slug} U${u.number}`, ce);
          checkpointCount += cps.length;
        }
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
    {
      const { error } = await db
        .from("attendance")
        .upsert({ user_id: userId, subject_id: subjectId }, { onConflict: "user_id,subject_id" });
      if (error) die(`attendance ${s.slug}`, error);
    }
  }
  ok("subjects, outcomes, units, topics, experiments, components, strategies, books", subjects.length);

  // ─── curated resources ────────────────────────────────────────────
  // `resources` has no unique key, so a silently-failed delete here would
  // duplicate every curated link on the next run.
  {
    const { error } = await db
      .from("resources")
      .delete()
      .eq("user_id", userId)
      .eq("is_curated", true);
    if (error) die("clearing curated resources", error);
  }
  const unresolved: string[] = [];
  const unresolvedQuestions: string[] = [];
  const resourceRows = resources.map((r) => {
    const topicId = topicIdByCode[r.target];
    const unitId = unitIdByKey[r.target];
    // A unit- or topic-targeted resource still belongs to its subject. Resolving
    // it here is what keeps it out of the subject filters and off the subject
    // page when the target isn't a plain slug.
    const subjectId =
      subjectIdBySlug[r.target] ??
      subjectIdByTopicCode[r.target] ??
      subjectIdByUnitKey[r.target] ??
      null;
    if (!subjectId) unresolved.push(r.target);
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
  if (checkpointCount) ok("topic checkpoints", checkpointCount);
  ok("curated resources", resourceRows.length);

  // ─── starter questions ────────────────────────────────────────────
  // Inserted only if that topic doesn't already have a question with the
  // same prompt, so re-seeding never duplicates them and never touches
  // the attempts you've logged against them.
  {
    const { data: existing } = await db
      .from("questions")
      .select("topic_id, prompt")
      .eq("user_id", userId);
    const seen = new Set((existing ?? []).map((q) => `${q.topic_id}::${q.prompt}`));

    const rows = questions
      .map((q) => {
        const topicId = topicIdByCode[q.target];
        if (!topicId) {
          unresolvedQuestions.push(q.target);
          return null;
        }
        if (seen.has(`${topicId}::${q.prompt}`)) return null;
        return {
          user_id: userId,
          subject_id: subjectIdByTopicCode[q.target] ?? null,
          topic_id: topicId,
          prompt: q.prompt,
          answer: q.answer,
          marks: q.marks ?? null,
          kind: q.kind ?? "practice",
          source: q.source ?? "Starter set",
        };
      })
      .filter(Boolean);

    if (rows.length) {
      const { error } = await db.from("questions").insert(rows as object[]);
      if (error) die("questions", error);
    }
    ok("starter questions", rows.length);
    if (unresolvedQuestions.length) {
      console.log(
        `    \x1b[33m!\x1b[0m ${unresolvedQuestions.length} question target(s) matched no topic: ${[...new Set(unresolvedQuestions)].join(", ")}`,
      );
    }
  }
  if (unresolved.length) {
    console.log(
      `    \x1b[33m!\x1b[0m ${unresolved.length} resource target(s) matched no subject, unit or topic: ${[...new Set(unresolved)].join(", ")}`,
    );
  }

  // ─── timetable ────────────────────────────────────────────────────
  // Slots have to keep their ids across re-seeds. class_marks.slot_id is
  // "on delete cascade", so deleting and reinserting the timetable — which is
  // what this used to do — silently took every attendance mark with it, and
  // left any page already open posting slot ids that no longer existed.
  // Match each slot on (day, start_time, lab_group), which is unique within a
  // semester, and reuse the id that's already there.
  const slotKey = (day: string, start: string, group: number | null) =>
    `${day}|${start.slice(0, 5)}|${group ?? "-"}`;
  {
    const { data: existing, error: readErr } = await db
      .from("timetable_slots")
      .select("id, day, start_time, lab_group")
      .eq("semester_id", semesterId);
    if (readErr) die("timetable read", readErr);

    const idByKey = new Map<string, string>();
    for (const e of existing ?? []) {
      idByKey.set(slotKey(e.day, e.start_time, e.lab_group), e.id);
    }

    const seen = new Set<string>();
    const rows = slots.map((s) => {
      const key = slotKey(s.day, s.start, s.group);
      seen.add(key);
      const id = idByKey.get(key);
      return {
        ...(id ? { id } : {}),
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
      };
    });

    const { error } = await db.from("timetable_slots").upsert(rows);
    if (error) die("timetable", error);

    // Slots the timetable no longer has. Their marks go too, which is right —
    // the class isn't on the timetable any more.
    const stale = [...idByKey.entries()].filter(([k]) => !seen.has(k)).map(([, id]) => id);
    if (stale.length) {
      const { error: delErr } = await db.from("timetable_slots").delete().in("id", stale);
      if (delErr) die("timetable cleanup", delErr);
    }
    ok("timetable slots", `${slots.length}${stale.length ? `, ${stale.length} removed` : ""}`);
  }

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
