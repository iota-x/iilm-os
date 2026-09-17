import { createClient } from "@/lib/supabase/server";
import type {
  Attendance,
  Component,
  Exam,
  Experiment,
  Note,
  Outcome,
  Book,
  PlanDay,
  Profile,
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
