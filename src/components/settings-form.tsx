"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { setAttendance, setDisplayName, setLabGroup } from "@/lib/actions";
import type { Attendance, Profile, Subject } from "@/lib/db-types";
import { Button, Card, CardHead, inputCls } from "@/components/ui";
import { ACCENT_CLASS, cn } from "@/lib/utils";

export function SettingsForm({
  profile,
  subjects,
  attendance,
}: {
  profile: Profile;
  subjects: Subject[];
  attendance: Attendance[];
}) {
  const [name, setName] = useState(profile.display_name ?? "");
  const [group, setGroup] = useState<1 | 2>(profile.lab_group);
  const [pending, start] = useTransition();

  return (
    <div className="space-y-5 max-w-2xl">
      <Card>
        <CardHead title="You" />
        <div className="p-4 space-y-4">
          <div>
            <label className="text-[12px] font-medium text-muted" htmlFor="name">
              Display name
            </label>
            <div className="flex gap-2 mt-1">
              <input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputCls}
              />
              <Button
                variant="outline"
                onClick={() =>
                  start(async () => {
                    await setDisplayName(name);
                    toast.success("Saved");
                  })
                }
                disabled={pending}
              >
                Save
              </Button>
            </div>
          </div>

          <div>
            <p className="text-[12px] font-medium text-muted">Lab group</p>
            <p className="text-[11.5px] text-subtle mt-0.5 mb-2">
              Changes which lab slots show in your timetable.
            </p>
            <div className="flex gap-2">
              {([1, 2] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => {
                    setGroup(g);
                    start(async () => {
                      await setLabGroup(g);
                      toast.success(`Switched to group ${g}`);
                    });
                  }}
                  className={cn(
                    "flex-1 rounded-lg border px-3 py-2.5 text-left transition-colors focus-ring",
                    group === g
                      ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                      : "border-line bg-surface hover:bg-surface-2",
                  )}
                >
                  <p className="text-[13px] font-semibold">Group {g}</p>
                  <p className="text-[11.5px] text-muted mt-0.5 leading-snug">
                    {g === 1
                      ? "Mon Linux · Tue Calculus lab · Wed DE+CO lab · Thu & Fri C lab"
                      : "Mon Calculus lab · Tue & Wed C lab · Thu DE+CO lab · Fri Linux"}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <CardHead
          title="Attendance"
          sub="Below 75% in any subject and you cannot sit its end-sem. Update these weekly."
        />
        <ul className="divide-y divide-[var(--border)]">
          {subjects.map((s) => (
            <AttendanceRow
              key={s.id}
              subject={s}
              row={attendance.find((a) => a.subject_id === s.id) ?? null}
            />
          ))}
        </ul>
      </Card>
    </div>
  );
}

function AttendanceRow({ subject, row }: { subject: Subject; row: Attendance | null }) {
  const [held, setHeld] = useState(row?.held?.toString() ?? "");
  const [attended, setAttended] = useState(row?.attended?.toString() ?? "");
  const [pending, start] = useTransition();

  const h = Number(held) || 0;
  const a = Number(attended) || 0;
  const p = h ? a / h : null;

  return (
    <li className={cn("px-4 py-3 flex flex-wrap items-center gap-3", ACCENT_CLASS[subject.color])}>
      <p className="text-[13px] font-medium flex-1 min-w-[140px]">{subject.short_name}</p>

      <div className="flex items-center gap-1.5">
        <input
          type="number"
          min={0}
          value={attended}
          onChange={(e) => setAttended(e.target.value)}
          placeholder="went"
          className={`${inputCls} h-8 w-[70px] text-center text-[12px]`}
        />
        <span className="text-subtle text-[12px]">/</span>
        <input
          type="number"
          min={0}
          value={held}
          onChange={(e) => setHeld(e.target.value)}
          placeholder="held"
          className={`${inputCls} h-8 w-[70px] text-center text-[12px]`}
        />
      </div>

      <span
        className={cn(
          "text-[13px] font-semibold tabular-nums w-[52px] text-right",
          p === null
            ? "text-subtle"
            : p >= 0.75
              ? "text-[var(--good)]"
              : "text-[var(--bad)]",
        )}
      >
        {p === null ? "—" : `${Math.round(p * 100)}%`}
      </span>

      <Button
        variant="subtle"
        size="sm"
        disabled={pending}
        onClick={() =>
          start(async () => {
            await setAttendance(subject.id, h, a);
            toast.success("Saved");
          })
        }
      >
        Save
      </Button>
    </li>
  );
}
