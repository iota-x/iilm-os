/**
 * A streak is consecutive days (IST) with something done — a block ticked,
 * a topic touched, a class marked, a note edited. Today counts if there's
 * activity; otherwise the streak is still alive until midnight, so a run
 * ending yesterday is reported with `today: false`.
 */

export function istDay(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

function shift(day: string, n: number): string {
  const [y, m, d] = day.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return t.toISOString().slice(0, 10);
}

export interface Streak {
  /** length of the current run, 0 if it broke */
  days: number;
  /** activity recorded today */
  today: boolean;
  /** the run is alive but today hasn't been done yet */
  atRisk: boolean;
  /** longest run ever */
  best: number;
}

/** `days` are plain YYYY-MM-DD strings (already in IST); `today` likewise. */
export function studyStreak(days: Iterable<string>, today: string): Streak {
  const set = new Set(days);
  const todayDone = set.has(today);
  let cursor = todayDone ? today : shift(today, -1);
  let run = 0;
  while (set.has(cursor)) {
    run++;
    cursor = shift(cursor, -1);
  }
  // longest ever
  const sorted = [...set].sort();
  let best = 0;
  let cur = 0;
  let prev: string | null = null;
  for (const d of sorted) {
    cur = prev && shift(prev, 1) === d ? cur + 1 : 1;
    best = Math.max(best, cur);
    prev = d;
  }
  return { days: run, today: todayDone, atRisk: run > 0 && !todayDone, best };
}
