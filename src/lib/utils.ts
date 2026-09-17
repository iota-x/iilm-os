import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const MIDSEM_START = new Date("2026-10-05T00:00:00+05:30");

/** Whole days from today (IST) until the given date. */
export function daysUntil(target: Date | string): number {
  const t = typeof target === "string" ? new Date(target) : target;
  const now = new Date();
  const ms = t.getTime() - now.getTime();
  return Math.ceil(ms / 86_400_000);
}

export function istToday(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function istWeekday(): "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun" {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
  }).format(new Date()) as "Mon";
}

export function istNowMinutes(): number {
  const s = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
  const [h, m] = s.split(":").map(Number);
  return h * 60 + m;
}

export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export function fmtTime(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const ampm = h >= 12 ? "pm" : "am";
  const hr = h % 12 || 12;
  return m === 0 ? `${hr}${ampm}` : `${hr}:${String(m).padStart(2, "0")}${ampm}`;
}

export function fmtDuration(min: number): string {
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export function fmtDate(iso: string): string {
  return new Date(iso + "T00:00:00+05:30").toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "Asia/Kolkata",
  });
}

export function relativeDay(iso: string): string {
  const today = istToday();
  if (iso === today) return "Today";
  const d = new Date(iso + "T00:00:00+05:30");
  const t = new Date(today + "T00:00:00+05:30");
  const diff = Math.round((d.getTime() - t.getTime()) / 86_400_000);
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  if (diff < 0) return `${-diff}d ago`;
  return `in ${diff}d`;
}

export const ACCENT_CLASS: Record<string, string> = {
  violet: "accent-violet",
  blue: "accent-blue",
  emerald: "accent-emerald",
  orange: "accent-orange",
  rose: "accent-rose",
  amber: "accent-amber",
  slate: "accent-slate",
};

export const STATUS_LABEL: Record<string, string> = {
  not_started: "Not started",
  learning: "Learning",
  revising: "Revising",
  mastered: "Solid",
};

export const STATUS_ORDER = ["not_started", "learning", "revising", "mastered"] as const;

export function nextStatus(s: string): string {
  const i = STATUS_ORDER.indexOf(s as "not_started");
  return STATUS_ORDER[(i + 1) % STATUS_ORDER.length];
}

/** 0–1 progress from a set of topic statuses. */
export function progressOf(statuses: string[]): number {
  if (!statuses.length) return 0;
  const score: Record<string, number> = {
    not_started: 0,
    learning: 0.45,
    revising: 0.8,
    mastered: 1,
  };
  return statuses.reduce((a, s) => a + (score[s] ?? 0), 0) / statuses.length;
}

export function pct(n: number): string {
  return `${Math.round(n * 100)}%`;
}
