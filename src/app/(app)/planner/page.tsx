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
import { WeekGrid } from "@/components/planner/week-grid";
import { Badge, Card, CardHead } from "@/components/ui";
import { cn, fmtDuration, istToday } from "@/lib/utils";

export const dynamic = "force-dynamic";

const PHASE_META: Record<string, { name: string; goal: string }> = {
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
  const [tasks, past] = await Promise.all([getTasks({ from: today }), getTasks({ to: today })]);

  const overdue = past.filter((t) => t.status === "todo" && t.due_date !== today);
  const mySlots = slots.filter((s) => s.lab_group === null || s.lab_group === group);
  const upcoming = planDays.filter((d) => d.date >= today);

  // Group the run-up by phase so the shape of the plan is visible without
  // scrolling through eighteen identical day cards.
  const phases: { key: string; days: typeof upcoming }[] = [];
  for (const d of upcoming) {
    const key = d.phase ?? "other";
    const last = phases[phases.length - 1];
    if (last && last.key === key) last.days.push(d);
    else phases.push({ key, days: [d] });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[length:var(--text-page)]">Planner</h1>
          <p className="mt-1 text-[length:var(--text-small)] text-muted">
            Lab group {group}&rsquo;s timetable, and the {upcoming.length}-day run-up to mid-sems.
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

      {/* ── the run-up, one section per phase ──────────────── */}
      {phases.length ? (
        phases.map(({ key, days }) => {
          const meta = PHASE_META[key];
          const minutes = days.reduce(
            (a, d) =>
              a + tasks.filter((t) => t.due_date === d.date).reduce((b, t) => b + (t.minutes ?? 0), 0),
            0,
          );
          return (
            <section key={key + days[0].date} className="space-y-3">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h2 className="text-[length:var(--text-title)]">{meta?.name ?? "Ahead"}</h2>
                <p className="text-[length:var(--text-small)] tabular-nums text-subtle">
                  {days.length} {days.length === 1 ? "day" : "days"}
                  {minutes ? ` · ${fmtDuration(minutes)} planned` : ""}
                </p>
              </div>
              {meta ? (
                <p className="max-w-[68ch] text-[length:var(--text-small)] leading-relaxed text-muted">
                  {meta.goal}
                </p>
              ) : null}

              <Card className="overflow-hidden">
                <ul className="divide-y divide-[var(--border)]">
                  {days.map((d) => {
                    const dayTasks = tasks.filter((t) => t.due_date === d.date);
                    const done = dayTasks.filter((t) => t.status === "done").length;
                    const isToday = d.date === today;
                    const date = new Date(d.date + "T00:00:00+05:30");

                    return (
                      <li
                        key={d.id}
                        className={cn(
                          "grid gap-x-4 px-4 py-3 sm:grid-cols-[104px_1fr]",
                          isToday && "bg-[var(--accent-soft)]/45",
                        )}
                      >
                        {/* date gutter */}
                        <div className="sm:pt-1">
                          <p
                            className={cn(
                              "text-[length:var(--text-small)] tabular-nums",
                              isToday ? "font-semibold text-[var(--accent)]" : "font-medium",
                            )}
                          >
                            {date.toLocaleDateString("en-GB", {
                              weekday: "short",
                              day: "numeric",
                              month: "short",
                              timeZone: "Asia/Kolkata",
                            })}
                          </p>
                          <p className="mt-0.5 text-[length:var(--text-micro)] tabular-nums text-subtle">
                            {isToday
                              ? "today"
                              : dayTasks.length
                                ? `${done}/${dayTasks.length} done`
                                : "open"}
                          </p>
                        </div>

                        <div className="min-w-0">
                          {d.headline ? (
                            <p className="mb-1 text-[length:var(--text-small)] font-medium">
                              {d.headline}
                            </p>
                          ) : null}
                          {dayTasks.length ? (
                            <div className="-mx-4 sm:-mx-2">
                              <TaskList tasks={dayTasks} subjects={subjects} />
                            </div>
                          ) : (
                            <p className="py-1 text-[length:var(--text-small)] text-subtle">
                              Nothing scheduled.
                            </p>
                          )}
                          {d.note ? (
                            <p className="mt-2 text-[length:var(--text-micro)] leading-relaxed text-subtle">
                              {d.note}
                            </p>
                          ) : null}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </Card>
            </section>
          );
        })
      ) : (
        <Card>
          <CardHead title="No plan days ahead" />
          <p className="px-5 py-6 text-center text-[length:var(--text-small)] text-muted">
            The seeded plan runs to 4 Oct. Add your own blocks with the Add button.
          </p>
        </Card>
      )}

      {/* ── exam week ──────────────────────────────────────── */}
      <section className="space-y-2">
        <h2 className="text-[length:var(--text-title)]">Exam week</h2>
        <p className="max-w-[68ch] text-[length:var(--text-small)] leading-relaxed text-muted">
          5&ndash;11 Oct is deliberately empty. Once the datesheet is out, the only sensible plan is
          &ldquo;revise tomorrow&rsquo;s paper&rdquo; — so add those days yourself when you know the
          order.{" "}
          <Link href="/exams" className="text-fg underline underline-offset-2 hover:text-[var(--accent)]">
            Exams
          </Link>{" "}
          has the marking scheme and your marks so far.
        </p>
      </section>
    </div>
  );
}
