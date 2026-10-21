"use client";

import { useState } from "react";
import { useLocalStorage } from "@/lib/client-hooks";
import { cn } from "@/lib/utils";

type Grade = { grade: string; min: number; max: number; points: number; label: string };
type Course = { slug: string; name: string; credits: number; lab?: boolean };

const KEY = "iilm-sgpa-grades";

/**
 * Pick the grade you expect in each course and watch the SGPA move. The
 * second half answers the question that matters before an end-sem: with the
 * internals I have, what do I need on the paper for each grade?
 */
export function SgpaCalculator({ grades, courses }: { grades: readonly Grade[]; courses: readonly Course[] }) {
  const [saved, setSaved] = useLocalStorage<string[] | null>(KEY, null);
  const picked = saved && saved.length === courses.length ? saved : courses.map(() => "B");
  const [internals, setInternals] = useState(30);

  function pick(i: number, g: string) {
    setSaved(picked.map((x, j) => (j === i ? g : x)));
  }

  const pts = (g: string) => grades.find((x) => x.grade === g)?.points ?? 0;
  const credits = courses.reduce((a, c) => a + c.credits, 0);
  const sum = courses.reduce((a, c, i) => a + c.credits * pts(picked[i]), 0);
  const sgpa = credits ? sum / credits : 0;
  const failing = courses.filter((_, i) => picked[i] === "F").length;

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="rounded-[var(--radius-card)] bg-surface shadow-card dark:border dark:border-line dark:shadow-none">
        <div className="flex items-baseline justify-between border-b border-line px-4 py-3">
          <p className="text-[length:var(--text-small)] font-medium">SGPA calculator</p>
          <p className="tabular-nums">
            <span className="text-[length:var(--text-lead)] font-semibold">{sgpa.toFixed(2)}</span>
            <span className="ml-1 text-[length:var(--text-micro)] text-subtle">over {credits} credits</span>
          </p>
        </div>
        <ul className="divide-y divide-[var(--border)]">
          {courses.map((c, i) => (
            <li key={c.name} className="flex items-center gap-3 px-4 py-2">
              <span className="min-w-0 flex-1 truncate text-[length:var(--text-small)]">
                {c.name}
                {c.lab ? <span className="ml-1.5 text-[length:var(--text-micro)] text-subtle">lab</span> : null}
              </span>
              <span className="w-14 text-right text-[length:var(--text-micro)] tabular-nums text-subtle">
                {c.credits} cr
              </span>
              <select
                value={picked[i]}
                onChange={(e) => pick(i, e.target.value)}
                aria-label={`Expected grade in ${c.name}`}
                className={cn(
                  "h-8 w-20 rounded-md border border-line bg-surface-2 px-2 text-[length:var(--text-small)] focus-ring",
                  picked[i] === "F" && "text-[var(--bad)]",
                )}
              >
                {grades.map((g) => (
                  <option key={g.grade} value={g.grade}>
                    {g.grade} · {g.points}
                  </option>
                ))}
              </select>
            </li>
          ))}
        </ul>
        <p className="border-t border-line px-4 py-2.5 text-[length:var(--text-micro)] leading-relaxed text-subtle">
          {failing
            ? `${failing} F — that course needs a re-exam, and the best a re-exam can give is B+.`
            : "Your picks are saved in this browser. Entrepreneur Mindset carries no credits yet, so it isn't counted."}
        </p>
      </div>

      <div className="rounded-[var(--radius-card)] bg-surface shadow-card dark:border dark:border-line dark:shadow-none">
        <div className="border-b border-line px-4 py-3">
          <p className="text-[length:var(--text-small)] font-medium">What you need on the end-sem paper</p>
          <p className="mt-0.5 text-[length:var(--text-micro)] text-subtle">
            Theory courses: total = internals (out of 50) + paper ÷ 2. The paper alone also needs 40/100.
          </p>
        </div>
        <label className="flex items-center gap-3 px-4 pt-3 text-[length:var(--text-small)]">
          <span className="text-muted">Internals</span>
          <input
            type="range"
            min={0}
            max={50}
            value={internals}
            onChange={(e) => setInternals(Number(e.target.value))}
            className="flex-1 accent-[var(--accent)]"
          />
          <span className="w-12 text-right font-medium tabular-nums">{internals}/50</span>
        </label>
        <ul className="divide-y divide-[var(--border)] px-4 pb-2 pt-2">
          {grades
            .filter((g) => g.grade !== "F")
            .map((g) => {
              const need = Math.max(40, 2 * (g.min - internals));
              const reach = need <= 100;
              return (
                <li key={g.grade} className="flex items-baseline justify-between py-1.5 text-[length:var(--text-small)]">
                  <span>
                    <span className="inline-block w-8 font-semibold">{g.grade}</span>
                    <span className="text-subtle">
                      {g.min}+ total · {g.label}
                    </span>
                  </span>
                  <span className={cn("tabular-nums", reach ? "font-medium" : "text-subtle")}>
                    {reach ? `${need}/100` : "out of reach"}
                  </span>
                </li>
              );
            })}
        </ul>
        {internals < 20 ? (
          <p className="border-t border-line px-4 py-2.5 text-[length:var(--text-micro)] text-[var(--bad)]">
            Under 20/50 in internals fails the course whatever the paper says (the 40% rule).
          </p>
        ) : null}
      </div>
    </div>
  );
}
