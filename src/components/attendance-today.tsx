"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Minus, X } from "lucide-react";
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
  const [pending, start] = useTransition();

  const markOf = (slotId: string) => marks.find((m) => m.slot_id === slotId) ?? null;
  const marked = slots.filter((s) => markOf(s.id)).length;
  const present = slots.filter((s) => markOf(s.id)?.attended).length;

  function run(fn: () => Promise<unknown>) {
    start(async () => {
      try {
        await fn();
        router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Couldn't save that");
      }
    });
  }

  if (!slots.length) {
    return (
      <p className="px-4 py-4 text-[12.5px] text-muted">
        No classes scheduled for {dayLabel}. Nothing to mark.
      </p>
    );
  }

  const payload = slots.map((s) => ({ slot_id: s.id, subject_id: s.subject_id }));

  return (
    <div className={cn(pending && "opacity-70")}>
      <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-2.5">
        <button
          onClick={() => run(() => setWholeDay(date, payload, true))}
          className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-line bg-surface-2 px-2.5 text-[12px] font-medium transition-colors hover:border-[var(--good)] hover:text-[var(--good)] focus-ring"
        >
          <Check size={13} /> I was in today
        </button>
        <button
          onClick={() => run(() => setWholeDay(date, payload, false))}
          className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-line bg-surface-2 px-2.5 text-[12px] transition-colors hover:border-[var(--bad)] hover:text-[var(--bad)] focus-ring"
        >
          <X size={13} /> Missed the day
        </button>
        <span className="ml-auto text-[11px] text-subtle">
          {pending ? (
            <Loader2 size={12} className="animate-spin" />
          ) : marked ? (
            `${present}/${marked} marked present`
          ) : (
            "not marked yet"
          )}
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
                  onClick={() =>
                    run(() =>
                      setClassMark({
                        on_date: date,
                        slot_id: s.id,
                        subject_id: s.subject_id,
                        attended: state === "in" ? null : true,
                      }),
                    )
                  }
                />
                <Toggle
                  active={state === "out"}
                  tone="bad"
                  label="Missed"
                  icon={<X size={12} />}
                  onClick={() =>
                    run(() =>
                      setClassMark({
                        on_date: date,
                        slot_id: s.id,
                        subject_id: s.subject_id,
                        attended: state === "out" ? null : false,
                      }),
                    )
                  }
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
