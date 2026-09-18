/**
 * A goal is "finish these topics by this date". The plan is one task per
 * topic, laid across the days between now and the deadline so each day
 * carries about the same load. Weight (1–5, how heavily a topic is examined)
 * drives the time estimate, and the syllabus order is kept — you learn
 * Unit 1 before Unit 2 even when the deadline is tight.
 */

import type { Topic } from "@/lib/db-types";

export type Scope = "midsem" | "unit" | "subject";

/** Rough time a topic takes on a first pass. Weight 3 ≈ an hour. */
export function minutesFor(topic: Pick<Topic, "weight">): number {
  return 25 + topic.weight * 12;
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
