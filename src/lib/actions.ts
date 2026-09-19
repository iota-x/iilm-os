"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { daysBetween, distribute, minutesFor, remaining } from "@/lib/goals";
import { istToday } from "@/lib/utils";
import type { Topic } from "@/lib/db-types";
import { encrypt } from "@/lib/secret";

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
  const { error } = await db
    .from("attendance")
    .upsert(
      { user_id: userId, subject_id: subjectId, held, attended, updated_at: new Date().toISOString() },
      { onConflict: "user_id,subject_id" },
    );
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

/* ─── profile ───────────────────────────────────────────────── */
export async function setLabGroup(group: 1 | 2) {
  const { db, userId } = await uid();
  await db.from("profiles").update({ lab_group: group }).eq("id", userId);
  revalidatePath("/", "layout");
}

/** First login: set your own password, then the rest of the app opens. */
export async function setOwnPassword(password: string) {
  if (password.length < 8) throw new Error("At least 8 characters.");
  const { db, userId } = await uid();
  const { error } = await db.auth.updateUser({ password });
  if (error) throw new Error(error.message);
  const { error: pErr } = await db
    .from("profiles")
    .update({ must_change_password: false })
    .eq("id", userId);
  if (pErr) throw new Error(pErr.message);
  revalidatePath("/", "layout");
}

/** The student's own Gemini key for /ask. Empty string clears it. */
export async function setGeminiKey(key: string) {
  const { db, userId } = await uid();
  const k = key.trim();
  if (k && !/^AI[A-Za-z0-9_-]{20,}$|^AQ\.[A-Za-z0-9_-]{20,}$/.test(k)) {
    throw new Error("That doesn't look like a Gemini key — they start with AIza… or AQ.…");
  }
  const { error } = await db.from("profiles").update({ gemini_key: k ? encrypt(k) : null }).eq("id", userId);
  if (error) throw new Error(error.message);
  revalidatePath("/settings");
  revalidatePath("/ask");
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
  taken_at?: string | null;
  slot_id?: string | null;
}) {
  const { db, userId } = await uid();
  const { error } = await db.from("attachments").insert({ user_id: userId, ...input });
  if (error) throw new Error(error.message);
}

/** Re-file an inbox photo: which subject, which class, or which topic. */
export async function setAttachmentPlace(
  id: string,
  patch: { subject_id?: string | null; slot_id?: string | null; topic_id?: string | null },
) {
  const { db } = await uid();
  const { error } = await db.from("attachments").update(patch).eq("id", id);
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
  // no revalidate: the caller updates optimistically and nothing in the
  // sidebar depends on this. Navigating refetches anyway.
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

/* ─── review ─────────────────────────────────────────────────
   Recording a review is the one thing that moves a topic's next due date:
   it stamps last_studied_at and takes your honest confidence, which sets
   how long until it comes back. Editing confidence alone deliberately does
   NOT count as a review — otherwise fiddling with the slider would push
   things out of the queue without you having studied them. */
export async function markReviewed(id: string, confidence: number) {
  const { db } = await uid();
  const c = Math.max(1, Math.min(5, Math.round(confidence)));

  const { data: topic } = await db.from("topics").select("status").eq("id", id).maybeSingle();
  // a reviewed topic is at least "revising"; never demote something already solid
  const status =
    topic?.status === "mastered" ? "mastered" : c >= 5 ? "mastered" : "revising";

  const { error } = await db
    .from("topics")
    .update({ confidence: c, status, last_studied_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

/* ─── questions and attempts ─────────────────────────────────
   An attempt is a row, never a column on the question — so getting
   something wrong twice before getting it right stays visible, which is
   the only reason this table earns its keep. */
export async function addQuestion(input: {
  prompt: string;
  answer?: string | null;
  subject_id?: string | null;
  topic_id?: string | null;
  source?: string | null;
  marks?: number | null;
  kind?: string;
}) {
  const { db, userId } = await uid();
  const prompt = input.prompt.trim();
  if (!prompt) throw new Error("The question needs some text");

  const { data, error } = await db
    .from("questions")
    .insert({
      user_id: userId,
      prompt,
      answer: input.answer?.trim() || null,
      subject_id: input.subject_id || null,
      topic_id: input.topic_id || null,
      source: input.source?.trim() || null,
      marks: input.marks ?? null,
      kind: input.kind || "practice",
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
  return data.id as string;
}

export async function updateQuestion(
  id: string,
  patch: { prompt?: string; answer?: string | null; source?: string | null; marks?: number | null },
) {
  const { db } = await uid();
  const { error } = await db.from("questions").update(patch).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

export async function deleteQuestion(id: string) {
  const { db } = await uid();
  const { error } = await db.from("questions").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

export async function logAttempt(input: {
  question_id: string;
  outcome: "correct" | "partial" | "wrong";
  note?: string | null;
}) {
  const { db, userId } = await uid();
  const { error } = await db.from("attempts").insert({
    user_id: userId,
    question_id: input.question_id,
    outcome: input.outcome,
    note: input.note?.trim() || null,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

export async function deleteAttempt(id: string) {
  const { db } = await uid();
  const { error } = await db.from("attempts").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

/* ─── attendance, marked per class ───────────────────────────
   Unmarked classes are not counted at all — passing `attended: null`
   removes the mark rather than recording a miss, so a cancelled class or
   a day you forgot doesn't drag the percentage down. */
export async function setClassMark(input: {
  on_date: string;
  slot_id: string;
  subject_id: string | null;
  attended: boolean | null;
}) {
  const { db, userId } = await uid();

  if (input.attended === null) {
    const { error } = await db
      .from("class_marks")
      .delete()
      .eq("user_id", userId)
      .eq("on_date", input.on_date)
      .eq("slot_id", input.slot_id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await db.from("class_marks").upsert(
      {
        user_id: userId,
        on_date: input.on_date,
        slot_id: input.slot_id,
        subject_id: input.subject_id,
        attended: input.attended,
      },
      { onConflict: "user_id,on_date,slot_id" },
    );
    if (error) throw new Error(error.message);
  }
  // no revalidate: the caller updates optimistically and nothing in the
  // sidebar depends on this. Navigating refetches anyway.
}

/** One tap for "I was in today" — marks every class that day the same way. */
export async function setWholeDay(
  on_date: string,
  slots: { slot_id: string; subject_id: string | null }[],
  attended: boolean,
) {
  const { db, userId } = await uid();
  if (!slots.length) return;
  const { error } = await db.from("class_marks").upsert(
    slots.map((s) => ({
      user_id: userId,
      on_date,
      slot_id: s.slot_id,
      subject_id: s.subject_id,
      attended,
    })),
    { onConflict: "user_id,on_date,slot_id" },
  );
  if (error) throw new Error(error.message);
  // no revalidate: the caller updates optimistically and nothing in the
  // sidebar depends on this. Navigating refetches anyway.
}

export async function deleteAttachment(id: string) {
  const { db, userId } = await uid();
  const { data: row } = await db
    .from("attachments")
    .select("storage_path")
    .eq("id", id)
    .maybeSingle();

  // remove the file first; if that fails the row stays so nothing is orphaned
  if (row?.storage_path) {
    const { error: sErr } = await db.storage
      .from("vault")
      .remove([row.storage_path as string]);
    if (sErr) throw new Error(sErr.message);
  }
  const { error } = await db.from("attachments").delete().eq("id", id).eq("user_id", userId);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

export async function setAttachmentCaption(id: string, caption: string) {
  const { db } = await uid();
  const { error } = await db
    .from("attachments")
    .update({ caption: caption.trim() || null })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

/* ─── class board ───────────────────────────────────────────── */
export async function createPost(input: {
  title: string;
  body?: string;
  url?: string | null;
  kind?: string;
  subject_slug?: string | null;
}) {
  const { db, userId } = await uid();
  const title = input.title.trim();
  if (!title) throw new Error("Give it a title.");
  const { data, error } = await db
    .from("posts")
    .insert({
      user_id: userId,
      title,
      body: (input.body ?? "").trim(),
      url: input.url?.trim() || null,
      kind: input.kind ?? "discussion",
      subject_slug: input.subject_slug || null,
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  revalidatePath("/class");
  return data.id as string;
}

export async function deletePost(id: string) {
  const { db } = await uid();
  const { error } = await db.from("posts").delete().eq("id", id); // RLS: own rows only
  if (error) throw new Error(error.message);
  revalidatePath("/class");
}

export async function createReply(postId: string, body: string) {
  const { db, userId } = await uid();
  const text = body.trim();
  if (!text) throw new Error("Write something first.");
  const { error } = await db.from("replies").insert({ post_id: postId, user_id: userId, body: text });
  if (error) throw new Error(error.message);
  revalidatePath(`/class/${postId}`);
  revalidatePath("/class");
}

export async function deleteReply(id: string, postId: string) {
  const { db } = await uid();
  const { error } = await db.from("replies").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/class/${postId}`);
}

/** Toggle "helpful" on a post or a reply. Returns the new state. */
export async function toggleHelpful(target: "post" | "reply", id: string): Promise<boolean> {
  const { db, userId } = await uid();
  const table = target === "post" ? "post_votes" : "reply_votes";
  const col = target === "post" ? "post_id" : "reply_id";
  const { data: existing } = await db.from(table).select(col).eq(col, id).eq("user_id", userId).maybeSingle();
  if (existing) {
    const { error } = await db.from(table).delete().eq(col, id).eq("user_id", userId);
    if (error) throw new Error(error.message);
    return false;
  }
  const { error } = await db.from(table).insert({ [col]: id, user_id: userId });
  if (error) throw new Error(error.message);
  return true;
}

/* ─── goals ─────────────────────────────────────────────────── */

/** The topics a goal covers, in syllabus order. */
async function goalTopics(
  db: Awaited<ReturnType<typeof createClient>>,
  goal: { subject_id: string | null; unit_id: string | null; scope: string },
): Promise<Topic[]> {
  if (!goal.subject_id) return [];
  let q = db.from("topics").select("*").eq("subject_id", goal.subject_id).order("sort_order");
  if (goal.scope === "unit" && goal.unit_id) q = q.eq("unit_id", goal.unit_id);
  if (goal.scope === "midsem") q = q.eq("in_midsem", true);
  const { data } = await q;
  return (data as Topic[]) ?? [];
}

/**
 * Lay the goal's remaining topics across the days from today to the
 * deadline as one task each. Existing future tasks for this goal are
 * replaced; done ones are kept as the record they are.
 */
async function planGoal(
  db: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  goal: { id: string; subject_id: string | null; unit_id: string | null; scope: string; deadline: string },
) {
  const today = istToday();
  const start = today <= goal.deadline ? today : goal.deadline;
  const days = daysBetween(start, goal.deadline);

  await db.from("tasks").delete().eq("goal_id", goal.id).neq("status", "done");
  const { data: units } = await db.from("units").select("id, number").eq("subject_id", goal.subject_id ?? "");
  const unitRank = new Map((units ?? []).map((u) => [u.id as string, u.number as number]));
  const topics = remaining(await goalTopics(db, goal), unitRank);
  // topics already ticked off as tasks under this goal don't come back
  const { data: done } = await db.from("tasks").select("topic_id").eq("goal_id", goal.id).eq("status", "done");
  const doneIds = new Set((done ?? []).map((t) => t.topic_id as string));
  const todo = topics.filter((t) => !doneIds.has(t.id));

  const plan = distribute(todo, days);
  const rows = plan.flatMap((day, di) =>
    day.topics.map((t, j) => ({
      user_id: userId,
      goal_id: goal.id,
      subject_id: t.subject_id,
      topic_id: t.id,
      title: t.title,
      detail: t.outcome ?? null,
      topic_codes: [t.code],
      due_date: day.date,
      minutes: minutesFor(t),
      kind: t.status === "not_started" ? "learn" : "revise",
      source: "goal",
      sort_order: 50 + di * 20 + j,
    })),
  );
  if (rows.length) {
    const { error } = await db.from("tasks").insert(rows);
    if (error) throw new Error(error.message);
  }
  return { topics: todo.length, days: days.length, minutes: todo.reduce((n, t) => n + minutesFor(t), 0) };
}

export async function createGoal(input: {
  title: string;
  subject_id: string;
  unit_id?: string | null;
  scope: "midsem" | "unit" | "subject";
  deadline: string;
}) {
  const { db, userId } = await uid();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.deadline)) throw new Error("Pick a deadline.");
  if (input.deadline < istToday()) throw new Error("That deadline has already passed.");
  const { data, error } = await db
    .from("goals")
    .insert({
      user_id: userId,
      title: input.title.trim() || "Goal",
      subject_id: input.subject_id,
      unit_id: input.scope === "unit" ? input.unit_id ?? null : null,
      scope: input.scope,
      deadline: input.deadline,
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  const plan = await planGoal(db, userId, data);
  revalidatePath("/", "layout");
  return { id: data.id as string, ...plan };
}

/** Rebuild the remaining days from what's still not done. */
export async function replanGoal(id: string) {
  const { db, userId } = await uid();
  const { data: goal } = await db.from("goals").select("*").eq("id", id).single();
  if (!goal) throw new Error("Goal not found");
  const plan = await planGoal(db, userId, goal);
  revalidatePath("/", "layout");
  return plan;
}

export async function setGoalStatus(id: string, status: "active" | "done" | "dropped") {
  const { db } = await uid();
  const { error } = await db.from("goals").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
  if (status !== "active") {
    // a finished or dropped goal takes its unfinished tasks off the calendar
    await db.from("tasks").delete().eq("goal_id", id).neq("status", "done");
  }
  revalidatePath("/", "layout");
}

export async function deleteGoal(id: string) {
  const { db } = await uid();
  const { error } = await db.from("goals").delete().eq("id", id); // tasks cascade
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

/** Admin: pin or unpin a post. RLS lets only admins update posts they don't own. */
export async function setPostPinned(id: string, pinned: boolean) {
  const { db } = await uid();
  const { error } = await db.from("posts").update({ pinned }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/class");
  revalidatePath(`/class/${id}`);
}

/** The post's author marks one reply as the answer (or clears it). */
export async function setAnswer(postId: string, replyId: string | null) {
  const { db } = await uid();
  const { error } = await db.from("posts").update({ answer_reply_id: replyId }).eq("id", postId);
  if (error) throw new Error(error.message);
  revalidatePath(`/class/${postId}`);
  revalidatePath("/class");
}
