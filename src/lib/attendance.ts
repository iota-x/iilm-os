import type { Attendance, ClassMark, Slot, Subject } from "@/lib/db-types";

export interface SubjectAttendance {
  subject: Subject;
  /** classes you ticked, plus the baseline you entered in Settings */
  held: number;
  attended: number;
  missed: number;
  /** null when nothing has been counted yet — 0% would be a lie */
  pct: number | null;
  /** how many more you can miss and still be at or above the threshold */
  canMiss: number;
  /** consecutive classes you'd have to attend to climb back to the threshold */
  needToAttend: number;
}

export const THRESHOLD = 0.75;

/**
 * A class counts only once you've marked it. No row means no assumption, so
 * a forgotten day or a cancelled class doesn't quietly drag the number down.
 */
export function attendanceBySubject(
  subjects: Subject[],
  marks: ClassMark[],
  baseline: Attendance[],
): SubjectAttendance[] {
  return subjects.map((subject) => {
    const mine = marks.filter((m) => m.subject_id === subject.id);
    const base = baseline.find((b) => b.subject_id === subject.id);

    const baseHeld = base?.held ?? 0;
    const baseAttended = Math.min(base?.attended ?? 0, baseHeld);

    const attended = baseAttended + mine.filter((m) => m.attended).length;
    const held = baseHeld + mine.length;
    const missed = held - attended;
    const pct = held ? Math.round((attended / held) * 100) : null;

    // attended / (held + x) >= 0.75  ->  x <= attended/0.75 - held
    const canMiss = held ? Math.max(0, Math.floor(attended / THRESHOLD - held)) : 0;
    // (attended + y) / (held + y) >= 0.75  ->  y >= (0.75*held - attended) / 0.25
    const needToAttend = held
      ? Math.max(0, Math.ceil((THRESHOLD * held - attended) / (1 - THRESHOLD)))
      : 0;

    return { subject, held, attended, missed, pct, canMiss, needToAttend };
  });
}

/** The classes on a given weekday for your lab group, in time order. */
export function slotsForDay(slots: Slot[], day: string, labGroup: number): Slot[] {
  return slots
    .filter((s) => s.day === day)
    .filter((s) => s.lab_group === null || s.lab_group === labGroup)
    .sort((a, b) => a.start_time.localeCompare(b.start_time));
}
