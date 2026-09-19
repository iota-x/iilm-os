import { describe, expect, it } from "vitest";
import { attendanceBySubject } from "@/lib/attendance";
import type { Attendance, ClassMark, Subject } from "@/lib/db-types";

const subject = { id: "s1", name: "Calculus" } as Subject;
const mark = (attended: boolean, i: number) =>
  ({ id: String(i), subject_id: "s1", attended, date: "2026-09-01" }) as unknown as ClassMark;

describe("attendanceBySubject", () => {
  it("reports null, not 0%, when nothing has been marked", () => {
    const [a] = attendanceBySubject([subject], [], []);
    expect(a.pct).toBeNull();
    expect(a.canMiss).toBe(0);
  });
  it("adds the settings baseline to marked classes", () => {
    const base = [{ subject_id: "s1", held: 10, attended: 8 } as Attendance];
    const [a] = attendanceBySubject([subject], [mark(true, 1), mark(false, 2)], base);
    expect(a.held).toBe(12);
    expect(a.attended).toBe(9);
    expect(a.pct).toBe(75);
    expect(a.canMiss).toBe(0);
    expect(a.needToAttend).toBe(0);
  });
  it("says how many you can still skip, and how many to climb back", () => {
    const [fine] = attendanceBySubject([subject], [], [{ subject_id: "s1", held: 10, attended: 10 } as Attendance]);
    expect(fine.canMiss).toBe(3); // 10/13 = 76.9%
    const [low] = attendanceBySubject([subject], [], [{ subject_id: "s1", held: 10, attended: 6 } as Attendance]);
    expect(low.needToAttend).toBe(6); // (6+6)/(10+6) = 75%
  });
  it("never counts more attended than held in the baseline", () => {
    const [a] = attendanceBySubject([subject], [], [{ subject_id: "s1", held: 5, attended: 9 } as Attendance]);
    expect(a.attended).toBe(5);
  });
});
