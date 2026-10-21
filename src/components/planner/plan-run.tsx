import Link from "next/link";
import { ArrowRight, CalendarDays, CheckCircle2, ChevronDown, Flame } from "lucide-react";
import type { PlanDay, Subject, Task } from "@/lib/db-types";
import type { Streak } from "@/lib/streak";
import { TaskList } from "@/components/task-list";
import { Badge, Bar, Card } from "@/components/ui";
import { cn, fmtDuration } from "@/lib/utils";
import { holidayOn } from "@/lib/holidays";

export type PhaseMeta = Record<string, { name: string; goal: string }>;

type Status = "done" | "today" | "missed" | "upcoming" | "open";

const STATUS: Record<Status, { label: string; tone: "good" | "accent" | "warn" | "neutral" }> = {
  done: { label: "Completed", tone: "good" },
  today: { label: "Today", tone: "accent" },
  missed: { label: "Missed", tone: "warn" },
  upcoming: { label: "Upcoming", tone: "neutral" },
  open: { label: "Open", tone: "neutral" },
};

const TRACK_OF = (t: Task) =>
  t.topic_codes?.includes("track:dsa") ? "DSA" : t.topic_codes?.includes("track:gsoc") ? "GSoC" : "College";

/**
 * The plan the way Planly shows one: every day numbered from the start of the
 * run, folded to a single row with its status, today open. Days already behind
 * you collect at the bottom. The rail says what to start next and how today is
 * going, and splits the week by goal — college, DSA, GSoC.
 */
export function PlanRun({
  days,
  tasks,
  subjects,
  spent,
  today,
  streak,
  phases,
}: {
  /** the run's plan days in date order, the first one is Day 1 */
  days: PlanDay[];
  tasks: Task[];
  subjects: Subject[];
  /** minutes logged per task id */
  spent: Record<string, number>;
  today: string;
  streak: Streak;
  phases: PhaseMeta;
}) {
  const byDate = new Map<string, Task[]>();
  for (const t of tasks) {
    if (!t.due_date || t.status === "skipped") continue;
    byDate.set(t.due_date, [...(byDate.get(t.due_date) ?? []), t]);
  }
  const numbered = days.map((d, i) => {
    const list = byDate.get(d.date) ?? [];
    const done = list.filter((t) => t.status === "done").length;
    const status: Status =
      list.length && done === list.length
        ? "done"
        : d.date === today
          ? "today"
          : d.date < today
            ? list.length
              ? "missed"
              : "open"
            : "upcoming";
    return { day: d, n: i + 1, list, done, status };
  });

  const ahead = numbered.filter((x) => x.day.date >= today);
  const behind = numbered.filter((x) => x.day.date < today);
  const current = numbered.find((x) => x.day.date === today) ?? null;

  // phases, in order, over the days still ahead
  const groups: { key: string; items: typeof ahead }[] = [];
  for (const x of ahead) {
    const key = x.day.phase ?? "other";
    const last = groups[groups.length - 1];
    if (last && last.key === key) last.items.push(x);
    else groups.push({ key, items: [x] });
  }

  // this week (Mon–Sun) by goal
  const monday = new Date(today + "T00:00:00+05:30");
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  const weekStart = monday.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
  const sunday = new Date(monday.getTime() + 6 * 86_400_000).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
  const week: Record<string, { done: number; planned: number }> = {
    College: { done: 0, planned: 0 },
    DSA: { done: 0, planned: 0 },
    GSoC: { done: 0, planned: 0 },
  };
  for (const t of tasks) {
    if (!t.due_date || t.due_date < weekStart || t.due_date > sunday || t.status === "skipped") continue;
    const w = week[TRACK_OF(t)];
    w.planned += t.minutes ?? 0;
    if (t.status === "done") w.done += t.minutes ?? 0;
  }

  return (
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="min-w-0 space-y-6">
        {groups.map(({ key, items }) => {
          const meta = phases[key];
          const minutes = items.reduce((a, x) => a + x.list.reduce((b, t) => b + (t.minutes ?? 0), 0), 0);
          return (
            <section key={key + items[0].day.date} className="space-y-3">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h2 className="text-[length:var(--text-title)]">{meta?.name ?? "Ahead"}</h2>
                <p className="text-[length:var(--text-small)] tabular-nums text-subtle">
                  Day {items[0].n}
                  {items.length > 1 ? `–${items[items.length - 1].n}` : ""}
                  {minutes ? ` · ${fmtDuration(minutes)} planned` : ""}
                </p>
              </div>
              {meta ? (
                <p className="max-w-[68ch] text-[length:var(--text-small)] leading-relaxed text-muted">{meta.goal}</p>
              ) : null}
              <div className="space-y-2">
                {items.map((x) => (
                  <DayRow key={x.day.id} {...x} subjects={subjects} spent={spent} open={x.status === "today"} />
                ))}
              </div>
            </section>
          );
        })}

        {behind.length ? (
          <section className="space-y-3">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h2 className="text-[length:var(--text-title)]">Behind you</h2>
              <p className="text-[length:var(--text-small)] tabular-nums text-subtle">
                {behind.filter((x) => x.status === "done").length} of {behind.length} days completed
              </p>
            </div>
            <div className="space-y-2">
              {[...behind].reverse().map((x) => (
                <DayRow key={x.day.id} {...x} subjects={subjects} spent={spent} open={false} />
              ))}
            </div>
          </section>
        ) : null}
      </div>

      {/* ── the rail ─────────────────────────────────────────── */}
      <aside className="space-y-4 lg:sticky lg:top-4">
        <NextUp current={current ?? ahead[0] ?? null} subjects={subjects} isToday={Boolean(current)} />
        <TodayProgress current={current} spent={spent} streak={streak} />
        <Card className="space-y-3 px-4 py-4">
          <p className="text-[length:var(--text-micro)] font-semibold uppercase tracking-wide text-subtle">This week by goal</p>
          {Object.entries(week).map(([name, w]) => (
            <div key={name} className="space-y-1">
              <div className="flex items-baseline justify-between text-[length:var(--text-small)]">
                <span className="font-medium">{name}</span>
                <span className="tabular-nums text-muted">
                  {fmtDuration(w.done)} / {fmtDuration(w.planned)}
                </span>
              </div>
              <Bar value={w.planned ? w.done / w.planned : 0} tone="accent" />
            </div>
          ))}
        </Card>
      </aside>
    </div>
  );
}

function DayRow({
  day,
  n,
  list,
  done,
  status,
  subjects,
  spent,
  open,
}: {
  day: PlanDay;
  n: number;
  list: Task[];
  done: number;
  status: Status;
  subjects: Subject[];
  spent: Record<string, number>;
  open: boolean;
}) {
  const date = new Date(day.date + "T00:00:00+05:30").toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "Asia/Kolkata",
  });
  const todo = list.filter((t) => t.status !== "done");
  const finished = list.filter((t) => t.status === "done");
  const est = list.reduce((a, t) => a + (t.minutes ?? 0), 0);
  const logged = list.reduce((a, t) => a + (spent[t.id] ?? 0), 0);
  const s = STATUS[status];
  const holiday = holidayOn(day.date);
  return (
    <details
      open={open}
      className={cn(
        "group rounded-[var(--radius-card)] bg-surface shadow-card dark:border dark:border-line dark:shadow-none",
        status === "today" && "ring-1 ring-[var(--accent)]",
      )}
    >
      <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3 focus-ring rounded-[var(--radius-card)] [&::-webkit-details-marker]:hidden">
        {status === "done" ? (
          <CheckCircle2 size={17} className="shrink-0 text-[var(--good)]" />
        ) : (
          <CalendarDays size={17} className="shrink-0 text-subtle" />
        )}
        <span className="text-[length:var(--text-small)] font-semibold tabular-nums">Day {n}</span>
        <span className="text-[length:var(--text-small)] tabular-nums text-muted">{date}</span>
        {holiday ? <Badge tone="good">{holiday.name}</Badge> : null}
        <span className="hidden min-w-0 flex-1 truncate text-[length:var(--text-small)] text-subtle sm:block">
          {day.headline ?? ""}
        </span>
        <span className="ml-auto flex shrink-0 items-center gap-2 sm:ml-0">
          {list.length ? (
            <span className="text-[length:var(--text-micro)] tabular-nums text-subtle">
              {done}/{list.length}
            </span>
          ) : null}
          <Badge tone={s.tone}>{s.label}</Badge>
          <ChevronDown size={15} className="text-subtle transition-transform group-open:rotate-180" />
        </span>
      </summary>
      <div className="border-t border-line pb-2">
        <div className="flex items-baseline justify-between px-4 pt-3 text-[length:var(--text-micro)] text-subtle">
          <span>{todo.length ? `${todo.length} to do` : "All done"}</span>
          <span className="tabular-nums">
            {logged ? `${fmtDuration(Math.round(logged))} spent · ` : ""}
            {fmtDuration(est)} planned
          </span>
        </div>
        {todo.length ? <TaskList tasks={todo} subjects={subjects} spent={spent} /> : null}
        {finished.length ? (
          <>
            <p className="px-4 pt-2 text-[length:var(--text-micro)] font-medium text-subtle">Completed</p>
            <TaskList tasks={finished} subjects={subjects} spent={spent} />
          </>
        ) : null}
        {!list.length ? (
          <p className="px-4 py-3 text-[length:var(--text-small)] text-subtle">Nothing scheduled.</p>
        ) : null}
      </div>
    </details>
  );
}

function NextUp({
  current,
  subjects,
  isToday,
}: {
  current: { n: number; list: Task[]; day: PlanDay } | null;
  subjects: Subject[];
  /** false when today has no plan day and this is the next one */
  isToday: boolean;
}) {
  const queue = current?.list.filter((t) => t.status === "todo") ?? [];
  const next = queue[0];
  const k = next ? current!.list.indexOf(next) + 1 : 0;
  const sub = next?.subject_id ? subjects.find((x) => x.id === next.subject_id) : null;
  return (
    <Card className="px-4 py-4">
      <p className="text-[length:var(--text-micro)] font-semibold uppercase tracking-wide text-subtle">
        {next
          ? isToday
            ? `Start Day ${current!.n} · Task ${k}`
            : `Up next · Day ${current!.n} · ${new Date(current!.day.date + "T00:00:00+05:30").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "Asia/Kolkata" })}`
          : current
            ? `Day ${current.n}`
            : "Today"}
      </p>
      {next ? (
        <Link
          href="/"
          className="mt-2 flex items-center gap-3 rounded-lg bg-surface-2 px-3 py-3 hover:bg-surface-3 focus-ring"
        >
          <span className="min-w-0 flex-1">
            <span className="block text-[length:var(--text-small)] font-medium leading-snug">{next.title}</span>
            <span className="mt-0.5 block text-[length:var(--text-micro)] text-subtle">
              {[sub?.short_name ?? TRACK_OF(next), next.minutes ? fmtDuration(next.minutes) : null]
                .filter(Boolean)
                .join(" · ")}
              {queue.length > 1 ? ` · ${queue.length - 1} more after this` : ""}
            </span>
          </span>
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--accent)] text-white">
            <ArrowRight size={16} />
          </span>
        </Link>
      ) : (
        <p className="mt-2 text-[length:var(--text-small)] text-muted">
          {current ? "Everything for today is done." : "No plan day today."}
        </p>
      )}
    </Card>
  );
}

function TodayProgress({
  current,
  spent,
  streak,
}: {
  current: { list: Task[]; done: number } | null;
  spent: Record<string, number>;
  streak: Streak;
}) {
  const list = current?.list ?? [];
  const scheduled = list.reduce((a, t) => a + (t.minutes ?? 0), 0);
  const doneMin = list.filter((t) => t.status === "done").reduce((a, t) => a + (t.minutes ?? 0), 0);
  const logged = list.reduce((a, t) => a + (spent[t.id] ?? 0), 0);
  const pct = scheduled ? doneMin / scheduled : 0;
  const rows: [string, string][] = [
    ["Tasks", `${current?.done ?? 0} / ${list.length}`],
    ["Time spent", fmtDuration(Math.round(logged))],
    ["Scheduled", fmtDuration(scheduled)],
  ];
  return (
    <Card className="space-y-3 px-4 py-4">
      <div className="flex items-center justify-between">
        <p className="text-[length:var(--text-micro)] font-semibold uppercase tracking-wide text-subtle">Today&rsquo;s progress</p>
        <span
          className={cn(
            "inline-flex items-center gap-1 text-[length:var(--text-small)] font-semibold tabular-nums",
            streak.days ? "text-[var(--warn)]" : "text-subtle",
          )}
          title={streak.atRisk ? "Do something today to keep it" : `Best: ${streak.best} days`}
        >
          <Flame size={15} /> {streak.days}
        </span>
      </div>
      <dl className="space-y-2">
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-baseline justify-between text-[length:var(--text-small)]">
            <dt className="text-muted">{k}</dt>
            <dd className="font-medium tabular-nums">{v}</dd>
          </div>
        ))}
      </dl>
      <div className="flex items-center gap-3">
        <Bar value={pct} tone="accent" className="flex-1" />
        <span className="text-[length:var(--text-small)] font-medium tabular-nums">{Math.round(pct * 100)}%</span>
      </div>
    </Card>
  );
}
