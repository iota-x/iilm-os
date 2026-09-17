import type { Topic } from "@/lib/db-types";

/**
 * Spaced repetition over the two columns topics already carry: `confidence`
 * (1–5, how well you reckon you know it) and `last_studied_at`.
 *
 * The gap grows with confidence, so the things you're shaky on come back
 * tomorrow and the things you're solid on come back in three weeks. There is
 * no review history table — the interval is recomputed from your current
 * confidence every time, which means correcting your confidence immediately
 * corrects the schedule.
 */
export const INTERVAL_DAYS: Record<number, number> = {
  0: 1,
  1: 1,
  2: 2,
  3: 4,
  4: 9,
  5: 21,
};

export type ReviewBucket = "overdue" | "today" | "soon" | "scheduled" | "unstarted";

export interface ReviewState {
  /** null when the topic has never been studied — it needs a first pass, not a review */
  dueAt: Date | null;
  /** negative = overdue by that many days */
  daysUntilDue: number | null;
  bucket: ReviewBucket;
  intervalDays: number;
}

const DAY = 86_400_000;

/** Midnight IST for the day `d` falls in, so "due today" means the calendar day. */
function istDayStart(d: Date): number {
  const ist = new Date(d.getTime() + 5.5 * 3600_000);
  return Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate()) - 5.5 * 3600_000;
}

export function reviewStateOf(topic: Topic, now: Date = new Date()): ReviewState {
  const interval = INTERVAL_DAYS[topic.confidence] ?? 1;

  // Never touched, or explicitly not started: this is a first pass, not a review.
  if (!topic.last_studied_at || topic.status === "not_started") {
    return { dueAt: null, daysUntilDue: null, bucket: "unstarted", intervalDays: interval };
  }

  const last = new Date(topic.last_studied_at);
  if (Number.isNaN(last.getTime())) {
    return { dueAt: null, daysUntilDue: null, bucket: "unstarted", intervalDays: interval };
  }

  const dueAt = new Date(last.getTime() + interval * DAY);
  const days = Math.round((istDayStart(dueAt) - istDayStart(now)) / DAY);

  const bucket: ReviewBucket =
    days < 0 ? "overdue" : days === 0 ? "today" : days <= 2 ? "soon" : "scheduled";

  return { dueAt, daysUntilDue: days, bucket, intervalDays: interval };
}

/** Everything that wants attention now, worst first. */
export function dueForReview(topics: Topic[], now: Date = new Date()) {
  return topics
    .map((t) => ({ topic: t, review: reviewStateOf(t, now) }))
    .filter((x) => x.review.bucket === "overdue" || x.review.bucket === "today")
    .sort((a, b) => {
      // most overdue first, then by exam weight, then mid-sem scope
      const d = (a.review.daysUntilDue ?? 0) - (b.review.daysUntilDue ?? 0);
      if (d !== 0) return d;
      if (a.topic.weight !== b.topic.weight) return b.topic.weight - a.topic.weight;
      return Number(b.topic.in_midsem) - Number(a.topic.in_midsem);
    });
}

export function reviewLabel(r: ReviewState): string {
  if (r.bucket === "unstarted") return "Not started";
  const d = r.daysUntilDue!;
  if (d < -1) return `${-d} days overdue`;
  if (d === -1) return "1 day overdue";
  if (d === 0) return "Due today";
  if (d === 1) return "Due tomorrow";
  return `Due in ${d} days`;
}
