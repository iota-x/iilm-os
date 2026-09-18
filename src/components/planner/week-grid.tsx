import Link from "next/link";
import type { Slot, Subject } from "@/lib/db-types";
import { ACCENT_CLASS, cn, fmtDuration, fmtTime, toMinutes } from "@/lib/utils";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"] as const;

/** How tall a minute is. A one-hour class comes out at 63px, which fits three
 *  lines of micro text — the smallest block still has to be readable. */
const PX_PER_MIN = 1.05;

/** Below this a block can't hold three lines, so the room is dropped. */
const ROOM_FLOOR_MIN = 55;

/** Anything shorter isn't a study window, it's the walk to the bus. */
const FREE_FLOOR_MIN = 60;

/**
 * The week as a proportional timetable rather than a stack of equal cards.
 * The point of this page is finding the hours that aren't spoken for, and a
 * two-hour lab has to look like twice a one-hour lecture before the gaps
 * between them mean anything.
 */
export function WeekGrid({
  slots,
  subjects,
  dense = false,
}: {
  slots: Slot[];
  subjects: Subject[];
  /** narrower columns, no room numbers — for when the grid is a picture, not a tool */
  dense?: boolean;
}) {
  const subjectById = new Map(subjects.map((s) => [s.id, s]));

  const starts = slots.map((s) => toMinutes(s.start_time));
  const ends = slots.map((s) => toMinutes(s.end_time));
  // Snap the frame to the half hour either side so the axis reads evenly.
  const from = Math.floor(Math.min(...starts) / 30) * 30;
  const to = Math.ceil(Math.max(...ends) / 30) * 30;
  const height = (to - from) * PX_PER_MIN;

  const hourMarks: number[] = [];
  for (let m = Math.ceil(from / 60) * 60; m <= to; m += 60) hourMarks.push(m);

  const y = (minutes: number) => (minutes - from) * PX_PER_MIN;

  return (
    <div className="overflow-x-auto">
      <div className={dense ? "min-w-[600px]" : "min-w-[820px]"}>
        {/* day names */}
        <div className="grid grid-cols-[46px_repeat(5,1fr)] border-b border-line">
          <div />
          {DAYS.map((day) => {
            const last = slots
              .filter((s) => s.day === day)
              .reduce<string | null>(
                (a, s) => (!a || s.end_time > a ? s.end_time : a),
                null,
              );
            return (
              <div key={day} className="px-2 pb-2 pt-1">
                <p className="text-[length:var(--text-small)] font-medium">{day}</p>
                {last ? (
                  <p className="mt-0.5 text-[length:var(--text-micro)] text-subtle">
                    free from {fmtTime(last)}
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>

        {/* the grid itself */}
        <div className="grid grid-cols-[46px_repeat(5,1fr)]">
          {/* hour axis */}
          <div className="relative" style={{ height }}>
            {hourMarks.map((m) => (
              <span
                key={m}
                className="absolute right-2 -translate-y-1/2 text-[length:var(--text-micro)] tabular-nums text-subtle"
                style={{ top: y(m) }}
              >
                {fmtTime(`${String(Math.floor(m / 60)).padStart(2, "0")}:00`)}
              </span>
            ))}
          </div>

          {DAYS.map((day) => {
            const dayslots = slots
              .filter((s) => s.day === day)
              .sort((a, b) => toMinutes(a.start_time) - toMinutes(b.start_time));
            const lastEnd = dayslots.length
              ? Math.max(...dayslots.map((s) => toMinutes(s.end_time)))
              : from;
            const free = to - lastEnd;

            return (
              <div
                key={day}
                className="relative border-l border-line px-1"
                style={{ height }}
              >
                {/* hour rules, behind everything */}
                {hourMarks.map((m) => (
                  <div
                    key={m}
                    aria-hidden
                    className="absolute inset-x-0 border-t border-[var(--border)]/60"
                    style={{ top: y(m) }}
                  />
                ))}

                {/* The hours after the last class, drawn as a shape rather than
                    left as absence — this is the whole reason to look at the
                    week, and it makes the long days obvious at a glance. */}
                {free >= FREE_FLOOR_MIN ? (
                  <div
                    className="absolute inset-x-1 grid place-items-center rounded-lg bg-[var(--surface-2)]"
                    style={{ top: y(to - free), height: free * PX_PER_MIN }}
                  >
                    <span className="text-[length:var(--text-micro)] tabular-nums text-subtle">
                      {fmtDuration(free)} free
                    </span>
                  </div>
                ) : null}

                {dayslots.map((s) => {
                  const subject = s.subject_id ? subjectById.get(s.subject_id) : null;
                  const start = toMinutes(s.start_time);
                  const mins = toMinutes(s.end_time) - start;
                  const tight = dense || mins < ROOM_FLOOR_MIN;
                  return (
                    <Link
                      key={s.id}
                      href={subject ? `/subjects/${subject.slug}` : "#"}
                      title={`${subject?.name ?? "Class"} · ${fmtTime(s.start_time)}–${fmtTime(s.end_time)} · ${s.room}`}
                      className={cn(
                        "absolute inset-x-1 overflow-hidden rounded-lg bg-sc-soft px-2 py-1 transition-colors focus-ring hover:bg-sc-soft hover:ring-1 hover:ring-sc",
                        subject ? ACCENT_CLASS[subject.color] : "",
                      )}
                      style={{ top: y(start), height: mins * PX_PER_MIN - 2 }}
                    >
                      <p className="text-[length:var(--text-micro)] font-semibold leading-tight text-sc">
                        {subject?.short_name ?? "—"}
                        {s.kind === "lab" ? <span className="font-normal"> lab</span> : null}
                      </p>
                      <p className="text-[length:var(--text-micro)] leading-tight tabular-nums text-muted">
                        {fmtTime(s.start_time)}–{fmtTime(s.end_time)}
                      </p>
                      {tight ? null : (
                        <p className="truncate text-[length:var(--text-micro)] leading-tight text-subtle">
                          {s.room}
                        </p>
                      )}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
