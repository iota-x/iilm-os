import { AttendanceToday } from "@/components/attendance-today";
import { Bar, Card, CardHead } from "@/components/ui";
import {
  getAttendance,
  getClassMarks,
  getProfile,
  getSlots,
  getSubjects,
} from "@/lib/queries";
import { attendanceBySubject, slotsForDay, THRESHOLD } from "@/lib/attendance";
import { ACCENT_CLASS, cn, istToday, istWeekday } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AttendancePage() {
  const [profile, subjects, slots, marks, baseline] = await Promise.all([
    getProfile(),
    getSubjects(),
    getSlots(),
    getClassMarks(),
    getAttendance(),
  ]);

  const group = profile?.lab_group ?? 2;
  const today = istToday();
  const day = istWeekday();
  const todaySlots = slotsForDay(slots, day, group);
  const todayMarks = marks.filter((m) => m.on_date === today);

  const rows = attendanceBySubject(subjects, marks, baseline).filter(
    (r) => r.held > 0 || todaySlots.some((s) => s.subject_id === r.subject.id),
  );

  const totalHeld = rows.reduce((n, r) => n + r.held, 0);
  const totalAttended = rows.reduce((n, r) => n + r.attended, 0);
  const overall = totalHeld ? Math.round((totalAttended / totalHeld) * 100) : null;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[20px] font-semibold tracking-tight">Attendance</h1>
        <p className="mt-0.5 text-[13px] text-muted">
          {overall === null
            ? "Tick today's classes below and the percentages build up from there."
            : `${overall}% overall · ${totalAttended} of ${totalHeld} classes`}
        </p>
      </div>

      <Card className="overflow-hidden">
        <CardHead title={`${day} — today`} sub="Mark it once and forget about it" />
        <AttendanceToday
          date={today}
          dayLabel={day}
          slots={todaySlots}
          subjects={subjects}
          marks={todayMarks}
        />
      </Card>

      <Card className="overflow-hidden">
        <CardHead
          title="By subject"
          sub={`${Math.round(THRESHOLD * 100)}% is the bar for sitting the end-sem`}
        />
        {rows.length ? (
          <ul className="divide-y divide-line">
            {rows.map((r) => (
              <li key={r.subject.id} className={cn("px-4 py-3", ACCENT_CLASS[r.subject.color])}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="min-w-0 truncate text-[13px] font-medium">
                    {r.subject.name}
                  </span>
                  <span
                    className={cn(
                      "shrink-0 text-[13px] font-semibold tabular-nums",
                      r.pct === null
                        ? "text-subtle"
                        : r.pct >= 75
                          ? "text-[var(--good)]"
                          : "text-[var(--bad)]",
                    )}
                  >
                    {r.pct === null ? "—" : `${r.pct}%`}
                  </span>
                </div>

                <div className="mt-2 flex items-center gap-3">
                  <Bar value={r.pct === null ? 0 : r.pct / 100} className="flex-1" />
                  <span className="shrink-0 text-[11px] tabular-nums text-subtle">
                    {r.attended}/{r.held}
                  </span>
                </div>

                {r.pct !== null ? (
                  <p className="mt-1.5 text-[11.5px] text-muted">
                    {r.pct >= 75
                      ? r.canMiss > 0
                        ? `You can miss ${r.canMiss} more and stay above ${Math.round(THRESHOLD * 100)}%.`
                        : `Miss one more and you drop below ${Math.round(THRESHOLD * 100)}%.`
                      : `${r.needToAttend} in a row to climb back above ${Math.round(THRESHOLD * 100)}%.`}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-4 py-6 text-center text-[12.5px] text-muted">
            Nothing counted yet. Mark today above, or set a starting count in Settings if you&rsquo;ve
            already been attending.
          </p>
        )}
      </Card>

      <p className="max-w-2xl text-[12px] leading-relaxed text-muted">
        Percentages are your Settings starting count plus every class you tick here. Unmarked
        classes count for nothing at all, so forgetting a day leaves the number alone rather than
        making it look worse than it is.
      </p>
    </div>
  );
}
