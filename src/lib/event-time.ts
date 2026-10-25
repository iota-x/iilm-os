/** Event times, always shown in India time — the server renders in UTC. */
const TZ = "Asia/Kolkata";

export function eventWhen(starts: string, ends: string | null): string {
  const s = new Date(starts);
  const day = s.toLocaleDateString("en-IN", { timeZone: TZ, weekday: "short", day: "numeric", month: "short" });
  const t = (d: Date) => d.toLocaleTimeString("en-IN", { timeZone: TZ, hour: "numeric", minute: "2-digit" });
  if (!ends) return `${day}, ${t(s)}`;
  const e = new Date(ends);
  const sameDay = e.toLocaleDateString("en-CA", { timeZone: TZ }) === s.toLocaleDateString("en-CA", { timeZone: TZ });
  return sameDay
    ? `${day}, ${t(s)} – ${t(e)}`
    : `${day}, ${t(s)} – ${e.toLocaleDateString("en-IN", { timeZone: TZ, day: "numeric", month: "short" })}, ${t(e)}`;
}

/** "2026-10-25" for an instant, in India time. */
export function istDate(iso: string | Date): string {
  return new Date(iso).toLocaleDateString("en-CA", { timeZone: TZ });
}
