/**
 * A goal is "finish these topics by this date". The plan is one task per
 * topic, laid across the days between now and the deadline so each day
 * carries about the same load. Weight (1–5, how heavily a topic is examined)
 * drives the time estimate, and the syllabus order is kept — you learn
 * Unit 1 before Unit 2 even when the deadline is tight.
 */

import type { Topic } from "@/lib/db-types";

export type Scope = "midsem" | "unit" | "subject";

/** How well you already know the subject: 1 new to it, 2 seen it in class, 3 fairly solid. */
export type Level = 1 | 2 | 3;
export const LEVEL_LABEL: Record<Level, string> = {
  1: "New to it",
  2: "Seen it in class",
  3: "Fairly solid",
};
const LEVEL_FACTOR: Record<Level, number> = { 1: 1.35, 2: 1, 3: 0.7 };

/** Rough time a topic takes on a first pass. Weight 3 ≈ an hour at level 2. */
export function minutesFor(topic: Pick<Topic, "weight">, level: Level = 2): number {
  return Math.round((25 + topic.weight * 12) * LEVEL_FACTOR[level]);
}

/**
 * Topics still ahead — anything not mastered — in syllabus order. sort_order
 * restarts inside each unit, so the unit's number has to come first or Unit
 * 2's opener lands on day two.
 */
export function remaining<T extends Pick<Topic, "status" | "sort_order" | "unit_id">>(
  topics: T[],
  unitRank: Map<string, number> = new Map(),
): T[] {
  return topics
    .filter((t) => t.status !== "mastered")
    .sort(
      (a, b) =>
        (unitRank.get(a.unit_id) ?? 0) - (unitRank.get(b.unit_id) ?? 0) || a.sort_order - b.sort_order,
    );
}

/** ISO dates from `from` (inclusive) to `to` (inclusive). Pure calendar
 *  arithmetic in UTC, so no timezone can shift a date by a day. */
export function daysBetween(from: string, to: string): string[] {
  const out: string[] = [];
  const [fy, fm, fd] = from.split("-").map(Number);
  const [ty, tm, td] = to.split("-").map(Number);
  const d = new Date(Date.UTC(fy, fm - 1, fd));
  const end = new Date(Date.UTC(ty, tm - 1, td));
  while (d <= end) {
    out.push(d.toISOString().slice(0, 10));
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return out;
}

export interface Placement<T> {
  date: string;
  topics: T[];
  minutes: number;
}

/**
 * Spread topics across days, in order, as evenly as counting allows:
 * topic k goes on day floor(k · days / n). With more days than topics
 * that leaves gaps between them; with more topics than days no day gets
 * more than one topic extra. Nothing is scheduled after the deadline, and
 * the deadline day is never the heaviest.
 */
export function distribute<T extends Pick<Topic, "weight">>(
  topics: T[],
  days: string[],
): Placement<T>[] {
  if (!days.length) return [];
  const plan: Placement<T>[] = days.map((date) => ({ date, topics: [], minutes: 0 }));
  topics.forEach((t, k) => {
    const i = Math.min(days.length - 1, Math.floor((k * days.length) / topics.length));
    plan[i].topics.push(t);
    plan[i].minutes += minutesFor(t);
  });
  return plan;
}

/** How the plan looks in one line: "17 topics · 16 days · about 1h 10m a day". */
export function summarise(topicCount: number, dayCount: number, totalMinutes: number) {
  const perDay = dayCount ? Math.round(totalMinutes / dayCount) : totalMinutes;
  const h = Math.floor(perDay / 60);
  const m = perDay % 60;
  const time = h ? `${h}h${m ? ` ${m}m` : ""}` : `${m}m`;
  return {
    perDayMinutes: perDay,
    text: `${topicCount} topic${topicCount === 1 ? "" : "s"} · ${dayCount} day${dayCount === 1 ? "" : "s"} · about ${time} a day`,
    heavy: perDay > 180,
  };
}

export interface Fit<T> {
  plan: Placement<T>[];
  /** topics that don't fit before the deadline at this budget, in order */
  overflow: T[];
  totalMinutes: number;
  /** minutes a day it would take to fit everything by the deadline */
  neededPerDay: number;
  /** days it would take at this budget */
  daysNeeded: number;
  /** the date it would be done at this budget, ISO */
  finishBy: string | null;
}

/**
 * The Planly-style plan: given how much time a day you have and how well
 * you know the subject, lay the topics across the days without exceeding
 * the budget. If they don't all fit before the deadline, say so and say
 * what would fix it — more time a day, or a later date. Order is always
 * syllabus order; every day gets at least one topic while any are left,
 * even if that topic alone is over budget.
 */
export function fit<T extends Pick<Topic, "weight">>(
  topics: T[],
  days: string[],
  budget: number,
  level: Level = 2,
): Fit<T> {
  const est = (t: T) => minutesFor(t, level);
  const totalMinutes = topics.reduce((n, t) => n + est(t), 0);
  const daysNeeded = budget > 0 ? Math.max(topics.length ? 1 : 0, Math.ceil(totalMinutes / budget)) : days.length;
  const neededPerDay = days.length ? Math.ceil(totalMinutes / days.length) : totalMinutes;

  const plan: Placement<T>[] = days.map((date) => ({ date, topics: [], minutes: 0 }));
  let k = 0;
  if (days.length) {
    // spread evenly when there's room; otherwise fill each day to budget
    const target = Math.min(budget, Math.ceil(totalMinutes / days.length));
    for (let d = 0; d < days.length && k < topics.length; d++) {
      const day = plan[d];
      // leave later days their share: don't run ahead of an even spread
      while (k < topics.length && (day.topics.length === 0 || day.minutes + est(topics[k]) <= target)) {
        day.topics.push(topics[k]);
        day.minutes += est(topics[k]);
        k++;
      }
    }
  }
  const overflow = topics.slice(k);
  const finishBy = days.length && daysNeeded ? shiftDay(days[0], daysNeeded - 1) : null;
  return { plan, overflow, totalMinutes, neededPerDay, daysNeeded, finishBy };
}

function shiftDay(day: string, n: number): string {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

/** "Fits — 1h 10m a day" / "Doesn't fit — needs 2h 05m a day, or finish by 11 Oct" */
export function describeFit(f: Fit<unknown>, budget: number): { ok: boolean; text: string } {
  const t = (m: number) => {
    const h = Math.floor(m / 60);
    const r = m % 60;
    return h ? `${h}h${r ? ` ${r}m` : ""}` : `${r}m`;
  };
  if (!f.overflow.length) {
    const used = f.plan.length ? Math.round(f.totalMinutes / f.plan.length) : 0;
    return { ok: true, text: `Fits — about ${t(used)} a day of your ${t(budget)}.` };
  }
  const when = f.finishBy
    ? new Date(f.finishBy + "T00:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" })
    : null;
  return {
    ok: false,
    text: `${f.overflow.length} topic${f.overflow.length === 1 ? "" : "s"} won't fit — needs ${t(f.neededPerDay)} a day${when ? `, or ${t(budget)} a day until ${when}` : ""}.`,
  };
}
