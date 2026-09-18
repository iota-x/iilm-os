"use client";

import { useMemo, useState } from "react";
import { daysBetween, distribute, minutesFor, summarise } from "@/lib/goals";
import { cn } from "@/lib/utils";

/**
 * The Goals demo, live: drag the deadline and the plan re-spreads. Runs the
 * same maths the app runs, on the real Calculus mid-sem scope.
 */
export function LandingGoal({
  topics,
  today,
  latest,
  color,
}: {
  topics: { weight: number; sort_order: number }[];
  today: string;
  /** the last sensible deadline — the day before mid-sems */
  latest: string;
  color: string;
}) {
  const allDays = useMemo(() => daysBetween(today, latest), [today, latest]);
  const [dayCount, setDayCount] = useState(allDays.length);
  const days = allDays.slice(0, Math.max(1, dayCount));
  const plan = useMemo(() => distribute(topics, days), [topics, days]);
  const summary = summarise(topics.length, days.length, topics.reduce((n, t) => n + minutesFor(t), 0));
  const end = days[days.length - 1];

  return (
    <div className={cn("rounded-[var(--radius-panel)] border border-line bg-surface p-5 shadow-pop sm:p-6", color)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-serif text-[length:var(--text-lead)] font-semibold">Calculus mid-sem scope</p>
          <p className="mt-1 text-[length:var(--text-small)] text-muted">
            Units I–III · by{" "}
            <span className="text-fg">
              {new Date(end + "T00:00:00+05:30").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "Asia/Kolkata" })}
            </span>
          </p>
        </div>
        <p className={cn("text-[length:var(--text-small)] font-medium", summary.heavy ? "text-[var(--warn)]" : "text-sc")}>
          {summary.text}
        </p>
      </div>

      <label className="mt-5 block">
        <span className="flex items-center justify-between text-[length:var(--text-micro)] text-subtle">
          <span>Drag the deadline</span>
          <span className="tabular-nums">{days.length} day{days.length === 1 ? "" : "s"}</span>
        </span>
        <input
          type="range"
          min={1}
          max={allDays.length}
          value={days.length}
          onChange={(e) => setDayCount(Number(e.target.value))}
          className="mt-1.5 w-full accent-[var(--accent)]"
          aria-label="Days until the deadline"
        />
      </label>

      <ol
        className="mt-4 grid gap-1.5"
        style={{ gridTemplateColumns: `repeat(${Math.min(days.length, 17)}, minmax(0, 1fr))` }}
      >
        {plan.map((d, i) => (
          <li
            key={d.date}
            className={cn(
              "flex aspect-square flex-col items-center justify-between rounded-md border border-line px-0.5 py-1 transition-colors",
              i === 0 ? "bg-sc-soft" : "bg-surface-2",
            )}
            title={`${d.date}: ${d.topics.length} topic${d.topics.length === 1 ? "" : "s"}`}
          >
            <span className="text-[10px] tabular-nums text-subtle">{d.date.slice(8).replace(/^0/, "")}</span>
            <span className="flex flex-wrap justify-center gap-0.5">
              {d.topics.slice(0, 6).map((_, j) => (
                <span key={j} className="h-1.5 w-1.5 rounded-full bg-sc" />
              ))}
              {d.topics.length > 6 ? <span className="text-[9px] text-sc">+{d.topics.length - 6}</span> : null}
            </span>
          </li>
        ))}
      </ol>
      <p className="mt-3 text-[length:var(--text-micro)] text-subtle">
        Each dot is one topic; today is highlighted. Real syllabus, today&rsquo;s date, the same
        maths the app uses — this is the plan you&rsquo;d get.
      </p>
    </div>
  );
}
