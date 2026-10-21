import Link from "next/link";
import {
  getProfile,
  getSlots,
  getSubjects,
  getTasks,
  getPlanDays,
  getStudySessions,
  getActivityDays,
} from "@/lib/queries";
import { TaskList } from "@/components/task-list";
import { PlanRun, type PhaseMeta } from "@/components/planner/plan-run";
import { studyStreak } from "@/lib/streak";
import { QuickAdd } from "@/components/quick-add";
import { WeekGrid } from "@/components/planner/week-grid";
import { Badge, Card, CardHead } from "@/components/ui";
import { istToday } from "@/lib/utils";

export const dynamic = "force-dynamic";

const PHASE_META: PhaseMeta = {
  triage: {
    name: "Triage",
    goal: "Stop the bleeding. Find out how far behind you are in each subject and close the DE+CO material gap. Almost no studying — messages, downloads and setup.",
  },
  "first-pass": {
    name: "First pass",
    goal: "Cover every mid-sem topic once. Not deeply — the goal is that nothing on the paper is a total stranger.",
  },
  drill: {
    name: "Drill",
    goal: "Problems, not reading. The course-plan assignment, C output prediction, recursion traces, state space trees. This is where marks are made.",
  },
  revise: {
    name: "Revision & mock",
    goal: "One timed mock per major subject, then fix only what the mock exposed. No new material.",
  },
  exams: { name: "Exam week", goal: "Targeted revision for tomorrow's paper only." },
  "es-foundations": {
    name: "End-sem · Foundations",
    goal: "Calculus from school basics (functions, logs, trig, differentiation, integration, vectors, matrices) while DE+CO Units I–II and C Unit 4 get caught up.",
  },
  "es-first-pass": {
    name: "End-sem · First pass",
    goal: "Every remaining unit of all four papers, once. Calculus every day; DE+CO, C and AI take turns. 26–27 Nov is catch-up for anything unticked.",
  },
  "es-revise": {
    name: "End-sem · Revision & mocks",
    goal: "Problem sets and timed mocks, DE+CO first because it is the first paper (Fri 4 Dec). No new material.",
  },
  "es-exams": {
    name: "End-sem papers",
    goal: "DE+CO 4 Dec · Calculus 7 Dec · AI 9 Dec · C 11 Dec. Revise the next paper only.",
  },
};

export default async function PlannerPage() {
  const [profile, slots, subjects, planDays] = await Promise.all([
    getProfile(),
    getSlots(),
    getSubjects(),
    getPlanDays(),
  ]);

  const today = istToday();
  const group = profile?.lab_group ?? 2;
  const mySlots = slots.filter((s) => s.lab_group === null || s.lab_group === group);

  // The current run: the unbroken stretch of plan days that reaches today or
  // the next plan day. Day 1 is its first day, the way Planly numbers a plan.
  const sorted = [...planDays].sort((a, b) => a.date.localeCompare(b.date));
  let end = sorted.findIndex((d) => d.date >= today);
  if (end === -1) end = sorted.length;
  let begin = Math.min(end, sorted.length - 1);
  const dayBefore = (iso: string) =>
    new Date(new Date(iso + "T12:00:00Z").getTime() - 86_400_000).toISOString().slice(0, 10);
  while (begin > 0 && sorted[begin - 1].date === dayBefore(sorted[begin].date)) begin--;
  const run = end < sorted.length || (sorted.length && sorted[sorted.length - 1].date >= today) ? sorted.slice(begin) : [];
  const runStart = run[0]?.date ?? today;

  const [tasks, past, sessions, activity] = await Promise.all([
    getTasks({ from: runStart }),
    getTasks({ to: today }),
    getStudySessions(new Date(runStart + "T00:00:00+05:30").toISOString()),
    getActivityDays(),
  ]);
  // carried over from before this run (inside it, missed days show as Missed)
  const overdue = past.filter((t) => t.status === "todo" && t.due_date && t.due_date < runStart);
  const spent: Record<string, number> = {};
  for (const x of sessions) if (x.task_id) spent[x.task_id] = (spent[x.task_id] ?? 0) + (x.minutes ?? 0);
  const streak = studyStreak(activity, today);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[length:var(--text-page)]">Planner</h1>
          <p className="mt-1 text-[length:var(--text-small)] text-muted">
            Lab group {group}&rsquo;s timetable, and {run.length ? `your ${run.length}-day plan — college, DSA and GSoC` : "your plan"}.
          </p>
        </div>
        <QuickAdd subjects={subjects} defaultDate={today} />
      </div>

      {/* ── the week, drawn to scale ───────────────────────── */}
      <Card className="overflow-hidden">
        <CardHead
          title="Your week"
          sub={`Group ${group} · B.Tech Sem 1 E · effective 06-08-2026`}
        />
        <div className="px-3 pb-3 pt-2">
          <WeekGrid slots={mySlots} subjects={subjects} />
        </div>
        <p className="border-t border-line bg-surface-2 px-5 py-2.5 text-[length:var(--text-small)] text-muted">
          Teaching days only — Saturday and Sunday are yours entirely.
        </p>
      </Card>

      {/* ── carried over ───────────────────────────────────── */}
      {overdue.length ? (
        <Card>
          <CardHead
            title="Carried over"
            sub="Unfinished from earlier days — clear these before adding more"
            right={<Badge tone="warn">{overdue.length}</Badge>}
          />
          <TaskList tasks={overdue} subjects={subjects} showDate />
        </Card>
      ) : null}

      {/* ── the plan, Planly-style ─────────────────────────── */}
      {run.length ? (
        <PlanRun
          days={run}
          tasks={tasks}
          subjects={subjects}
          spent={spent}
          today={today}
          streak={streak}
          phases={PHASE_META}
        />
      ) : (
        <Card>
          <CardHead title="No plan days ahead" />
          <p className="px-5 py-6 text-center text-[length:var(--text-small)] text-muted">
            Nothing is planned from today on. Add your own blocks with the Add button, or set a goal.
          </p>
        </Card>
      )}

      <p className="max-w-[68ch] text-[length:var(--text-small)] leading-relaxed text-muted">
        <Link href="/exams" className="text-fg underline underline-offset-2 hover:text-[var(--accent)]">
          Exams
        </Link>{" "}
        has every paper&rsquo;s date, pattern and scope, and the marking scheme.
      </p>
    </div>
  );
}
