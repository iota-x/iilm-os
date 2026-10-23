import type { Holiday } from "@/lib/universities";

export type { Holiday };

/** The holiday covering a date (YYYY-MM-DD), if any, from the student's calendar. */
export function holidayOn(date: string, holidays: Holiday[]): Holiday | null {
  return holidays.find((h) => h.from <= date && date <= h.to) ?? null;
}

/** Holidays that haven't ended yet, soonest first. */
export function upcomingHolidays(today: string, holidays: Holiday[]): Holiday[] {
  return holidays.filter((h) => h.to >= today).sort((a, b) => a.from.localeCompare(b.from));
}

/** "Sat 7 – Wed 11 Nov" / "Tue 24 Nov" */
export function holidayRange(h: Holiday): string {
  const f = (d: string, o: Intl.DateTimeFormatOptions) =>
    new Date(d + "T00:00:00+05:30").toLocaleDateString("en-GB", { timeZone: "Asia/Kolkata", ...o });
  if (h.from === h.to) return f(h.from, { weekday: "short", day: "numeric", month: "short" });
  return `${f(h.from, { weekday: "short", day: "numeric" })} – ${f(h.to, { weekday: "short", day: "numeric", month: "short" })}`;
}
