import { describe, expect, it } from "vitest";
import { studyStreak } from "@/lib/streak";

describe("studyStreak", () => {
  it("counts back from today when today is done", () => {
    const s = studyStreak(["2026-09-20", "2026-09-21", "2026-09-22"], "2026-09-22");
    expect(s).toMatchObject({ days: 3, today: true, atRisk: false, best: 3 });
  });
  it("keeps a run alive through today until midnight", () => {
    const s = studyStreak(["2026-09-20", "2026-09-21"], "2026-09-22");
    expect(s).toMatchObject({ days: 2, today: false, atRisk: true });
  });
  it("breaks after a missed day", () => {
    const s = studyStreak(["2026-09-18", "2026-09-19"], "2026-09-22");
    expect(s.days).toBe(0);
    expect(s.best).toBe(2);
  });
  it("crosses month boundaries and ignores duplicates", () => {
    const s = studyStreak(["2026-09-30", "2026-09-30", "2026-10-01", "2026-10-02"], "2026-10-02");
    expect(s.days).toBe(3);
  });
  it("is empty with no activity", () => {
    expect(studyStreak([], "2026-09-22")).toEqual({ days: 0, today: false, atRisk: false, best: 0 });
  });
});
