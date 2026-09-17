"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function uid() {
  const db = await createClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) throw new Error("Not signed in");
  return { db, userId: user.id };
}

/* ─── topics ────────────────────────────────────────────────── */
export async function setTopicStatus(id: string, status: string) {
  const { db } = await uid();
  await db
    .from("topics")
    .update({ status, last_studied_at: new Date().toISOString() })
    .eq("id", id);
  revalidatePath("/", "layout");
}

export async function setTopicConfidence(id: string, confidence: number) {
  const { db } = await uid();
  await db.from("topics").update({ confidence }).eq("id", id);
  revalidatePath("/", "layout");
}

/* ─── experiments ───────────────────────────────────────────── */
export async function setExperiment(
  id: string,
  patch: { status?: string; file_done?: boolean; notes?: string },
) {
  const { db } = await uid();
  await db.from("experiments").update(patch).eq("id", id);
  revalidatePath("/", "layout");
}

/* ─── tasks ─────────────────────────────────────────────────── */
export async function setTaskStatus(id: string, status: string) {
  const { db } = await uid();
  await db
    .from("tasks")
    .update({
      status,
      completed_at: status === "done" ? new Date().toISOString() : null,
    })
    .eq("id", id);
  revalidatePath("/", "layout");
}

export async function createTask(input: {
  title: string;
  subject_id?: string | null;
  due_date?: string | null;
  minutes?: number | null;
  kind?: string;
  detail?: string | null;
}) {
  const { db, userId } = await uid();
  const { error } = await db.from("tasks").insert({
    user_id: userId,
    title: input.title,
    subject_id: input.subject_id || null,
    due_date: input.due_date || null,
    minutes: input.minutes || null,
    kind: input.kind || "custom",
    detail: input.detail || null,
    source: "manual",
    sort_order: 999,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

export async function deleteTask(id: string) {
  const { db } = await uid();
  await db.from("tasks").delete().eq("id", id);
  revalidatePath("/", "layout");
}

/* ─── notes ─────────────────────────────────────────────────── */
export async function createNote(input: {
  title?: string;
  content?: string;
  subject_id?: string | null;
  unit_id?: string | null;
  topic_id?: string | null;
}) {
  const { db, userId } = await uid();
  const { data, error } = await db
    .from("notes")
    .insert({
      user_id: userId,
      title: input.title || "Untitled",
      content: input.content || "",
      subject_id: input.subject_id || null,
      unit_id: input.unit_id || null,
      topic_id: input.topic_id || null,
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
  return data.id as string;
}

export async function updateNote(
  id: string,
  patch: {
    title?: string;
    content?: string;
    subject_id?: string | null;
    topic_id?: string | null;
    tags?: string[];
    pinned?: boolean;
  },
) {
  const { db } = await uid();
  const { error } = await db.from("notes").update(patch).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

export async function deleteNote(id: string) {
  const { db } = await uid();
  await db.from("notes").delete().eq("id", id);
  revalidatePath("/", "layout");
}

/* ─── resources ─────────────────────────────────────────────── */
export async function addResource(input: {
  title: string;
  url: string;
  subject_id?: string | null;
  topic_id?: string | null;
  kind?: string;
  source?: string | null;
  why?: string | null;
}) {
  const { db, userId } = await uid();
  const { error } = await db.from("resources").insert({
    user_id: userId,
    title: input.title,
    url: input.url,
    subject_id: input.subject_id || null,
    topic_id: input.topic_id || null,
    kind: input.kind || "article",
    source: input.source || hostOf(input.url),
    why: input.why || null,
    rank: 9,
    is_curated: false,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

export async function deleteResource(id: string) {
  const { db } = await uid();
  await db.from("resources").delete().eq("id", id).eq("is_curated", false);
  revalidatePath("/", "layout");
}

function hostOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

/* ─── marks & attendance ────────────────────────────────────── */
export async function setComponentMark(id: string, obtained: number | null) {
  const { db } = await uid();
  await db
    .from("components")
    .update({ obtained, status: obtained === null ? "upcoming" : "done" })
    .eq("id", id);
  revalidatePath("/", "layout");
}

export async function setExamMark(id: string, obtained: number | null) {
  const { db } = await uid();
  await db
    .from("exams")
    .update({ obtained, status: obtained === null ? "upcoming" : "done" })
    .eq("id", id);
  revalidatePath("/", "layout");
}

export async function setAttendance(subjectId: string, held: number, attended: number) {
  const { db, userId } = await uid();
  await db
    .from("attendance")
    .upsert(
      { user_id: userId, subject_id: subjectId, held, attended, updated_at: new Date().toISOString() },
      { onConflict: "user_id,subject_id" },
    );
  revalidatePath("/", "layout");
}

/* ─── profile ───────────────────────────────────────────────── */
export async function setLabGroup(group: 1 | 2) {
  const { db, userId } = await uid();
  await db.from("profiles").update({ lab_group: group }).eq("id", userId);
  revalidatePath("/", "layout");
}

export async function setDisplayName(name: string) {
  const { db, userId } = await uid();
  await db.from("profiles").update({ display_name: name }).eq("id", userId);
  revalidatePath("/", "layout");
}

/* ─── attachments ───────────────────────────────────────────── */
export async function recordAttachment(input: {
  storage_path: string;
  filename: string;
  mime: string;
  size_bytes: number;
  note_id?: string | null;
  subject_id?: string | null;
  topic_id?: string | null;
  caption?: string | null;
}) {
  const { db, userId } = await uid();
  const { error } = await db.from("attachments").insert({ user_id: userId, ...input });
  if (error) throw new Error(error.message);
}

/* ─── subject editing (for filling gaps later) ──────────────── */
export async function updateSubject(
  id: string,
  patch: {
    midsem_scope?: string;
    midsem_confirmed?: boolean;
    teacher?: string;
    code?: string;
    overview?: string;
    status?: string;
  },
) {
  const { db } = await uid();
  await db.from("subjects").update(patch).eq("id", id);
  revalidatePath("/", "layout");
}

export async function addUnit(input: {
  subject_id: string;
  number: number;
  title: string;
  sessions?: number;
  in_midsem?: boolean;
}) {
  const { db, userId } = await uid();
  const { error } = await db.from("units").insert({
    user_id: userId,
    subject_id: input.subject_id,
    number: input.number,
    title: input.title,
    sessions: input.sessions ?? null,
    in_midsem: input.in_midsem ?? false,
    sort_order: input.number,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

export async function addTopic(input: {
  subject_id: string;
  unit_id: string;
  title: string;
  session?: string;
  weight?: number;
  in_midsem?: boolean;
}) {
  const { db, userId } = await uid();
  const code = `custom-${Math.random().toString(36).slice(2, 10)}`;
  const { error } = await db.from("topics").insert({
    user_id: userId,
    subject_id: input.subject_id,
    unit_id: input.unit_id,
    code,
    title: input.title,
    session: input.session ?? null,
    weight: input.weight ?? 3,
    in_midsem: input.in_midsem ?? false,
    sort_order: 999,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

/* ─── checkpoints (the steps inside a topic) ─────────────────── */
export async function addCheckpoint(input: { topic_id: string; title: string }) {
  const { db, userId } = await uid();
  const title = input.title.trim();
  if (!title) throw new Error("Give the step a name");

  const { data: last } = await db
    .from("checkpoints")
    .select("sort_order")
    .eq("topic_id", input.topic_id)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await db.from("checkpoints").insert({
    user_id: userId,
    topic_id: input.topic_id,
    title,
    sort_order: (last?.sort_order ?? -1) + 1,
  });
  if (error) {
    // unique (topic_id, title)
    if (error.code === "23505") throw new Error("That step is already on the list");
    throw new Error(error.message);
  }
  revalidatePath("/", "layout");
}

export async function setCheckpointDone(id: string, done: boolean) {
  const { db } = await uid();
  const { error } = await db.from("checkpoints").update({ done }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

export async function renameCheckpoint(id: string, title: string) {
  const { db } = await uid();
  const next = title.trim();
  if (!next) throw new Error("Give the step a name");
  const { error } = await db.from("checkpoints").update({ title: next }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

export async function deleteCheckpoint(id: string) {
  const { db } = await uid();
  const { error } = await db.from("checkpoints").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}
