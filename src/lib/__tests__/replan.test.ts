import { describe, expect, it } from "vitest";
import { replan, WEEKDAY_BUDGET, type ReplanInput, type ReplanTask } from "../replan";

// 2026-11-12 is a Thursday
const A = "subj-a";
const B = "subj-b";
let n = 0;
const task = (over: Partial<ReplanTask> & { subject_id: string }): ReplanTask => ({
  id: `t${++n}`,
  title: `task ${n}`,
  kind: "learn",
  minutes: 60,
  due_date: "2026-11-01",
  sort_order: n,
  movable: true,
  ...over,
});
const base = (tasks: ReplanTask[], over: Partial<ReplanInput> = {}): ReplanInput => ({
  today: "2026-11-12",
  tasks,
  papers: { [A]: "2026-12-04", [B]: "2026-12-09" },
  holidays: [],
  phaseByDate: {},
  ...over,
});
const dayOf = (r: ReturnType<typeof replan>, id: string) => r.moves.find((m) => m.id === id)?.to;

describe("replan", () => {
  it("respects the weekday budget", () => {
    const tasks = Array.from({ length: 30 }, (_, i) => task({ subject_id: A, due_date: "2026-11-01", sort_order: i }));
    const r = replan(base(tasks));
    expect(r.mode).toBe("fits");
    for (const d of r.days) if (!d.isExam) expect(d.minutes).toBeLessThanOrEqual(WEEKDAY_BUDGET[(new Date(d.date + "T12:00:00Z").getUTCDay() + 6) % 7] + 15);
    expect(r.moves.every((m) => m.to >= "2026-11-12")).toBe(true);
  });

  it("skips holidays unless asked to use them", () => {
    const tasks = Array.from({ length: 6 }, (_, i) => task({ subject_id: A, sort_order: i }));
    const holidays = [{ from: "2026-11-12", to: "2026-11-14" }];
    const r = replan(base(tasks, { holidays }));
    expect(r.moves.every((m) => m.to > "2026-11-14")).toBe(true);
    const r2 = replan(base(tasks, { holidays, useHolidays: true }));
    expect(r2.moves.some((m) => m.to <= "2026-11-14")).toBe(true);
  });

  it("finishes each subject before its own paper and leaves paper days empty", () => {
    const tasks = [
      ...Array.from({ length: 20 }, (_, i) => task({ subject_id: A, sort_order: i })),
      ...Array.from({ length: 20 }, (_, i) => task({ subject_id: B, sort_order: 100 + i })),
    ];
    const r = replan(base(tasks));
    for (const m of r.moves) {
      const t = tasks.find((x) => x.id === m.id)!;
      expect(m.to < (t.subject_id === A ? "2026-12-04" : "2026-12-09")).toBe(true);
      expect(["2026-12-04", "2026-12-09"]).not.toContain(m.to);
    }
  });

  it("keeps the order of blocks within a subject", () => {
    const tasks = Array.from({ length: 25 }, (_, i) => task({ subject_id: A, title: `route ${i}`, due_date: "2026-11-01", sort_order: i }));
    const shuffled = [...tasks].reverse();
    const r = replan(base(shuffled));
    const keyed = tasks.map((t) => {
      const m = r.moves.find((x) => x.id === t.id)!;
      return m.to + String(m.sort_order).padStart(4, "0");
    });
    expect([...keyed].sort()).toEqual(keyed);
  });

  it("never touches done or partly-done blocks, and counts them in the day's load", () => {
    const done = task({ subject_id: A, movable: false, done: true, due_date: "2026-11-12", minutes: 100 });
    const part = task({ subject_id: A, movable: false, due_date: "2026-11-13", minutes: 90 });
    const todo = task({ subject_id: A });
    const r = replan(base([done, part, todo]));
    expect(r.moves.find((m) => m.id === done.id || m.id === part.id)).toBeUndefined();
    expect(r.days.find((d) => d.date === "2026-11-12")!.keptMinutes).toBe(100);
  });

  it("leaves revision and mock blocks in the last days, and fills the first pass before them", () => {
    const mock = task({ subject_id: A, kind: "mock", due_date: "2026-12-02", minutes: 180 });
    const rev = task({ subject_id: A, kind: "revise", due_date: "2026-12-03", minutes: 120 });
    const learn = Array.from({ length: 10 }, (_, i) => task({ subject_id: A, sort_order: i }));
    const r = replan(base([mock, rev, ...learn], { phaseByDate: { "2026-12-02": "es-revise", "2026-12-03": "es-revise" } }));
    expect(dayOf(r, mock.id)).toBeUndefined();
    expect(dayOf(r, rev.id)).toBeUndefined();
    expect(r.endsOn! < "2026-12-02").toBe(true);
    expect(r.days.find((d) => d.date === "2026-12-02")!.minutes).toBe(180);
  });

  it("reports overflow, stretches, then trims drills and lists them", () => {
    // 4 days of capacity before the paper, far too much work
    const input = base(
      [
        ...Array.from({ length: 12 }, (_, i) => task({ subject_id: A, minutes: 90, sort_order: i })),
        ...Array.from({ length: 8 }, (_, i) => task({ subject_id: A, kind: "drill", minutes: 60, sort_order: 50 + i })),
      ],
      { today: "2026-11-30" },
    );
    const r = replan(input);
    expect(r.overMinutes).toBeGreaterThan(0);
    expect(r.mode).toBe("trimmed");
    expect(r.leftOut.length).toBeGreaterThan(0);
    expect(r.leftOut[0].kind).toBe("drill");
    expect(r.moves.length + r.leftOut.length).toBe(20);
  });

  it("uses a stretch before trimming when it just about fits", () => {
    // Fri 27 Nov to Thu 3 Dec: 120+330+270+150+120+120+120 = 1230 min
    const tasks = Array.from({ length: 17 }, (_, i) => task({ subject_id: A, minutes: 80, sort_order: i })); // 1360
    const r = replan(base(tasks, { today: "2026-11-27" }));
    expect(r.mode).toBe("stretched");
    expect(r.leftOut).toHaveLength(0);
    expect(r.days.some((d) => d.over)).toBe(true);
  });

  it("does nothing when there is nothing to move", () => {
    const r = replan(base([task({ subject_id: A, movable: false, done: true, due_date: "2026-11-01" })]));
    expect(r.moves).toHaveLength(0);
    expect(r.leftOut).toHaveLength(0);
  });

  it("keepAll never trims, it lets days run long", () => {
    const tasks = Array.from({ length: 14 }, (_, i) => task({ subject_id: A, minutes: 90, sort_order: i }));
    const r = replan(base(tasks, { today: "2026-11-30", keepAll: true }));
    expect(r.leftOut).toHaveLength(0);
    expect(r.moves).toHaveLength(14);
    expect(r.factor).toBeGreaterThan(1.25);
  });
});
