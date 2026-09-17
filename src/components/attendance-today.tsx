"use client";

import { useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Minus, X } from "lucide-react";
import { toast } from "sonner";
import { setClassMark, setWholeDay } from "@/lib/actions";
import type { ClassMark, Slot, Subject } from "@/lib/db-types";
import { cn, fmtTime } from "@/lib/utils";

export function AttendanceToday({
  date,
  dayLabel,
  slots,
  subjects,
  marks,
}: {
  date: string;
  dayLabel: string;
  slots: Slot[];
  subjects: Subject[];
  marks: ClassMark[];
}) {
  const router = useRouter();
  const [, start] = useTransition();

  // Ticks land immediately; the write happens behind them.
  type Patch = { slotId: string; attended: boolean | null };
  const [optimistic, applyOptimistic] = useOptimistic(
    marks,
    (prev: ClassMark[], p: Patch) => {
      const rest = prev.filter((m) => m.slot_id !== p.slotId);
      if (p.attended === null) return rest;
      const existing = prev.find((m) => m.slot_id === p.slotId);
      return [
        ...rest,
        { ...(existing ?? ({ id: `tmp-${p.slotId}`, on_date: date, slot_id: p.slotId, subject_id: null } as ClassMark)), attended: p.attended },
      ];
    },
  );

  const markOf = (slotId: string) => optimistic.find((m) => m.slot_id === slotId) ?? null;
  const marked = slots.filter((s) => markOf(s.id)).length;
  const present = slots.filter((s) => markOf(s.id)?.attended).length;

  if (!slots.length) {
    return (
      <p className="px-4 py-4 text-[12.5px] text-muted">
        No classes scheduled for {dayLabel}. Nothing to mark.
      </p>
    );
  }

  const payload = slots.map((s) => ({ slot_id: s.id, subject_id: s.subject_id }));

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-2.5">
        <button
          onClick={() =>
            start(async () => {
              for (const p of payload) applyOptimistic({ slotId: p.slot_id, attended: true });
              try { await setWholeDay(date, payload, true); router.refresh(); }
              catch (e) { toast.error(e instanceof Error ? e.message : "Couldn't save that"); }
            })
          }
          className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-line bg-surface-2 px-2.5 text-[12px] font-medium transition-colors hover:border-[var(--good)] hover:text-[var(--good)] focus-ring"
        >
          <Check size={13} /> I was in today
        </button>
        <button
          onClick={() =>
            start(async () => {
              for (const p of payload) applyOptimistic({ slotId: p.slot_id, attended: false });
              try { await setWholeDay(date, payload, false); router.refresh(); }
              catch (e) { toast.error(e instanceof Error ? e.message : "Couldn't save that"); }
            })
          }
          className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-line bg-surface-2 px-2.5 text-[12px] transition-colors hover:border-[var(--bad)] hover:text-[var(--bad)] focus-ring"
        >
          <X size={13} /> Missed the day
        </button>
        <span className="ml-auto text-[11px] text-subtle">
          {marked ? `${present}/${marked} marked present` : "not marked yet"}
        </span>
      </div>

      <ul className="divide-y divide-line">
        {slots.map((s) => {
          const subject = subjects.find((x) => x.id === s.subject_id) ?? null;
          const mark = markOf(s.id);
          const state: "in" | "out" | null = mark ? (mark.attended ? "in" : "out") : null;

          return (
            <li key={s.id} className="flex items-center gap-3 px-4 py-2">
              <span className="w-[86px] shrink-0 text-[11px] tabular-nums text-subtle">
                {fmtTime(s.start_time)}
              </span>
              <span className="min-w-0 flex-1 truncate text-[12.5px]">
                {subject?.short_name ?? "—"}
                {s.kind === "lab" ? (
                  <span className="ml-1.5 text-[10.5px] text-subtle">lab</span>
                ) : null}
              </span>

              <div className="flex shrink-0 items-center gap-1">
                <Toggle
                  active={state === "in"}
                  tone="good"
                  label="Present"
                  icon={<Check size={12} />}
                  onClick={() => {
                    const next = state === "in" ? null : true;
                    start(async () => {
                      applyOptimistic({ slotId: s.id, attended: next });
                      try {
                        await setClassMark({ on_date: date, slot_id: s.id, subject_id: s.subject_id, attended: next });
                        router.refresh();
                      } catch (e) { toast.error(e instanceof Error ? e.message : "Couldn't save that"); }
                    });
                  }}
                />
                <Toggle
                  active={state === "out"}
                  tone="bad"
                  label="Missed"
                  icon={<X size={12} />}
                  onClick={() => {
                    const next = state === "out" ? null : false;
                    start(async () => {
                      applyOptimistic({ slotId: s.id, attended: next });
                      try {
                        await setClassMark({ on_date: date, slot_id: s.id, subject_id: s.subject_id, attended: next });
                        router.refresh();
                      } catch (e) { toast.error(e instanceof Error ? e.message : "Couldn't save that"); }
                    });
                  }}
                />
              </div>
            </li>
          );
        })}
      </ul>

      <p className="border-t border-line px-4 py-2 text-[11px] leading-relaxed text-subtle">
        <Minus size={10} className="mr-1 inline" />
        Tap again to clear. Anything left unmarked isn&rsquo;t counted either way — so a cancelled
        class or a day you forget won&rsquo;t drag the percentage down.
      </p>
    </div>
  );
}

function Toggle({
  active,
  tone,
  label,
  icon,
  onClick,
}: {
  active: boolean;
  tone: "good" | "bad";
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      title={label}
      className={cn(
        "grid h-7 w-7 place-items-center rounded-lg border transition-colors focus-ring",
        active && tone === "good" && "border-[var(--good)] bg-[var(--good)] text-white",
        active && tone === "bad" && "border-[var(--bad)] bg-[var(--bad)] text-white",
        !active && "border-line text-subtle hover:text-fg",
      )}
    >
      {icon}
    </button>
  );
}
