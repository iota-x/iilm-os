"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock, Check, RefreshCw, SlidersHorizontal, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteGoal, replanGoal, setGoalStatus } from "@/lib/actions";
import type { Goal, Subject, Task, Unit } from "@/lib/db-types";
import { Badge, Bar, Button, Card } from "@/components/ui";
import { ACCENT_CLASS, cn, daysUntil, fmtDuration, istToday } from "@/lib/utils";
import { LEVEL_LABEL, type Level } from "@/lib/goals";
import { inputCls } from "@/components/ui";

export function GoalCard({
  goal,
  subject,
  unit,
  tasks,
  today,
  spentMinutes = 0,
}: {
  goal: Goal;
  subject: Subject | null;
  unit: Unit | null;
  tasks: Task[];
  today: string;
  /** minutes logged against this goal */
  spentMinutes?: number;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [adjusting, setAdjusting] = useState(false);
  const [minutes, setMinutes] = useState(goal.daily_minutes || 90);
  const [level, setLevel] = useState<Level>(goal.level ?? 2);
  const [deadline, setDeadline] = useState(goal.deadline);
  const [daysOff, setDaysOff] = useState<string[]>(goal.days_off ?? []);
  const [newOff, setNewOff] = useState("");

  // weeks: learn blocks per sprint, done vs total
  const sprints = (() => {
    const m = new Map<number, { total: number; done: number; review: Task | null }>();
    for (const t of tasks) {
      const n = t.sprint ?? 0;
      const cur = m.get(n) ?? { total: 0, done: 0, review: null };
      if (t.kind === "revise" && !t.topic_id) cur.review = t;
      else {
        cur.total++;
        if (t.status === "done") cur.done++;
      }
      m.set(n, cur);
    }
    return [...m.entries()].filter(([n]) => n > 0).sort((a, b) => a[0] - b[0]);
  })();

  const total = tasks.length;
  const done = tasks.filter((t) => t.status === "done").length;
  const left = daysUntil(goal.deadline);
  const overdue = tasks.filter((t) => t.status !== "done" && t.due_date && t.due_date < today).length;
  const todayLoad = tasks.filter((t) => t.due_date === today);
  const ahead = tasks.filter((t) => t.status !== "done");
  const aheadMinutes = ahead.reduce((n, t) => n + (t.minutes ?? 0), 0);
  const perDay = left > 0 ? Math.round(aheadMinutes / left) : aheadMinutes;
  const active = goal.status === "active";

  function run(label: string, fn: () => Promise<unknown>) {
    start(async () => {
      try {
        await fn();
        toast.success(label);
        router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "That didn't work");
      }
    });
  }

  return (
    <Card className={cn(subject ? ACCENT_CLASS[subject.color] : "", !active && "opacity-70", pending && "opacity-60")}>
      <div className="flex flex-wrap items-start justify-between gap-3 px-5 pt-4">
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-2">
            <span className="font-serif text-[length:var(--text-lead)] font-semibold">{goal.title}</span>
            {subject ? <Badge tone="subject">{subject.short_name}</Badge> : null}
            {goal.status === "done" ? <Badge tone="good">done</Badge> : null}
            {goal.status === "dropped" ? <Badge tone="neutral">dropped</Badge> : null}
          </p>
          <p className="mt-1 text-[length:var(--text-small)] text-muted">
            {goal.scope === "midsem" ? "Mid-sem scope" : goal.scope === "unit" ? `Unit ${unit?.number ?? ""} — ${unit?.title ?? ""}` : "Whole subject"}
            {" · "}
            by{" "}
            {new Date(goal.deadline + "T00:00:00+05:30").toLocaleDateString("en-GB", {
              weekday: "short",
              day: "numeric",
              month: "short",
              timeZone: "Asia/Kolkata",
            })}
            {active ? (
              <span className={cn("ml-2", left < 0 ? "text-[var(--bad)]" : left <= 3 ? "text-[var(--warn)]" : "text-subtle")}>
                {left < 0 ? `${-left}d past` : left === 0 ? "today" : `${left}d left`}
              </span>
            ) : null}
          </p>
        </div>
        <p className="text-[length:var(--text-figure)] font-semibold leading-none tabular-nums tracking-[-0.03em]">
          {done}
          <span className="text-[length:var(--text-lead)] text-subtle">/{total}</span>
        </p>
      </div>

      <div className="px-5 pt-3">
        <Bar value={total ? done / total : 0} />
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[length:var(--text-micro)] text-muted">
          {active ? (
            <>
              <span>
                <span className="text-fg">{todayLoad.length}</span> today
                {todayLoad.length ? ` · ${fmtDuration(todayLoad.reduce((n, t) => n + (t.minutes ?? 0), 0))}` : ""}
              </span>
              <span>
                pace needed: <span className="text-fg">{fmtDuration(perDay)}</span> a day
                {goal.daily_minutes ? (
                  <span className={cn("ml-1", perDay > goal.daily_minutes ? "text-[var(--warn)]" : "text-subtle")}>
                    (you set {fmtDuration(goal.daily_minutes)})
                  </span>
                ) : null}
              </span>
              <span>{LEVEL_LABEL[goal.level ?? 2].toLowerCase()}</span>
              {spentMinutes ? (
                <span>
                  <span className="text-fg">{fmtDuration(spentMinutes)}</span> put in
                </span>
              ) : null}
              {goal.overflow ? (
                <span className="text-[var(--warn)]">
                  {goal.overflow} topic{goal.overflow === 1 ? "" : "s"} don&rsquo;t fit before the deadline — adjust time or date
                </span>
              ) : null}
              {overdue ? (
                <span className="text-[var(--warn)]">{overdue} slipped — replan to spread them</span>
              ) : (
                <span className="text-[var(--good)]">on track</span>
              )}
            </>
          ) : (
            <span>{done} of {total} finished</span>
          )}
        </div>
      </div>

      {active && sprints.length ? (
        <div className="mt-3 flex flex-wrap gap-1.5 px-5">
          {sprints.map(([n, w]) => {
            const complete = w.total > 0 && w.done === w.total;
            return (
              <span
                key={n}
                title={`Week ${n}: ${w.done} of ${w.total} blocks done${w.review ? ` · review on ${w.review.due_date}` : ""}`}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[length:var(--text-micro)] tabular-nums",
                  complete ? "border-[var(--good)]/40 bg-[var(--good)]/10 text-[var(--good)]" : "border-line text-muted",
                )}
              >
                Week {n}
                <span className={complete ? "" : "text-subtle"}>
                  {w.done}/{w.total}
                </span>
                {w.review?.status === "done" ? <Check size={11} /> : null}
              </span>
            );
          })}
        </div>
      ) : null}

      {adjusting ? (
        <div className="mt-3 space-y-3 border-t border-line px-5 py-3">
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <p className="mb-1.5 text-[length:var(--text-micro)] text-muted">Where you are</p>
              <div className="inline-flex rounded-lg border border-line bg-surface-2 p-0.5">
                {([1, 2, 3] as const).map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setLevel(k)}
                    className={cn(
                      "rounded-[7px] px-2 py-1 text-[length:var(--text-micro)] font-medium transition-colors focus-ring",
                      level === k ? "bg-surface text-fg shadow-card" : "text-subtle hover:text-fg",
                    )}
                  >
                    {LEVEL_LABEL[k]}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-1.5 flex items-baseline justify-between text-[length:var(--text-micro)] text-muted">
                <span>Time a day</span>
                <span className="font-medium tabular-nums text-fg">{fmtDuration(minutes)}</span>
              </p>
              <input
                type="range"
                min={30}
                max={240}
                step={15}
                value={minutes}
                onChange={(e) => setMinutes(Number(e.target.value))}
                className="slider w-full"
                aria-label="Minutes a day"
              />
            </div>
            <div>
              <p className="mb-1.5 text-[length:var(--text-micro)] text-muted">Deadline</p>
              <input
                type="date"
                value={deadline}
                min={istToday()}
                onChange={(e) => setDeadline(e.target.value)}
                className={cn(inputCls, "h-8 w-auto text-[length:var(--text-small)]")}
              />
            </div>
          </div>
          <div>
            <p className="mb-1.5 text-[length:var(--text-micro)] text-muted">Days off — the plan skips these</p>
            <div className="flex flex-wrap items-center gap-1.5">
              {daysOff.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDaysOff((xs) => xs.filter((x) => x !== d))}
                  className="inline-flex items-center gap-1 rounded-full border border-line bg-surface-2 px-2 py-0.5 text-[length:var(--text-micro)] hover:text-[var(--bad)] focus-ring"
                  title="Remove"
                >
                  {d} ×
                </button>
              ))}
              <input
                type="date"
                value={newOff}
                min={istToday()}
                onChange={(e) => setNewOff(e.target.value)}
                className={cn(inputCls, "h-7 w-auto text-[length:var(--text-micro)]")}
                aria-label="Add a day off"
              />
              <Button
                size="sm"
                type="button"
                disabled={!newOff || daysOff.includes(newOff)}
                onClick={() => {
                  setDaysOff((xs) => [...xs, newOff].sort());
                  setNewOff("");
                }}
              >
                Add
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="primary"
              onClick={() =>
                run("Replanned with the new settings", async () => {
                  const r = await replanGoal(goal.id, { daily_minutes: minutes, level, deadline, days_off: daysOff });
                  setAdjusting(false);
                  if (r.overflow) toast.warning(`${r.overflow} topics still don't fit — needs ${fmtDuration(r.neededPerDay)} a day`);
                })
              }
            >
              <RefreshCw size={13} /> Replan with these
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setAdjusting(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-line px-4 py-2.5">
        {active ? (
          <>
            <Button size="sm" onClick={() => run("Replanned across the days left", () => replanGoal(goal.id))}>
              <RefreshCw size={13} /> Replan
            </Button>
            <Button size="sm" onClick={() => setAdjusting((v) => !v)} aria-expanded={adjusting}>
              <SlidersHorizontal size={13} /> Adjust
            </Button>
            <Button size="sm" onClick={() => run("Marked done", () => setGoalStatus(goal.id, "done"))}>
              <Check size={13} /> Done
            </Button>
            <Button size="sm" variant="ghost" onClick={() => run("Dropped", () => setGoalStatus(goal.id, "dropped"))}>
              Drop
            </Button>
          </>
        ) : (
          <Button size="sm" onClick={() => run("Back on", () => setGoalStatus(goal.id, "active"))}>
            <CalendarClock size={13} /> Reactivate
          </Button>
        )}
        <Button size="sm" variant="danger" className="ml-auto" onClick={() => run("Deleted", () => deleteGoal(goal.id))}>
          <Trash2 size={13} /> Delete
        </Button>
      </div>
    </Card>
  );
}
