"use client";

import { useState, useTransition } from "react";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { setAttendance, setDisplayName, setLabGroup } from "@/lib/actions";
import type { Attendance, Profile, Subject } from "@/lib/db-types";
import { Button, Card, CardHead, inputCls } from "@/components/ui";
import { ACCENT_CLASS, cn } from "@/lib/utils";

const THRESHOLD = 0.75;

type Row = { attended: string; held: string };

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
    <>
      <Card>
        <CardHead title="You" />
        <div className="space-y-5 p-5">
          <div>
            <label
              className="text-[length:var(--text-small)] font-medium"
              htmlFor="name"
            >
              Display name
            </label>
            <p className="mt-0.5 text-[length:var(--text-micro)] text-subtle">
              What the dashboard greets you with.
            </p>
            <div className="mt-2 flex gap-2">
              <input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputCls}
              />
              <Button
                disabled={pending || name === (profile.display_name ?? "")}
                onClick={() =>
                  start(async () => {
                    await setDisplayName(name);
                    toast.success("Saved");
                  })
                }
              >
                Save
              </Button>
            </div>
          </div>

          <div>
            <p className="text-[length:var(--text-small)] font-medium">Lab group</p>
            <p className="mt-0.5 text-[length:var(--text-micro)] text-subtle">
              Decides which lab slots appear in your timetable and which classes you&rsquo;re asked
              to mark.
            </p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
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
                  aria-pressed={group === g}
                  className={cn(
                    "rounded-[var(--radius-control)] border px-3 py-2.5 text-left transition-colors focus-ring",
                    group === g
                      ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                      : "border-line bg-surface hover:bg-surface-2",
                  )}
                >
                  <p className="flex items-center gap-1.5 text-[length:var(--text-small)] font-semibold">
                    Group {g}
                    {group === g ? <Check size={13} className="text-[var(--accent)]" /> : null}
                  </p>
                  <p className="mt-0.5 text-[length:var(--text-micro)] leading-snug text-muted">
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

      <AttendanceBaseline subjects={subjects} attendance={attendance} />
    </>
  );
}

/**
 * The classes that happened before daily marking started. Everything you tick
 * on the Attendance page is added on top of these, so they only need touching
 * when you get the real register figures from a teacher.
 */
function AttendanceBaseline({
  subjects,
  attendance,
}: {
  subjects: Subject[];
  attendance: Attendance[];
}) {
  const initial: Record<string, Row> = Object.fromEntries(
    subjects.map((s) => {
      const row = attendance.find((a) => a.subject_id === s.id);
      return [
        s.id,
        { attended: row?.attended?.toString() ?? "", held: row?.held?.toString() ?? "" },
      ];
    }),
  );

  const [rows, setRows] = useState(initial);
  const [pending, start] = useTransition();

  const changed = subjects.filter(
    (s) =>
      rows[s.id].attended !== initial[s.id].attended || rows[s.id].held !== initial[s.id].held,
  );

  function set(id: string, field: keyof Row, value: string) {
    setRows((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  }

  function saveAll() {
    start(async () => {
      for (const s of changed) {
        await setAttendance(s.id, Number(rows[s.id].held) || 0, Number(rows[s.id].attended) || 0);
      }
      toast.success(
        `Saved ${changed.length} ${changed.length === 1 ? "subject" : "subjects"}`,
      );
    });
  }

  return (
    <Card>
      <CardHead
        title="Attendance you started with"
        sub="Classes held before you began marking days off. Everything you tick on the Attendance page counts on top of these."
      />

      <div className="overflow-x-auto">
        <table className="w-full text-[length:var(--text-small)]">
          <thead>
            <tr className="border-b border-line text-[length:var(--text-micro)] text-subtle">
              <th className="px-5 py-2 text-left font-medium">Subject</th>
              <th className="px-2 py-2 text-right font-medium">Went</th>
              <th className="px-2 py-2 text-right font-medium">Held</th>
              <th className="px-5 py-2 text-right font-medium">So far</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {subjects.map((s) => {
              const r = rows[s.id];
              const held = Number(r.held) || 0;
              const attended = Number(r.attended) || 0;
              const p = held ? attended / held : null;
              return (
                <tr key={s.id} className={ACCENT_CLASS[s.color]}>
                  <td className="px-5 py-2">
                    <span className="flex items-center gap-2">
                      <span
                        className="h-1.5 w-1.5 shrink-0 rounded-full bg-sc"
                        aria-hidden
                      />
                      {s.short_name}
                    </span>
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="number"
                      min={0}
                      inputMode="numeric"
                      value={r.attended}
                      onChange={(e) => set(s.id, "attended", e.target.value)}
                      placeholder="0"
                      aria-label={`Classes attended in ${s.name}`}
                      className={cn(inputCls, "ml-auto h-8 w-[72px] px-2 text-right tabular-nums")}
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="number"
                      min={0}
                      inputMode="numeric"
                      value={r.held}
                      onChange={(e) => set(s.id, "held", e.target.value)}
                      placeholder="0"
                      aria-label={`Classes held in ${s.name}`}
                      className={cn(inputCls, "ml-auto h-8 w-[72px] px-2 text-right tabular-nums")}
                    />
                  </td>
                  <td
                    className={cn(
                      "px-5 py-2 text-right font-medium tabular-nums",
                      p === null
                        ? "text-subtle"
                        : p >= THRESHOLD
                          ? "text-[var(--good)]"
                          : "text-[var(--bad)]",
                    )}
                  >
                    {p === null ? "—" : `${Math.round(p * 100)}%`}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-3">
        <p className="text-[length:var(--text-micro)] text-subtle">
          Anything under 75% bars you from that subject&rsquo;s end-sem.
        </p>
        <Button
          variant="primary"
          disabled={pending || changed.length === 0}
          onClick={saveAll}
        >
          {pending ? <Loader2 size={14} className="animate-spin" /> : null}
          {changed.length ? `Save ${changed.length}` : "Saved"}
        </Button>
      </div>
    </Card>
  );
}
