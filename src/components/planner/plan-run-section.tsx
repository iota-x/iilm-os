import {
  getSubjects,
  getTasks,
  getPlanDays,
  getStudySessions,
  getActivityDays,
} from "@/lib/queries";
import { PlanRun, type PhaseMeta } from "@/components/planner/plan-run";
import { Card, CardHead } from "@/components/ui";
import { studyStreak } from "@/lib/streak";
import { istToday } from "@/lib/utils";

export const PHASE_META: PhaseMeta = {
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

/**
 * The prep plan, Planly-style: the current run of plan days with every block
 * that belongs to it (end-sem prep, DSA, GSoC). Blocks you add yourself are
 * college to-dos and stay on the Planner.
 */
export async function PlanRunSection() {
  const [subjects, planDays] = await Promise.all([getSubjects(), getPlanDays()]);
  const today = istToday();

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
  if (!run.length) {
    return (
      <Card>
        <CardHead title="No prep plan running" />
        <p className="px-5 py-6 text-center text-[length:var(--text-small)] text-muted">
          Nothing is planned from today on. Set a goal and its days land here.
        </p>
      </Card>
    );
  }
  const runStart = run[0].date;

  const [all, sessions, activity] = await Promise.all([
    getTasks({ from: runStart }),
    getStudySessions(new Date(runStart + "T00:00:00+05:30").toISOString()),
    getActivityDays(),
  ]);
  const tasks = all.filter((t) => t.source !== "manual");
  const spent: Record<string, number> = {};
  for (const x of sessions) if (x.task_id) spent[x.task_id] = (spent[x.task_id] ?? 0) + (x.minutes ?? 0);

  return (
    <PlanRun
      days={run}
      tasks={tasks}
      subjects={subjects}
      spent={spent}
      today={today}
      streak={studyStreak(activity, today)}
      phases={PHASE_META}
    />
  );
}
