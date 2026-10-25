import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/[,;]/g, (m) => `\\${m}`);

/**
 * One event as an .ics file. It carries two reminders: 6 pm (India) the
 * evening before, and an hour before it starts — so the phone's own
 * calendar does the reminding, no app open needed.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await createClient();
  const { data: e } = await db.from("events").select("*").eq("id", id).maybeSingle(); // RLS: your university
  if (!e) return new Response("Not found", { status: 404 });

  const start = new Date(e.starts_at);
  const end = e.ends_at ? new Date(e.ends_at) : new Date(start.getTime() + 2 * 3600_000);
  // 18:00 IST the day before = 12:30 UTC the day before
  const istDay = new Date(start.getTime() + 5.5 * 3600_000);
  const eveningBefore = new Date(Date.UTC(istDay.getUTCFullYear(), istDay.getUTCMonth(), istDay.getUTCDate() - 1, 12, 30));
  const alarms = [
    eveningBefore < start ? ["BEGIN:VALARM", "ACTION:DISPLAY", `DESCRIPTION:Tomorrow: ${esc(e.title)}`, `TRIGGER;VALUE=DATE-TIME:${stamp(eveningBefore)}`, "END:VALARM"] : [],
    ["BEGIN:VALARM", "ACTION:DISPLAY", `DESCRIPTION:${esc(e.title)} in an hour`, "TRIGGER:-PT1H", "END:VALARM"],
  ].flat();

  const body = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Semwise//Events//EN",
    "BEGIN:VEVENT",
    `UID:${e.id}@semwise`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${esc(e.title)}`,
    e.venue ? `LOCATION:${esc(e.venue)}` : "",
    `DESCRIPTION:${esc([e.organiser ? `By ${e.organiser}` : "", e.body ?? "", e.url ?? ""].filter(Boolean).join("\n\n"))}`,
    e.url ? `URL:${e.url}` : "",
    ...alarms,
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean);

  return new Response(body.join("\r\n"), {
    headers: {
      "content-type": "text/calendar; charset=utf-8",
      "content-disposition": `attachment; filename="${e.title.replace(/[^\w -]/g, "").slice(0, 40) || "event"}.ics"`,
    },
  });
}
