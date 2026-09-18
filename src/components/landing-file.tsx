"use client";

import { useState } from "react";
import { ArrowRight, Camera, CalendarClock, FolderCheck } from "lucide-react";
import { matchSession } from "@/lib/capture";
import type { Slot, Subject } from "@/lib/db-types";
import { ACCENT_CLASS, cn, fmtTime } from "@/lib/utils";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"] as const;

/**
 * The photo-filing demo, live: pick a day and drag the time a photo was
 * taken; it files itself to the class that was on, using the real timetable
 * and the same matcher the upload uses.
 */
export function LandingFile({ slots, subjects }: { slots: Slot[]; subjects: Subject[] }) {
  const [day, setDay] = useState<(typeof DAYS)[number]>("Wed");
  const [minute, setMinute] = useState(11 * 60 + 40);

  // build a Date on that weekday at that time — the matcher only reads weekday and time
  const base = new Date("2026-09-14T00:00:00+05:30"); // a Monday
  const at = new Date(base.getTime() + DAYS.indexOf(day) * 86_400_000 + minute * 60_000);
  const m = matchSession(at, slots, 2);
  const subject = m.slot?.subject_id ? subjects.find((s) => s.id === m.slot!.subject_id) : null;
  const hh = String(Math.floor(minute / 60)).padStart(2, "0");
  const mm = String(minute % 60).padStart(2, "0");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-lg border border-line bg-surface-2 p-0.5">
          {DAYS.map((d) => (
            <button
              key={d}
              onClick={() => setDay(d)}
              className={cn(
                "rounded-[7px] px-2.5 py-1 text-[length:var(--text-micro)] font-medium transition-colors focus-ring",
                day === d ? "bg-surface text-fg shadow-card" : "text-subtle hover:text-fg",
              )}
            >
              {d}
            </button>
          ))}
        </div>
        <label className="flex flex-1 items-center gap-3 text-[length:var(--text-micro)] text-subtle">
          <span className="shrink-0">Taken at</span>
          <input
            type="range"
            min={8 * 60}
            max={18 * 60}
            step={5}
            value={minute}
            onChange={(e) => setMinute(Number(e.target.value))}
            className="w-full accent-[var(--accent)]"
            aria-label="Time the photo was taken"
          />
          <span className="w-12 shrink-0 text-right tabular-nums text-fg">{fmtTime(`${hh}:${mm}`)}</span>
        </label>
      </div>

      <ol className="grid gap-3 sm:grid-cols-3">
        <Step icon={Camera} k="Taken" v={`${day} ${fmtTime(`${hh}:${mm}`)}`} sub="read from the photo itself" />
        <Step
          icon={CalendarClock}
          k="Timetable says"
          v={m.slot ? `${subject?.short_name ?? ""} ${m.slot.kind}, ${fmtTime(m.slot.start_time)}–${fmtTime(m.slot.end_time)}` : "no class then"}
          sub={m.slot ? "your group, that weekday" : `${m.candidates.length} classes that day to pick from`}
        />
        <Step
          icon={FolderCheck}
          k="Filed to"
          v={subject ? `${subject.short_name} · ${day}` : "asks which class"}
          sub={subject ? "one row per lecture, on the subject page" : "one tap on the inbox card"}
          className={subject ? ACCENT_CLASS[subject.color] : ""}
          lit={Boolean(subject)}
          last
        />
      </ol>
    </div>
  );
}

function Step({
  icon: Icon,
  k,
  v,
  sub,
  className,
  lit,
  last,
}: {
  icon: typeof Camera;
  k: string;
  v: string;
  sub: string;
  className?: string;
  lit?: boolean;
  last?: boolean;
}) {
  return (
    <li className={cn("relative rounded-[var(--radius-card)] border border-line bg-surface p-4 transition-colors", lit && "bg-sc-soft", className)}>
      <Icon size={18} className={lit ? "text-sc" : "text-subtle"} />
      <p className="mt-3 text-[length:var(--text-micro)] text-subtle">{k}</p>
      <p className="mt-0.5 text-[length:var(--text-small)] font-medium">{v}</p>
      <p className="mt-1 text-[length:var(--text-micro)] text-muted">{sub}</p>
      {!last ? <ArrowRight size={14} className="absolute -right-3 top-1/2 hidden -translate-y-1/2 text-subtle sm:block" /> : null}
    </li>
  );
}
