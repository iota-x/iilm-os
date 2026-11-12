"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getTenant } from "@/lib/queries";
import { istToday } from "@/lib/utils";
import { PLAN_TAG, WEEKDAY_BUDGET, headlineOf, replan, type ReplanResult, type ReplanTask } from "@/lib/replan";

export interface ReplanOpts {
  useHolidays?: boolean;
  keepAll?: boolean;
}

export interface ReplanPreview {
  today: string;
  result: Omit<ReplanResult, "moves" | "leftOut" | "days">;
  days: { date: string; minutes: number; budget: number; kept: number; over: boolean; isExam: boolean; isHoliday: boolean; subjects: string[] }[];
  moves: { id: string; title: string; subject: string; minutes: number; from: string | null; to: string }[];
  leftOut: { id: string; title: string; subject: string; minutes: number; kind: string }[];
  /** old missed DSA / GSoC habit blocks that Apply marks as skipped */
  staleHabits: number;
  papers: { subject: string; date: string }[];
}

type Db = Awaited<ReturnType<typeof createClient>>;

async function load(opts: ReplanOpts) {
  const db = await createClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) return { error: "Sign in again, then try once more." } as const;
  const today = istToday();
  const [tenant, tasks, planDays, subjects, exams, sessions] = await Promise.all([
    getTenant(),
    db.from("tasks").select("*").eq("source", "plan"),
    db.from("plan_days").select("*"),
    db.from("subjects").select("id, short_name"),
    db.from("exams").select("subject_id, exam_date").eq("kind", "ese"),
    db.from("study_sessions").select("task_id").not("task_id", "is", null),
  ]);
  if (tasks.error || planDays.error || exams.error) return { error: "Could not read your plan. Try again in a moment." } as const;
  const papers: Record<string, string> = {};
  for (const e of exams.data ?? []) if (e.subject_id && e.exam_date) papers[e.subject_id] = e.exam_date;
  if (!Object.keys(papers).length) return { error: "No end-sem papers are set for your class yet, so there is nothing to plan towards." } as const;
  const hasSession = new Set((sessions.data ?? []).map((s) => s.task_id as string));
  const names = new Map((subjects.data ?? []).map((s) => [s.id as string, s.short_name as string]));
  const all = (tasks.data ?? []) as (ReplanTask & { status: string; detail: string | null; topic_codes: string[] | null })[];
  const es: ReplanTask[] = all
    .filter((t) => (t.detail ?? "").includes(PLAN_TAG))
    .map((t) => ({
      id: t.id,
      subject_id: t.subject_id,
      title: t.title,
      kind: t.kind,
      minutes: t.minutes,
      due_date: t.due_date,
      sort_order: t.sort_order,
      movable: t.status === "todo" && !hasSession.has(t.id),
      done: t.status === "done",
    }));
  const result = replan({
    today,
    tasks: es,
    papers,
    holidays: tenant.calendar.holidays,
    phaseByDate: Object.fromEntries((planDays.data ?? []).map((d) => [d.date as string, d.phase as string | null])),
    useHolidays: opts.useHolidays,
    keepAll: opts.keepAll,
  });
  // DSA / GSoC are habits: a missed one is not worth catching up, so the old ones are skipped
  const staleHabits = all.filter(
    (t) => t.status === "todo" && t.due_date && t.due_date < today && (t.topic_codes ?? []).some((c) => c === "track:dsa" || c === "track:gsoc"),
  );
  return { error: undefined, db, userId: user.id, today, result, es, names, papers, planDays: planDays.data ?? [], staleHabits, all } as const;
}

export async function previewReplan(opts: ReplanOpts = {}): Promise<{ error: string } | { preview: ReplanPreview }> {
  try {
    const l = await load(opts);
    if (l.error) return { error: l.error };
    const byId = new Map(l.es.map((t) => [t.id, t]));
    const nm = (id: string | null) => (id && l.names.get(id)) || "";
    const { moves, leftOut, days, ...rest } = l.result;
    return {
      preview: {
        today: l.today,
        result: rest,
        days: days.map((d) => ({
          date: d.date,
          minutes: d.minutes,
          budget: d.budget,
          kept: d.keptMinutes,
          over: d.over,
          isExam: d.isExam,
          isHoliday: d.isHoliday,
          subjects: d.subjects.map(nm),
        })),
        moves: moves
          .filter((m) => m.from !== m.to)
          .map((m) => {
            const t = byId.get(m.id)!;
            return { id: m.id, title: t.title, subject: nm(t.subject_id), minutes: t.minutes ?? 30, from: m.from, to: m.to };
          }),
        leftOut: leftOut.map((t) => ({ id: t.id, title: t.title, subject: nm(t.subject_id), minutes: t.minutes ?? 30, kind: t.kind })),
        staleHabits: l.staleHabits.length,
        papers: Object.entries(l.papers)
          .map(([s, date]) => ({ subject: nm(s), date }))
          .sort((a, b) => a.date.localeCompare(b.date)),
      },
    };
  } catch {
    return { error: "Could not build the preview. Try again in a moment." };
  }
}

interface Backup {
  version: 1;
  at: string;
  tasks: { id: string; due_date: string | null; sort_order: number; status: string }[];
  planDays: Record<string, unknown>[];
  createdDays: string[];
}

const backupDir = (uid: string) => `${uid}/replans`;

async function chunked<T>(items: T[], n: number, fn: (x: T) => PromiseLike<{ error: { message: string } | null }>) {
  for (let i = 0; i < items.length; i += n) {
    const res = await Promise.all(items.slice(i, i + n).map(fn));
    const bad = res.find((r) => r.error);
    if (bad?.error) return bad.error.message;
  }
  return null;
}

export async function applyReplan(opts: ReplanOpts = {}): Promise<{ error: string } | { ok: true; moved: number; left: number; skipped: number }> {
  try {
    const l = await load(opts);
    if (l.error) return { error: l.error };
    const { db, userId, result, names, staleHabits } = l;
    const moves = result.moves.filter((m) => m.from !== m.to);
    if (!moves.length && !result.leftOut.length) return { error: "Nothing to replan: no unfinished end-sem blocks." };

    // 1. the backup, before anything changes. If it cannot be saved nothing is written.
    const touched = [...new Set([...moves.flatMap((m) => [m.from, m.to]), ...result.leftOut.map((t) => t.due_date)].filter((d): d is string => !!d))];
    const existing = new Map(l.planDays.map((d) => [d.date as string, d]));
    const arriving = [...new Set(moves.map((m) => m.to))];
    const rowOf = new Map(l.all.map((t) => [t.id, t]));
    const ids = [...moves.map((m) => m.id), ...result.leftOut.map((t) => t.id), ...staleHabits.map((t) => t.id)];
    const backup: Backup = {
      version: 1,
      at: new Date().toISOString(),
      tasks: ids.map((id) => {
        const t = rowOf.get(id)!;
        return { id, due_date: t.due_date, sort_order: t.sort_order, status: t.status };
      }),
      planDays: touched.map((d) => existing.get(d)).filter((x): x is NonNullable<typeof x> => !!x),
      createdDays: arriving.filter((d) => !existing.has(d)),
    };
    const stamp = backup.at.replace(/[:.]/g, "-");
    const up = await db.storage
      .from("vault")
      .upload(`${backupDir(userId)}/${stamp}.json`, new Blob([JSON.stringify(backup)], { type: "application/json" }), {
        contentType: "application/json",
        upsert: false,
      });
    if (up.error) return { error: "Could not save a backup of your old plan, so nothing was changed." };

    // 2. move the blocks
    const failMsg = "Replan stopped part-way. Use Undo replan to put everything back.";
    let err = await chunked(moves, 12, (m) => db.from("tasks").update({ due_date: m.to, sort_order: m.sort_order }).eq("id", m.id));
    if (!err) err = await chunked(result.leftOut, 12, (t) => db.from("tasks").update({ status: "skipped" }).eq("id", t.id));
    if (!err) err = await chunked(staleHabits, 12, (t) => db.from("tasks").update({ status: "skipped" }).eq("id", t.id));
    if (err) return { error: failMsg };

    // 3. plan days: make sure every new date has a row, and name the days by what is on them
    const nm = (id: string | null) => (id && names.get(id)) || "";
    const dayOf = new Map(result.days.map((d) => [d.date, d]));
    const sortedDates = [...existing.keys()].sort();
    const phaseNear = (d: string) => {
      const prev = [...sortedDates].reverse().find((x) => x < d);
      return ((prev && (existing.get(prev)!.phase as string | null)) ?? "es-first-pass") || "es-first-pass";
    };
    const rows = arriving.map((d) => {
      const day = dayOf.get(d);
      const headline = headlineOf([...new Set((day?.subjects ?? []).map(nm).filter(Boolean))]);
      const wd = (new Date(d + "T12:00:00Z").getUTCDay() + 6) % 7;
      const old = existing.get(d);
      return old
        ? { ...old, headline }
        : { user_id: userId, date: d, phase: phaseNear(d), budget: WEEKDAY_BUDGET[wd], headline, note: null };
    });
    const pd = await db.from("plan_days").upsert(rows, { onConflict: "user_id,date" });
    if (pd.error) return { error: failMsg };

    revalidatePath("/", "layout");
    return { ok: true, moved: moves.length, left: result.leftOut.length, skipped: staleHabits.length };
  } catch {
    return { error: "Replan failed. If anything looks off, use Undo replan." };
  }
}

async function lastBackup(db: Db, userId: string) {
  const { data } = await db.storage.from("vault").list(backupDir(userId), { limit: 20, sortBy: { column: "name", order: "desc" } });
  const f = (data ?? []).find((x) => x.name.endsWith(".json"));
  return f ? `${backupDir(userId)}/${f.name}` : null;
}

/** When the last replan was applied, if it can still be undone. */
export async function lastReplan(): Promise<{ at: string; moved: number } | null> {
  try {
    const db = await createClient();
    const {
      data: { user },
    } = await db.auth.getUser();
    if (!user) return null;
    const path = await lastBackup(db, user.id);
    if (!path) return null;
    const { data } = await db.storage.from("vault").download(path);
    if (!data) return null;
    const b = JSON.parse(await data.text()) as Backup;
    return { at: b.at, moved: b.tasks.length };
  } catch {
    return null;
  }
}

export async function undoReplan(): Promise<{ error: string } | { ok: true; restored: number }> {
  try {
    const db = await createClient();
    const {
      data: { user },
    } = await db.auth.getUser();
    if (!user) return { error: "Sign in again, then try once more." };
    const path = await lastBackup(db, user.id);
    if (!path) return { error: "There is no replan to undo." };
    const { data } = await db.storage.from("vault").download(path);
    if (!data) return { error: "Could not read the backup." };
    const b = JSON.parse(await data.text()) as Backup;
    // blocks ticked since the replan keep their new day
    const err = await chunked(b.tasks, 12, (t) =>
      db.from("tasks").update({ due_date: t.due_date, sort_order: t.sort_order, status: t.status }).eq("id", t.id).neq("status", "done"),
    );
    if (err) return { error: "Undo stopped part-way. Press Undo replan again." };
    if (b.planDays.length) {
      const r = await db.from("plan_days").upsert(b.planDays, { onConflict: "user_id,date" });
      if (r.error) return { error: "Undo stopped part-way. Press Undo replan again." };
    }
    for (const d of b.createdDays) {
      const { count } = await db.from("tasks").select("id", { count: "exact", head: true }).eq("due_date", d);
      if (!count) await db.from("plan_days").delete().eq("date", d);
    }
    await db.storage.from("vault").remove([path]);
    revalidatePath("/", "layout");
    return { ok: true, restored: b.tasks.length };
  } catch {
    return { error: "Undo failed. Try again in a moment." };
  }
}
