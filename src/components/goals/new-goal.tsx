"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { createGoal } from "@/lib/actions";
import { daysBetween, minutesFor, remaining, summarise } from "@/lib/goals";
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
  const [open, setOpen] = useState(false);
  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? "");
  const [scope, setScope] = useState<"midsem" | "unit" | "subject">("midsem");
  const [unitId, setUnitId] = useState("");
  const [deadline, setDeadline] = useState(defaultDeadline);
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
    const minutes = todo.reduce((n, t) => n + minutesFor(t), 0);
    return { todo, days, ...summarise(todo.length, days.length, minutes) };
  }, [topics, units, subjectId, scope, unitId, deadline]);

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
              const r = await createGoal({ title, subject_id: subjectId, unit_id: unitId || null, scope, deadline });
              toast.success(`${r.topics} topics over ${r.days} days — first one is on Today`);
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

        {/* the preview is the promise */}
        <div className="rounded-[var(--radius-control)] bg-surface-2 px-3 py-2.5 text-[length:var(--text-small)]">
          {!preview.todo.length ? (
            <span className="text-muted">Nothing left to do in that scope — everything is already mastered.</span>
          ) : !preview.days.length ? (
            <span className="text-[var(--bad)]">That deadline has passed.</span>
          ) : (
            <>
              <span className="font-medium">{preview.text}</span>
              {preview.heavy ? (
                <span className="ml-2 text-[var(--warn)]">— that&rsquo;s a lot for a school day; consider a later date</span>
              ) : null}
            </>
          )}
        </div>

        <div className="flex justify-end">
          <Button type="submit" variant="primary" size="sm" disabled={pending || !preview.todo.length || !preview.days.length}>
            {pending ? <Loader2 size={14} className="animate-spin" /> : null}
            Make the plan
          </Button>
        </div>
      </form>
    </Card>
  );
}
