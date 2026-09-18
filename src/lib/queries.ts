import { createClient } from "@/lib/supabase/server";
import type {
  Attachment,
  Attendance,
  Attempt,
  Checkpoint,
  ClassMark,
  Component,
  Exam,
  Experiment,
  Note,
  Outcome,
  Book,
  PlanDay,
  Profile,
  Question,
  Resource,
  Slot,
  Strategy,
  Subject,
  Task,
  Topic,
  Unit,
} from "@/lib/db-types";

export async function getProfile(): Promise<Profile | null> {
  const db = await createClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) return null;
  const { data } = await db.from("profiles").select("*").eq("id", user.id).maybeSingle();
  return (data as Profile) ?? { id: user.id, display_name: null, lab_group: 2, theme: "system" };
}

export async function getSubjects(): Promise<Subject[]> {
  const db = await createClient();
  const { data } = await db.from("subjects").select("*").order("sort_order");
  return (data as Subject[]) ?? [];
}

export async function getSubjectBySlug(slug: string): Promise<Subject | null> {
  const db = await createClient();
  const { data } = await db.from("subjects").select("*").eq("slug", slug).maybeSingle();
  return (data as Subject) ?? null;
}

export async function getTopics(subjectId?: string): Promise<Topic[]> {
  const db = await createClient();
  let q = db.from("topics").select("*").order("sort_order");
  if (subjectId) q = q.eq("subject_id", subjectId);
  const { data } = await q;
  return (data as Topic[]) ?? [];
}

export async function getUnits(subjectId?: string): Promise<Unit[]> {
  const db = await createClient();
  let q = db.from("units").select("*").order("number");
  if (subjectId) q = q.eq("subject_id", subjectId);
  const { data } = await q;
  return (data as Unit[]) ?? [];
}

export async function getCheckpoints(topicIds?: string[]): Promise<Checkpoint[]> {
  const db = await createClient();
  let q = db.from("checkpoints").select("*").order("sort_order");
  if (topicIds) {
    if (!topicIds.length) return [];
    q = q.in("topic_id", topicIds);
  }
  const { data, error } = await q;
  // the table is newer than the rest of the schema; don't take the page down
  // if it hasn't been created yet
  if (error) return [];
  return (data as Checkpoint[]) ?? [];
}

/** Files dropped straight into the inbox — not attached to a note. */
export async function getInboxFiles(): Promise<Attachment[]> {
  const db = await createClient();
  const { data, error } = await db
    .from("attachments")
    .select("*")
    .is("note_id", null)
    .order("created_at", { ascending: false });
  if (error) return [];
  return (data as Attachment[]) ?? [];
}

export async function getClassMarks(opts?: {
  from?: string;
  to?: string;
}): Promise<ClassMark[]> {
  const db = await createClient();
  let q = db.from("class_marks").select("*").order("on_date");
  if (opts?.from) q = q.gte("on_date", opts.from);
  if (opts?.to) q = q.lte("on_date", opts.to);
  const { data, error } = await q;
  if (error) return []; // table may predate this feature
  return (data as ClassMark[]) ?? [];
}

export async function getQuestions(opts?: {
  topicId?: string;
  subjectId?: string;
}): Promise<Question[]> {
  const db = await createClient();
  let q = db.from("questions").select("*").order("created_at", { ascending: false });
  if (opts?.topicId) q = q.eq("topic_id", opts.topicId);
  if (opts?.subjectId) q = q.eq("subject_id", opts.subjectId);
  const { data, error } = await q;
  if (error) return []; // table may predate this feature
  return (data as Question[]) ?? [];
}

export async function getAttempts(questionIds?: string[]): Promise<Attempt[]> {
  const db = await createClient();
  let q = db.from("attempts").select("*").order("created_at", { ascending: false });
  if (questionIds) {
    if (!questionIds.length) return [];
    q = q.in("question_id", questionIds);
  }
  const { data, error } = await q;
  if (error) return [];
  return (data as Attempt[]) ?? [];
}

export async function getExperiments(subjectId?: string): Promise<Experiment[]> {
  const db = await createClient();
  let q = db.from("experiments").select("*").order("number");
  if (subjectId) q = q.eq("subject_id", subjectId);
  const { data } = await q;
  return (data as Experiment[]) ?? [];
}

export async function getComponents(subjectId?: string): Promise<Component[]> {
  const db = await createClient();
  let q = db.from("components").select("*").order("sort_order");
  if (subjectId) q = q.eq("subject_id", subjectId);
  const { data } = await q;
  return (data as Component[]) ?? [];
}

export async function getStrategies(subjectId: string): Promise<Strategy[]> {
  const db = await createClient();
  const { data } = await db
    .from("strategies")
    .select("*")
    .eq("subject_id", subjectId)
    .order("sort_order");
  return (data as Strategy[]) ?? [];
}

export async function getOutcomes(subjectId: string): Promise<Outcome[]> {
  const db = await createClient();
  const { data } = await db.from("outcomes").select("*").eq("subject_id", subjectId).order("code");
  return (data as Outcome[]) ?? [];
}

export async function getBooks(subjectId: string): Promise<Book[]> {
  const db = await createClient();
  const { data } = await db
    .from("books")
    .select("*")
    .eq("subject_id", subjectId)
    .order("sort_order");
  return (data as Book[]) ?? [];
}

export async function getResources(subjectId?: string): Promise<Resource[]> {
  const db = await createClient();
  let q = db.from("resources").select("*").order("rank");
  if (subjectId) q = q.eq("subject_id", subjectId);
  const { data } = await q;
  return (data as Resource[]) ?? [];
}

export async function getNotes(opts?: {
  subjectId?: string;
  limit?: number;
}): Promise<Note[]> {
  const db = await createClient();
  let q = db
    .from("notes")
    .select("*")
    .order("pinned", { ascending: false })
    .order("updated_at", { ascending: false });
  if (opts?.subjectId) q = q.eq("subject_id", opts.subjectId);
  if (opts?.limit) q = q.limit(opts.limit);
  const { data } = await q;
  return (data as Note[]) ?? [];
}

export async function getTasks(opts?: { date?: string; from?: string; to?: string }) {
  const db = await createClient();
  let q = db.from("tasks").select("*").order("sort_order");
  if (opts?.date) q = q.eq("due_date", opts.date);
  if (opts?.from) q = q.gte("due_date", opts.from);
  if (opts?.to) q = q.lte("due_date", opts.to);
  const { data } = await q;
  return (data as Task[]) ?? [];
}

export async function getPlanDays(): Promise<PlanDay[]> {
  const db = await createClient();
  const { data } = await db.from("plan_days").select("*").order("date");
  return (data as PlanDay[]) ?? [];
}

export async function getSlots(): Promise<Slot[]> {
  const db = await createClient();
  const { data } = await db.from("timetable_slots").select("*").order("start_time");
  return (data as Slot[]) ?? [];
}

export async function getExams(): Promise<Exam[]> {
  const db = await createClient();
  const { data } = await db.from("exams").select("*").order("key");
  return (data as Exam[]) ?? [];
}

export async function getAttendance(): Promise<Attendance[]> {
  const db = await createClient();
  const { data } = await db.from("attendance").select("*");
  return (data as Attendance[]) ?? [];
}

/* ─── navigation tree + search index ───────────────────────────
   One round trip for the sidebar and the ⌘K palette. Deliberately
   selects narrow columns — this loads on every signed-in page. */

export interface NavTopic {
  id: string;
  code: string;
  title: string;
  status: Topic["status"];
  in_midsem: boolean;
  weight: number;
}
export interface NavUnit {
  id: string;
  number: number;
  title: string;
  in_midsem: boolean;
  topics: NavTopic[];
}
export interface NavExperiment {
  id: string;
  number: number;
  title: string;
  status: Experiment["status"];
}
export interface NavSubject {
  id: string;
  slug: string;
  name: string;
  short_name: string;
  color: string;
  status: Subject["status"];
  has_lab: boolean;
  units: NavUnit[];
  /** lab-only courses carry their syllabus here instead of in units */
  experiments: NavExperiment[];
}

export async function getNavTree(): Promise<NavSubject[]> {
  const db = await createClient();
  const [subjectsRes, unitsRes, topicsRes, experimentsRes] = await Promise.all([
    db
      .from("subjects")
      .select("id, slug, name, short_name, color, status, has_lab")
      .order("sort_order"),
    db.from("units").select("id, subject_id, number, title, in_midsem").order("number"),
    db
      .from("topics")
      .select("id, subject_id, unit_id, code, title, status, in_midsem, weight")
      .order("sort_order"),
    db.from("experiments").select("id, subject_id, number, title, status").order("number"),
  ]);

  const units = unitsRes.data ?? [];
  const topics = topicsRes.data ?? [];
  const experiments = experimentsRes.data ?? [];

  return (subjectsRes.data ?? []).map((s) => ({
    id: s.id,
    slug: s.slug,
    name: s.name,
    short_name: s.short_name,
    color: s.color,
    status: s.status,
    has_lab: s.has_lab,
    units: units
      .filter((u) => u.subject_id === s.id)
      .map((u) => ({
        id: u.id,
        number: u.number,
        title: u.title,
        in_midsem: u.in_midsem,
        topics: topics
          .filter((t) => t.unit_id === u.id)
          .map((t) => ({
            id: t.id,
            code: t.code,
            title: t.title,
            status: t.status,
            in_midsem: t.in_midsem,
            weight: t.weight,
          })),
      })),
    experiments: experiments
      .filter((e) => e.subject_id === s.id)
      .map((e) => ({ id: e.id, number: e.number, title: e.title, status: e.status })),
  })) as NavSubject[];
}

export interface SearchDoc {
  kind: "subject" | "unit" | "topic" | "note" | "resource" | "page";
  title: string;
  subtitle?: string;
  href: string;
  meta?: string;
}

export async function getSearchIndex(): Promise<SearchDoc[]> {
  const db = await createClient();
  const [subjectsRes, topicsRes, notesRes, resourcesRes] = await Promise.all([
    db.from("subjects").select("slug, name, short_name, code").order("sort_order"),
    db.from("topics").select("subject_id, unit_id, code, title, in_midsem").order("sort_order"),
    db.from("notes").select("id, title, subject_id").order("updated_at", { ascending: false }),
    db.from("resources").select("title, url, kind, subject_id").order("rank"),
  ]);

  const subjects = subjectsRes.data ?? [];

  // subject_id -> slug, needed to build topic/note links
  const idToSlug = new Map<string, { slug: string; short: string }>();
  const subjRows = await db.from("subjects").select("id, slug, short_name");
  for (const s of subjRows.data ?? []) idToSlug.set(s.id, { slug: s.slug, short: s.short_name });

  // unit_id -> unit number, so a topic hit can open the unit it lives in
  const unitNumber = new Map<string, number>();
  const unitRows = await db.from("units").select("id, number, title, subject_id");
  for (const u of unitRows.data ?? []) unitNumber.set(u.id, u.number);

  const docs: SearchDoc[] = [];

  for (const s of subjects) {
    docs.push({
      kind: "subject",
      title: s.name,
      subtitle: s.code ?? undefined,
      href: `/subjects/${s.slug}`,
      meta: s.short_name,
    });
  }
  for (const u of unitRows.data ?? []) {
    const s = idToSlug.get(u.subject_id);
    if (!s) continue;
    docs.push({
      kind: "unit",
      title: `Unit ${u.number} — ${u.title}`,
      subtitle: s.short,
      href: `/subjects/${s.slug}/unit-${u.number}`,
    });
  }
  for (const t of topicsRes.data ?? []) {
    const s = idToSlug.get(t.subject_id);
    if (!s) continue;
    const n = t.unit_id ? unitNumber.get(t.unit_id) : undefined;
    docs.push({
      kind: "topic",
      title: t.title,
      subtitle: n ? `${s.short} · Unit ${n} · ${t.code}` : `${s.short} · ${t.code}`,
      href: n
        ? `/subjects/${s.slug}/unit-${n}/${t.code}`
        : `/subjects/${s.slug}#topic-${t.code}`,
      meta: t.in_midsem ? "mid-sem" : undefined,
    });
  }
  for (const n of notesRes.data ?? []) {
    docs.push({
      kind: "note",
      title: n.title || "Untitled",
      subtitle: n.subject_id ? idToSlug.get(n.subject_id)?.short : undefined,
      href: `/notes?open=${n.id}`,
    });
  }
  for (const r of resourcesRes.data ?? []) {
    docs.push({
      kind: "resource",
      title: r.title,
      subtitle: r.subject_id ? idToSlug.get(r.subject_id)?.short : r.kind,
      href: r.url,
      meta: r.kind,
    });
  }
  return docs;
}
