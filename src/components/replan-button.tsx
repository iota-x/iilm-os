"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { RotateCcw, Undo2, X } from "lucide-react";
import { Button, Badge } from "@/components/ui";
import { applyReplan, previewReplan, undoReplan, type ReplanOpts, type ReplanPreview } from "@/lib/replan-actions";
import { cn, fmtDuration } from "@/lib/utils";

const day = (iso: string) =>
  new Date(iso + "T12:00:00+05:30").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "Asia/Kolkata" });
const hours = (m: number) => `${(m / 60).toFixed(1)} h`;

/**
 * Sprint's Replan: lay the unfinished end-sem blocks out again from today to
 * the papers. Opens a preview first; nothing is written until Apply, and the
 * last replan can be undone.
 */
export function ReplanButton({ lastAt }: { lastAt: string | null }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [opts, setOpts] = useState<ReplanOpts>({});
  const [preview, setPreview] = useState<ReplanPreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const load = (o: ReplanOpts) =>
    start(async () => {
      setError(null);
      const r = await previewReplan(o);
      if ("error" in r) {
        setPreview(null);
        setError(r.error);
      } else setPreview(r.preview);
    });

  const show = () => {
    setOpen(true);
    setPreview(null);
    load(opts);
  };
  const toggle = (patch: ReplanOpts) => {
    const o = { ...opts, ...patch };
    setOpts(o);
    load(o);
  };
  const apply = () =>
    start(async () => {
      const r = await applyReplan(opts);
      if ("error" in r) {
        setError(r.error);
        return;
      }
      toast.success(
        `Replanned: ${r.moved} blocks moved${r.left ? `, ${r.left} left out` : ""}${r.skipped ? `, ${r.skipped} old DSA/GSoC blocks skipped` : ""}. You can undo it.`,
      );
      setOpen(false);
      router.refresh();
    });
  const undo = () =>
    start(async () => {
      if (!confirm("Put the plan back the way it was before the last replan?")) return;
      const r = await undoReplan();
      if ("error" in r) {
        toast.error(r.error);
        return;
      }
      toast.success(`Undone: ${r.restored} blocks put back.`);
      router.refresh();
    });

  const p = preview;
  const res = p?.result;
  const busy = p ? p.days.filter((d) => d.minutes > 0 || d.isHoliday || d.isExam) : [];
  const perSubject = new Map<string, number>();
  for (const m of p?.moves ?? []) perSubject.set(m.subject, (perSubject.get(m.subject) ?? 0) + 1);

  return (
    <>
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        {lastAt ? (
          <Button size="sm" variant="ghost" onClick={undo} disabled={pending} title={`Replanned ${day(lastAt.slice(0, 10))}`}>
            <Undo2 size={13} /> Undo replan
          </Button>
        ) : null}
        <Button variant="primary" onClick={show} disabled={pending}>
          <RotateCcw size={14} /> Replan
        </Button>
      </div>

      {open ? (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-black/40 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Replan preview">
          <div className="flex max-h-[88vh] w-full max-w-2xl flex-col rounded-[var(--radius-card)] bg-surface shadow-card dark:border dark:border-line">
            <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
              <div>
                <h2 className="text-[length:var(--text-title)]">Replan preview</h2>
                <p className="text-[length:var(--text-small)] text-muted">Nothing changes until you press Apply.</p>
              </div>
              <Button size="icon" variant="ghost" onClick={() => setOpen(false)} aria-label="Close">
                <X size={16} />
              </Button>
            </div>

            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-4 text-[length:var(--text-small)]">
              {error ? <p className="rounded-lg bg-[var(--bad-soft)] px-3 py-2 text-[var(--bad)]">{error}</p> : null}
              {!p && !error ? <p className="text-muted">Working out a new plan…</p> : null}

              {p && res ? (
                <>
                  <div className="space-y-1">
                    <p>
                      <b>{res.movableCount} unfinished blocks</b> ({hours(res.movableMinutes)}) from today, {day(p.today)}, to the papers:{" "}
                      {p.papers.map((x) => `${x.subject} ${day(x.date)}`).join(" · ")}.
                    </p>
                    {res.mode === "fits" ? (
                      <p className="text-muted">Everything fits within your daily budget. Blocks end on {res.endsOn ? day(res.endsOn) : "—"}.</p>
                    ) : (
                      <p className="rounded-lg bg-[var(--warn-soft,var(--surface-2))] px-3 py-2">
                        <b>Does not fit your daily budget: over by {hours(res.overMinutes)}.</b>{" "}
                        {res.mode === "stretched"
                          ? `So days run up to ${Math.round((res.factor - 1) * 100)}% over budget; nothing is dropped.`
                          : `Days may run 25% over, and still ${p.leftOut.length} blocks are left out (drills first, then the last units). They are listed below and marked skipped; Undo brings them back.`}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-x-5 gap-y-2">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={!!opts.useHolidays} disabled={pending} onChange={(e) => toggle({ useHolidays: e.target.checked })} />
                      Study on holidays too
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={!!opts.keepAll} disabled={pending} onChange={(e) => toggle({ keepAll: e.target.checked })} />
                      Keep every block (longer days instead of leaving blocks out)
                    </label>
                  </div>

                  <div>
                    <h3 className="mb-1.5 font-medium">What moves</h3>
                    <p className="text-muted">
                      {p.moves.length} blocks change day
                      {[...perSubject].length ? `: ${[...perSubject].map(([s, n]) => `${s} ${n}`).join(", ")}` : ""}. Order inside each subject is kept. Ticked or part-done
                      blocks, and the mocks and revision already in the last days, stay put.
                      {p.staleHabits ? ` ${p.staleHabits} old missed DSA/GSoC blocks are marked skipped (they are habits, not backlog); upcoming ones stay.` : ""}
                    </p>
                  </div>

                  <div>
                    <h3 className="mb-1.5 font-medium">New days</h3>
                    <ul className="divide-y divide-line rounded-lg border border-line">
                      {busy.map((d) => (
                        <li key={d.date} className="flex items-center gap-3 px-3 py-1.5">
                          <span className="w-24 shrink-0 tabular-nums">{day(d.date)}</span>
                          <span className={cn("w-28 shrink-0 tabular-nums", d.over && "text-[var(--bad)]")}>
                            {d.isExam ? "paper day" : d.isHoliday && !d.minutes ? "holiday" : `${fmtDuration(d.minutes)} / ${fmtDuration(d.budget)}`}
                          </span>
                          <span className="min-w-0 truncate text-muted">{[...new Set(d.subjects)].join(" + ")}</span>
                          {d.over ? <Badge tone="warn">over</Badge> : null}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {p.leftOut.length ? (
                    <div>
                      <h3 className="mb-1.5 font-medium">Left out ({p.leftOut.length}, {hours(p.leftOut.reduce((a, t) => a + t.minutes, 0))})</h3>
                      <ul className="space-y-0.5 text-muted">
                        {p.leftOut.map((t) => (
                          <li key={t.id}>
                            {t.subject}: {t.title} ({fmtDuration(t.minutes)})
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </>
              ) : null}
            </div>

            <div className="flex justify-end gap-2 border-t border-line px-5 py-3">
              <Button onClick={() => setOpen(false)} disabled={pending}>
                Cancel
              </Button>
              <Button variant="primary" onClick={apply} disabled={pending || !p || (!p.moves.length && !p.leftOut.length)}>
                {pending ? "Working…" : "Apply replan"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
