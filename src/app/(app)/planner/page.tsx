import Link from "next/link";
import { getBoardDeadlines, getProfile, getSlots, getSubjects, getTasks, getTenant } from "@/lib/queries";
import { TaskList } from "@/components/task-list";
import { QuickAdd } from "@/components/quick-add";
import { CatchDeadlines } from "@/components/catch-deadlines";
import { AddToPlanner } from "@/components/class/add-to-planner";
import { WeekGrid } from "@/components/planner/week-grid";
import { ArrowRight, MessageSquareText } from "lucide-react";
import { Badge, Card, CardHead } from "@/components/ui";
import { fmtDate, istToday } from "@/lib/utils";
import { holidayOn, holidayRange, upcomingHolidays } from "@/lib/holidays";

export const dynamic = "force-dynamic";


export default async function PlannerPage({ searchParams }: { searchParams: Promise<{ catch?: string }> }) {
  const { catch: stash } = await searchParams;
  const tenant = await getTenant();
  const cal = tenant.calendar;
  const [profile, slots, subjects] = await Promise.all([getProfile(), getSlots(), getSubjects()]);

  const today = istToday();
  const group = profile?.lab_group ?? 2;
  const mySlots = slots.filter((s) => s.lab_group === null || s.lab_group === group);

  // College to-dos are the blocks you add yourself (assignments, submissions,
  // forms). The prep plan — end-sems, DSA, GSoC — lives on Sprint.
  const [ahead, past, board] = await Promise.all([getTasks({ from: today }), getTasks({ to: today }), getBoardDeadlines(today)]);
  const fromBoard = board.filter((b) => !b.added);
  const mine = (t: { source: string }) => t.source === "manual" || t.source === "classroom";
  const upcoming = ahead.filter((t) => mine(t) && t.status === "todo");
  const overdue = past.filter((t) => mine(t) && t.status === "todo" && t.due_date !== today);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[length:var(--text-page)]">Planner</h1>
          <p className="mt-1 text-[length:var(--text-small)] text-muted">
            Lab group {group}&rsquo;s timetable and your college to-dos. The prep plan is on{" "}
            <Link href="/sprint" className="text-fg underline underline-offset-2 hover:text-[var(--accent)]">
              Sprint
            </Link>
            .
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {stash ? null : (
            <Link href="/planner?catch=new" scroll={false} className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 text-[length:var(--text-micro)] font-medium hover:bg-surface-2 focus-ring">
              <MessageSquareText size={14} /> Catch from WhatsApp
            </Link>
          )}
          <QuickAdd subjects={subjects} defaultDate={today} />
        </div>
      </div>
      {stash ? <CatchDeadlines subjects={subjects} stash={stash === "new" ? undefined : stash} /> : null}

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

      {/* ── college to-dos ─────────────────────────────────── */}
      <Card>
        <CardHead
          title="Coming up"
          sub="Assignments, submissions, forms — anything you add with the Add button"
          right={upcoming.length ? <Badge>{upcoming.length}</Badge> : null}
        />
        <TaskList tasks={upcoming} subjects={subjects} showDate emptyText="Nothing added. Use Add for an assignment or a deadline." />
      </Card>

      {/* ── deadlines classmates caught ────────────────────── */}
      {fromBoard.length ? (
        <Card>
          <CardHead
            title="From the class board"
            sub="Deadlines classmates caught from WhatsApp and the ERP that aren't on your Planner yet"
            right={<Badge tone="accent">{fromBoard.length}</Badge>}
          />
          <ul className="divide-y divide-[var(--border)]">
            {fromBoard.map((b) => {
              const s = subjects.find((x) => x.slug === b.subject_slug);
              return (
                <li key={b.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <Link href={`/class/${b.id}`} className="font-medium hover:underline focus-ring rounded">{b.title}</Link>
                    <p className="mt-0.5 text-[length:var(--text-micro)] text-subtle">
                      Due {fmtDate(b.due_date)}{s ? ` · ${s.short_name}` : ""} · posted by {b.author}
                    </p>
                  </div>
                  <AddToPlanner id={b.id} added={false} />
                </li>
              );
            })}
          </ul>
        </Card>
      ) : null}

      {/* ── holidays ───────────────────────────────────────── */}
      <Card>
        <CardHead
          title="Holidays"
          sub="Student holiday calendar, odd semester 2026"
          right={holidayOn(today, cal.holidays) ? <Badge tone="good">today</Badge> : null}
        />
        <ul className="divide-y divide-[var(--border)]">
          {upcomingHolidays(today, cal.holidays).map((h) => {
            const on = h.from <= today && today <= h.to;
            const days = Math.round((new Date(h.from + "T00:00:00Z").getTime() - new Date(today + "T00:00:00Z").getTime()) / 86_400_000);
            return (
              <li key={h.name} className="flex items-baseline justify-between gap-3 px-5 py-2.5 text-[length:var(--text-small)]">
                <span className={on ? "font-medium text-[var(--good)]" : "font-medium"}>{h.name}</span>
                <span className="text-right tabular-nums text-muted">
                  {holidayRange(h)}
                  <span className="ml-2 text-[length:var(--text-micro)] text-subtle">
                    {on ? "now" : `in ${days} day${days === 1 ? "" : "s"}`}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      </Card>

      <Link
        href="/sprint"
        className="flex items-center justify-between rounded-[var(--radius-card)] bg-surface px-5 py-4 shadow-card hover:bg-surface-2 focus-ring dark:border dark:border-line dark:shadow-none"
      >
        <span>
          <span className="block text-[length:var(--text-small)] font-medium">Your prep plan is on Sprint</span>
          <span className="block text-[length:var(--text-micro)] text-subtle">End-sem prep, DSA and GSoC, day by day</span>
        </span>
        <ArrowRight size={16} className="text-subtle" />
      </Link>

      <p className="max-w-[68ch] text-[length:var(--text-small)] leading-relaxed text-muted">
        <Link href="/exams" className="text-fg underline underline-offset-2 hover:text-[var(--accent)]">
          Exams
        </Link>{" "}
        has every paper&rsquo;s date, pattern and scope, and the marking scheme.
      </p>
    </div>
  );
}
