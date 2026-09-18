"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock, Check, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteGoal, replanGoal, setGoalStatus } from "@/lib/actions";
import type { Goal, Subject, Task, Unit } from "@/lib/db-types";
import { Badge, Bar, Button, Card } from "@/components/ui";
import { ACCENT_CLASS, cn, daysUntil, fmtDuration } from "@/lib/utils";

export function GoalCard({
  goal,
  subject,
  unit,
  tasks,
  today,
}: {
  goal: Goal;
  subject: Subject | null;
  unit: Unit | null;
  tasks: Task[];
  today: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

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
              </span>
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

      <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-line px-4 py-2.5">
        {active ? (
          <>
            <Button size="sm" onClick={() => run("Replanned across the days left", () => replanGoal(goal.id))}>
              <RefreshCw size={13} /> Replan
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
