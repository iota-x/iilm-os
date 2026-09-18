"use client";

import { useMemo, useState } from "react";
import { daysBetween, distribute, minutesFor, summarise } from "@/lib/goals";
import { cn } from "@/lib/utils";
import { TryIt } from "@/components/try-it";

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
  const [touched, setTouched] = useState(false);
  const days = allDays.slice(0, Math.max(1, dayCount));
  const plan = useMemo(() => distribute(topics, days), [topics, days]);
  const summary = summarise(topics.length, days.length, topics.reduce((n, t) => n + minutesFor(t), 0));
  const end = days[days.length - 1];

  return (
    <div className={cn("rounded-[var(--radius-panel)] border border-line bg-surface p-5 shadow-pop sm:p-6", color)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <TryIt>Try it — drag the deadline</TryIt>
          <p className="mt-3 font-serif text-[length:var(--text-lead)] font-semibold">Calculus mid-sem scope</p>
          <p className="mt-1 text-[length:var(--text-small)] text-muted">
            Units I–III · by{" "}
            <span className="text-fg">
              {new Date(end + "T00:00:00+05:30").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "Asia/Kolkata" })}
            </span>
          </p>
        </div>
        <div key={days.length} className="pop text-right">
          <p className="text-[length:var(--text-figure)] font-semibold leading-none tabular-nums tracking-[-0.03em]">
            {days.length}
            <span className="ml-1 text-[length:var(--text-small)] font-normal text-subtle">day{days.length === 1 ? "" : "s"}</span>
          </p>
          <p className={cn("mt-1 text-[length:var(--text-small)] font-medium", summary.heavy ? "text-[var(--warn)]" : "text-sc")}>
            about {summary.text.split("about ")[1]}
            {summary.heavy ? " — a cliff" : ""}
          </p>
        </div>
      </div>

      <label className="mt-5 block">
        <span className="flex items-center justify-between text-[length:var(--text-small)] text-muted">
          <span>Tomorrow</span>
          <span>The day before mid-sems</span>
        </span>
        <input
          type="range"
          min={1}
          max={allDays.length}
          value={days.length}
          onPointerDown={() => setTouched(true)}
          onChange={(e) => { setTouched(true); setDayCount(Number(e.target.value)); }}
          className={cn("slider mt-2 w-full", !touched && "nudge")}
          aria-label="Days until the deadline"
        />
      </label>

      <ol
        className="mt-4 grid gap-1.5"
        style={{ gridTemplateColumns: `repeat(${allDays.length}, minmax(0, 1fr))` }}
      >
        {allDays.map((date, i) => {
          const d = plan[i];
          const after = i >= days.length;
          return (
            <li
              key={date}
              className={cn(
                "flex aspect-square flex-col items-center justify-between rounded-md border px-0.5 py-1 transition-colors duration-200",
                after
                  ? "border-dashed border-line bg-transparent"
                  : i === 0
                    ? "border-line bg-sc-soft"
                    : "border-line bg-surface-2",
              )}
              title={after ? `${date}: free` : `${date}: ${d.topics.length} topic${d.topics.length === 1 ? "" : "s"}`}
            >
              <span className={cn("text-[10px] tabular-nums", after ? "text-subtle/60" : "text-subtle")}>
                {date.slice(8).replace(/^0/, "")}
              </span>
              <span className="flex flex-wrap justify-center gap-0.5">
                {(d?.topics ?? []).slice(0, 6).map((_, j) => (
                  <span key={j} className="h-1.5 w-1.5 rounded-full bg-sc" />
                ))}
                {d && d.topics.length > 6 ? <span className="text-[9px] text-sc">+{d.topics.length - 6}</span> : null}
              </span>
            </li>
          );
        })}
      </ol>
      <p className="mt-3 text-[length:var(--text-micro)] text-subtle">
        Each dot is one topic; today is highlighted; dashed days are yours. Real syllabus,
        today&rsquo;s date, the same maths the app uses — this is the plan you&rsquo;d get.
      </p>
    </div>
  );
}
