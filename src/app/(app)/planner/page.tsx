import Link from "next/link";
import {
  getProfile,
  getSlots,
  getSubjects,
  getTasks,
  getPlanDays,
} from "@/lib/queries";
import { TaskList } from "@/components/task-list";
import { QuickAdd } from "@/components/quick-add";
import { Badge, Bar, Card, CardHead } from "@/components/ui";
import { ACCENT_CLASS, cn, fmtTime, istToday, toMinutes } from "@/lib/utils";

export const dynamic = "force-dynamic";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"] as const;

const PHASE_META: Record<string, { name: string; goal: string }> = {
  triage: {
    name: "Phase 0 — Triage",
    goal: "Stop the bleeding. Find out how far behind you are in each subject and close the DE+CO material gap. Almost no studying — messages, downloads and setup.",
  },
  "first-pass": {
    name: "Phase 1 — First pass",
    goal: "Cover every mid-sem topic once. Not deeply — the goal is that nothing on the paper is a total stranger.",
  },
  drill: {
    name: "Phase 2 — Drill",
    goal: "Problems, not reading. The course-plan assignment, C output prediction, recursion traces, state space trees. This is where marks are made.",
  },
  revise: {
    name: "Phase 3 — Revision & mock",
    goal: "One timed mock per major subject, then fix only what the mock exposed. No new material.",
  },
  exams: { name: "Exam week", goal: "Targeted revision for tomorrow's paper only." },
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
  const tasks = await getTasks({ from: today });
  const past = await getTasks({ to: today });

  const overdue = past.filter((t) => t.status === "todo" && t.due_date !== today);

  const mySlots = slots.filter((s) => s.lab_group === null || s.lab_group === group);
  const subjectById = Object.fromEntries(subjects.map((s) => [s.id, s]));

  const upcoming = planDays.filter((d) => d.date >= today);

  // last class each day → free study window
  const lastEnd: Record<string, string> = {};
  for (const s of mySlots) {
    if (!lastEnd[s.day] || s.end_time > lastEnd[s.day]) lastEnd[s.day] = s.end_time;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-semibold tracking-tight">Planner</h1>
          <p className="text-[13px] text-muted mt-0.5">
            Timetable for lab group {group}, and the 18-day run-up to mid-sems.
          </p>
        </div>
        <QuickAdd subjects={subjects} defaultDate={today} />
      </div>

      {/* ── weekly timetable ───────────────────────────────── */}
      <Card className="overflow-hidden">
        <CardHead
          title="Your week"
          sub={`Group ${group} · B.Tech Sem 1 E · effective 06-08-2026`}
        />
        <div className="overflow-x-auto">
          <div className="min-w-[760px] grid grid-cols-5 divide-x divide-[var(--border)]">
            {DAYS.map((day) => {
              const dayslots = mySlots
                .filter((s) => s.day === day)
                .sort((a, b) => toMinutes(a.start_time) - toMinutes(b.start_time));
              return (
                <div key={day} className="min-w-0">
                  <div className="px-3 py-2 bg-surface-2 border-b border-line">
                    <p className="text-[12px] font-semibold">{day}</p>
                    {lastEnd[day] ? (
                      <p className="text-[11px] text-subtle mt-0.5">
                        free from {fmtTime(lastEnd[day])}
                      </p>
                    ) : null}
                  </div>
                  <div className="p-2 space-y-1.5 min-h-[260px]">
                    {dayslots.map((s) => {
                      const subject = s.subject_id ? subjectById[s.subject_id] : null;
                      return (
                        <Link
                          key={s.id}
                          href={subject ? `/subjects/${subject.slug}` : "#"}
                          className={cn(
                            "block rounded-lg px-2 py-1.5 border transition-colors focus-ring",
                            subject ? ACCENT_CLASS[subject.color] : "",
                            "bg-sc-soft border-transparent hover:border-sc",
                          )}
                        >
                          <p className="text-[11.5px] font-semibold text-sc leading-tight">
                            {subject?.short_name ?? "—"}
                            {s.kind === "lab" ? (
                              <span className="font-normal"> lab</span>
                            ) : null}
                          </p>
                          <p className="text-[10.5px] text-muted mt-0.5 tabular-nums leading-tight">
                            {fmtTime(s.start_time)}–{fmtTime(s.end_time)}
                          </p>
                          <p className="text-[10.5px] text-subtle leading-tight truncate">
                            {s.room}
                          </p>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <p className="border-t border-line bg-surface-2 px-4 py-2.5 text-[12px] text-muted">
          Saturday and Sunday are free. Your longest weekday windows are{" "}
          <strong className="text-fg">Monday and Friday</strong> — classes end at 1:20pm on both.
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

      {/* ── day by day ─────────────────────────────────────── */}
      <div className="space-y-4">
        {upcoming.length ? (
          upcoming.map((d) => {
            const dayTasks = tasks.filter((t) => t.due_date === d.date);
            const done = dayTasks.filter((t) => t.status === "done").length;
            const isToday = d.date === today;
            const phase = d.phase ? PHASE_META[d.phase] : null;

            return (
              <div key={d.id}>
                {/* phase heading when the phase changes */}
                {isFirstOfPhase(upcoming, d) && phase ? (
                  <div className="mt-6 mb-3 first:mt-0">
                    <h2 className="text-[13px] font-semibold tracking-tight">{phase.name}</h2>
                    <p className="text-[12.5px] text-muted mt-1 max-w-2xl leading-relaxed">
                      {phase.goal}
                    </p>
                  </div>
                ) : null}

                <Card className={cn(isToday && "ring-1 ring-[var(--accent)]")}>
                  <CardHead
                    title={
                      <span className="flex items-center gap-2">
                        {new Date(d.date + "T00:00:00+05:30").toLocaleDateString("en-GB", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                          timeZone: "Asia/Kolkata",
                        })}
                        {isToday ? <Badge tone="accent">today</Badge> : null}
                      </span>
                    }
                    sub={d.headline ?? undefined}
                    right={
                      dayTasks.length ? (
                        <div className="flex items-center gap-2.5">
                          <span className="text-[11.5px] text-muted tabular-nums">
                            {done}/{dayTasks.length}
                          </span>
                          <Bar
                            value={dayTasks.length ? done / dayTasks.length : 0}
                            tone="accent"
                            className="w-16"
                          />
                        </div>
                      ) : null
                    }
                  />
                  <TaskList tasks={dayTasks} subjects={subjects} emptyText="Nothing scheduled." />
                  {d.note ? (
                    <p className="border-t border-line bg-surface-2 px-4 py-2.5 text-[12px] text-muted leading-relaxed">
                      {d.note}
                    </p>
                  ) : null}
                </Card>
              </div>
            );
          })
        ) : (
          <Card>
            <CardHead title="No plan days ahead" />
            <p className="px-4 py-6 text-center text-[12.5px] text-muted">
              The seeded plan runs to 4 Oct. Add your own blocks with the Add button.
            </p>
          </Card>
        )}
      </div>

      {/* ── exam week note ─────────────────────────────────── */}
      <Card className="p-4">
        <p className="text-[13px] font-semibold">5–11 Oct · exam week</p>
        <p className="text-[12.5px] text-muted mt-1.5 leading-relaxed max-w-2xl">
          No plan blocks are seeded for exam week on purpose — once you have the datesheet,
          the only sensible plan is &ldquo;revise tomorrow&rsquo;s paper.&rdquo; Add those days
          yourself once the schedule is out.{" "}
          <Link href="/exams" className="underline underline-offset-2 hover:text-fg">
            Exams page
          </Link>{" "}
          has the marking scheme and mark tracking.
        </p>
      </Card>
    </div>
  );
}

function isFirstOfPhase(
  days: { date: string; phase: string | null }[],
  d: { date: string; phase: string | null },
) {
  const i = days.findIndex((x) => x.date === d.date);
  if (i === 0) return true;
  return days[i - 1].phase !== d.phase;
}
