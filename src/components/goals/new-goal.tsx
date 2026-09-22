"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useUrlFlag } from "@/lib/client-hooks";
import { Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { createGoal } from "@/lib/actions";
import { daysBetween, describeFit, fit, LEVEL_LABEL, remaining, type Level } from "@/lib/goals";
import type { Subject, Topic, Unit } from "@/lib/db-types";
import { Button, Card, chipCls, inputCls } from "@/components/ui";
import { cn, istToday } from "@/lib/utils";

export function NewGoal({
  subjects,
  units,
  topics,
  defaultDeadline,
}: {
  subjects: Subject[];
  units: Unit[];
  topics: Topic[];
  defaultDeadline: string;
}) {
  const router = useRouter();
  const [openState, setOpen] = useState<boolean | null>(null);
  const wantOpen = useUrlFlag("new");
  const open = openState ?? wantOpen;
  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? "");
  const [scope, setScope] = useState<"midsem" | "unit" | "subject">("midsem");
  const [unitId, setUnitId] = useState("");
  const [deadline, setDeadline] = useState(defaultDeadline);
  const [minutes, setMinutes] = useState(90);
  const [level, setLevel] = useState<Level>(2);
  const [pending, start] = useTransition();

  const subject = subjects.find((s) => s.id === subjectId);
  const subjectUnits = units.filter((u) => u.subject_id === subjectId);

  // the same maths the server runs, so the preview is the plan
  const preview = useMemo(() => {
    let scoped = topics.filter((t) => t.subject_id === subjectId);
    if (scope === "midsem") scoped = scoped.filter((t) => t.in_midsem);
    if (scope === "unit") scoped = scoped.filter((t) => t.unit_id === unitId);
    const unitRank = new Map(units.map((u) => [u.id, u.number]));
    const todo = remaining(scoped, unitRank);
    const days = deadline >= istToday() ? daysBetween(istToday(), deadline) : [];
    const f = fit(todo, days, minutes, level);
    return { todo, days, fit: f, ...describeFit(f, minutes) };
  }, [topics, units, subjectId, scope, unitId, deadline, minutes, level]);

  const title =
    subject
      ? scope === "midsem"
        ? `${subject.short_name} mid-sem scope`
        : scope === "unit"
          ? `${subject.short_name} Unit ${subjectUnits.find((u) => u.id === unitId)?.number ?? ""}`
          : `All of ${subject.short_name}`
      : "";

  if (!open) {
    return (
      <Button variant="primary" onClick={() => setOpen(true)}>
        <Plus size={14} /> New goal
      </Button>
    );
  }

  return (
    <Card className="w-full p-4">
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (!preview.todo.length || !preview.days.length) return;
          start(async () => {
            try {
              const r = await createGoal({
                title,
                subject_id: subjectId,
                unit_id: unitId || null,
                scope,
                deadline,
                daily_minutes: minutes,
                level,
              });
              toast.success(
                r.overflow
                  ? `${r.topics - r.overflow} topics planned; ${r.overflow} don't fit yet — replan with more time or a later date`
                  : `${r.topics} topics over ${r.days} days — first one is on Today`,
              );
              setOpen(false);
              router.refresh();
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "Couldn't create the goal");
            }
          });
        }}
      >
        <div className="flex items-center justify-between">
          <p className="text-[length:var(--text-small)] font-medium">{title || "New goal"}</p>
          <Button type="button" variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Close">
            <X size={14} />
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          <select value={subjectId} onChange={(e) => { setSubjectId(e.target.value); setUnitId(""); }} className={chipCls}>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.short_name}</option>
            ))}
          </select>
          <div className="inline-flex rounded-lg border border-line bg-surface-2 p-0.5">
            {([["midsem", "Mid-sem scope"], ["unit", "One unit"], ["subject", "Whole subject"]] as const).map(([k, label]) => (
              <button
                key={k}
                type="button"
                onClick={() => setScope(k)}
                className={cn(
                  "rounded-[7px] px-2.5 py-1 text-[length:var(--text-micro)] font-medium transition-colors focus-ring",
                  scope === k ? "bg-surface text-fg shadow-card" : "text-subtle hover:text-fg",
                )}
              >
                {label}
              </button>
            ))}
          </div>
          {scope === "unit" ? (
            <select value={unitId} onChange={(e) => setUnitId(e.target.value)} className={chipCls}>
              <option value="">Which unit?</option>
              {subjectUnits.map((u) => (
                <option key={u.id} value={u.id}>Unit {u.number} — {u.title.slice(0, 40)}</option>
              ))}
            </select>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="deadline" className="text-[length:var(--text-small)] text-muted">By</label>
          <input
            id="deadline"
            type="date"
            value={deadline}
            min={istToday()}
            onChange={(e) => setDeadline(e.target.value)}
            className={cn(inputCls, "h-8 w-auto text-[length:var(--text-small)]")}
          />
        </div>

        {/* where you're starting from, and how much time a day */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="mb-1.5 text-[length:var(--text-micro)] text-muted">How well do you know it already?</p>
            <div className="inline-flex rounded-lg border border-line bg-surface-2 p-0.5">
              {([1, 2, 3] as const).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setLevel(k)}
                  className={cn(
                    "rounded-[7px] px-2.5 py-1 text-[length:var(--text-micro)] font-medium transition-colors focus-ring",
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
              <span>Time a day for this</span>
              <span className="font-medium tabular-nums text-fg">{fmtHours(minutes)}</span>
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
        </div>

        {/* the preview is the promise */}
        <div
          className={cn(
            "rounded-[var(--radius-control)] px-3 py-2.5 text-[length:var(--text-small)]",
            !preview.todo.length || !preview.days.length
              ? "bg-surface-2"
              : preview.ok
                ? "bg-[var(--good)]/10 text-[var(--good)]"
                : "bg-[var(--warn)]/10 text-[var(--warn)]",
          )}
        >
          {!preview.todo.length ? (
            <span className="text-muted">Nothing left to do in that scope — everything is already mastered.</span>
          ) : !preview.days.length ? (
            <span className="text-[var(--bad)]">That deadline has passed.</span>
          ) : (
            <>
              <span className="font-medium">
                {preview.todo.length} topic{preview.todo.length === 1 ? "" : "s"} · {preview.days.length} day
                {preview.days.length === 1 ? "" : "s"}.
              </span>{" "}
              {preview.text}
            </>
          )}
        </div>

        {/* the days, drawn */}
        {preview.todo.length && preview.days.length ? (
          <div className="flex items-end gap-px overflow-hidden rounded-[var(--radius-control)]" aria-hidden>
            {preview.fit.plan.map((d) => (
              <span
                key={d.date}
                title={`${d.date}: ${d.topics.length} topic${d.topics.length === 1 ? "" : "s"}, ${d.minutes} min`}
                className="flex-1 rounded-sm bg-surface-3"
                style={{ height: 22 }}
              >
                <span
                  className="block w-full rounded-sm bg-[var(--accent)]"
                  style={{ height: `${Math.min(100, Math.round((d.minutes / minutes) * 100))}%`, marginTop: `${100 - Math.min(100, Math.round((d.minutes / minutes) * 100))}%` }}
                />
              </span>
            ))}
          </div>
        ) : null}

        <div className="flex justify-end">
          <Button type="submit" variant="primary" size="sm" disabled={pending || !preview.todo.length || !preview.days.length}>
            {pending ? <Loader2 size={14} className="animate-spin" /> : null}
            {preview.ok || !preview.todo.length ? "Make the plan" : "Plan what fits"}
          </Button>
        </div>
      </form>
    </Card>
  );
}

function fmtHours(m: number) {
  const h = Math.floor(m / 60);
  const r = m % 60;
  return h ? `${h}h${r ? ` ${r}m` : ""}` : `${r}m`;
}
