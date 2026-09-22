import { describe, expect, it } from "vitest";
import { daysBetween, describeFit, distribute, fit, minutesFor, remaining, summarise } from "@/lib/goals";
import type { TopicStatus } from "@/lib/db-types";

const topic = (over: Partial<{ status: TopicStatus; sort_order: number; unit_id: string; weight: number }> = {}) => ({
  status: "not_started" as TopicStatus,
  sort_order: 1,
  unit_id: "u1",
  weight: 3,
  ...over,
});

describe("daysBetween", () => {
  it("is inclusive at both ends and immune to timezones", () => {
    expect(daysBetween("2026-09-19", "2026-09-21")).toEqual(["2026-09-19", "2026-09-20", "2026-09-21"]);
    expect(daysBetween("2026-09-19", "2026-09-19")).toEqual(["2026-09-19"]);
    expect(daysBetween("2026-09-20", "2026-09-19")).toEqual([]);
  });
  it("crosses a month boundary", () => {
    expect(daysBetween("2026-09-30", "2026-10-02")).toEqual(["2026-09-30", "2026-10-01", "2026-10-02"]);
  });
});

describe("remaining", () => {
  it("drops mastered topics and orders by unit before sort_order", () => {
    const rank = new Map([["u1", 1], ["u2", 2]]);
    const out = remaining(
      [
        topic({ unit_id: "u2", sort_order: 1 }),
        topic({ unit_id: "u1", sort_order: 2 }),
        topic({ unit_id: "u1", sort_order: 1, status: "mastered" }),
        topic({ unit_id: "u1", sort_order: 3 }),
      ],
      rank,
    );
    expect(out.map((t) => `${t.unit_id}:${t.sort_order}`)).toEqual(["u1:2", "u1:3", "u2:1"]);
  });
});

describe("distribute", () => {
  it("puts one topic a day when counts match, none after the deadline", () => {
    const days = daysBetween("2026-09-19", "2026-09-21");
    const plan = distribute([topic(), topic(), topic()], days);
    expect(plan.map((p) => p.topics.length)).toEqual([1, 1, 1]);
  });
  it("never makes the deadline day the heaviest", () => {
    const days = daysBetween("2026-09-19", "2026-09-22"); // 4 days
    const plan = distribute(Array.from({ length: 10 }, () => topic()), days);
    const counts = plan.map((p) => p.topics.length);
    expect(counts.reduce((a, b) => a + b)).toBe(10);
    expect(Math.max(...counts) - Math.min(...counts)).toBeLessThanOrEqual(1);
    expect(counts[counts.length - 1]).toBeLessThanOrEqual(Math.max(...counts.slice(0, -1)));
  });
  it("leaves gaps rather than stacking when there are more days than topics", () => {
    const days = daysBetween("2026-09-19", "2026-09-24"); // 6 days
    const plan = distribute([topic(), topic()], days);
    expect(plan.map((p) => p.topics.length)).toEqual([1, 0, 0, 1, 0, 0]);
  });
  it("sums minutes from weight", () => {
    const [day] = distribute([topic({ weight: 5 }), topic({ weight: 1 })], ["2026-09-19"]);
    expect(day.minutes).toBe(minutesFor({ weight: 5 }) + minutesFor({ weight: 1 }));
  });
  it("handles no days", () => {
    expect(distribute([topic()], [])).toEqual([]);
  });
});

describe("summarise", () => {
  it("reads like a sentence and flags heavy days", () => {
    expect(summarise(17, 16, 16 * 70).text).toBe("17 topics · 16 days · about 1h 10m a day");
    expect(summarise(1, 1, 30).text).toBe("1 topic · 1 day · about 30m a day");
    expect(summarise(5, 1, 200).heavy).toBe(true);
  });
});

describe("fit", () => {
  const days = daysBetween("2026-09-22", "2026-09-25"); // 4 days
  it("spreads evenly when the budget allows and reports it fits", () => {
    const f = fit([topic(), topic(), topic(), topic()], days, 120);
    expect(f.overflow).toEqual([]);
    expect(f.plan.map((p) => p.topics.length)).toEqual([1, 1, 1, 1]);
    expect(describeFit(f, 120).ok).toBe(true);
  });
  it("fills to budget and overflows what doesn't fit", () => {
    // weight 3 → 61 min each at level 2; 30 min/day budget → one a day, never more
    const f = fit(Array.from({ length: 8 }, () => topic()), days, 30);
    expect(f.plan.map((p) => p.topics.length)).toEqual([1, 1, 1, 1]);
    expect(f.overflow.length).toBe(4);
    expect(f.neededPerDay).toBe(Math.ceil((8 * 61) / 4));
    const d = describeFit(f, 30);
    expect(d.ok).toBe(false);
    expect(d.text).toMatch(/4 topics won't fit/);
  });
  it("scales estimates by level", () => {
    expect(minutesFor({ weight: 3 }, 1)).toBeGreaterThan(minutesFor({ weight: 3 }, 2));
    expect(minutesFor({ weight: 3 }, 3)).toBeLessThan(minutesFor({ weight: 3 }, 2));
  });
  it("says when it would finish at this budget", () => {
    const f = fit(Array.from({ length: 8 }, () => topic()), days, 61);
    expect(f.daysNeeded).toBe(8);
    expect(f.finishBy).toBe("2026-09-29");
  });
  it("handles an empty scope", () => {
    const f = fit([], days, 60);
    expect(f.overflow).toEqual([]);
    expect(f.totalMinutes).toBe(0);
  });
});
