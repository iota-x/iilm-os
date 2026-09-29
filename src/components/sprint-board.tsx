"use client";

import { Check, Play } from "lucide-react";
import { useLocalStorage } from "@/lib/client-hooks";
import type { Sprint } from "@/data/sprints";
import { cn } from "@/lib/utils";

const EMPTY: Record<string, boolean> = {};

const BADGE: Record<string, string> = {
  watch: "bg-sc-soft text-sc",
  do: "bg-surface-2 text-muted",
  gap: "bg-sc text-white",
  core: "bg-sc text-white",
};
const BADGE_LABEL: Record<string, string> = { watch: "Watch", do: "Do", gap: "Gap", core: "Core" };

/**
 * The exam sprint as a strict, ordered checklist. Ticking a step is a personal
 * convenience, so progress lives in localStorage (per browser), not the DB.
 */
export function SprintBoard({ sprint }: { sprint: Sprint }) {
  const [done, setDone] = useLocalStorage<Record<string, boolean>>(`sprint:${sprint.subject}`, EMPTY);
  const steps = sprint.groups.flatMap((g) => g.steps);
  const total = steps.length;
  const n = steps.filter((s) => done[s.id]).length;
  const pct = total ? Math.round((n / total) * 100) : 0;

  const number = new Map<string, number>();
  steps.forEach((s, i) => number.set(s.id, i + 1));

  const toggle = (id: string) => setDone({ ...done, [id]: !done[id] });

  return (
    <div className="space-y-6">
      {/* progress */}
      <div className="flex items-center gap-3 text-[length:var(--text-small)] tabular-nums text-muted">
        <span className="font-medium text-fg">{pct}%</span>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2">
          <div className="h-full rounded-full bg-sc transition-[width] duration-300" style={{ width: `${pct}%` }} />
        </div>
        <span>{n} / {total}</span>
      </div>

      {sprint.groups.map((g) => (
        <section key={g.heading}>
          <div className="mb-1 flex items-baseline justify-between gap-3 border-b border-line pb-1.5">
            <h2 className="font-serif text-[length:var(--text-lead)] font-semibold">{g.heading}</h2>
            {g.tag ? <span className="text-[length:var(--text-micro)] text-subtle tabular-nums">{g.tag}</span> : null}
          </div>
          <ol>
            {g.steps.map((step) => {
              const isDone = !!done[step.id];
              return (
                <li key={step.id} className="relative grid grid-cols-[32px_1fr] gap-3.5 pb-4">
                  {/* connector */}
                  <span aria-hidden className="absolute left-[15px] top-[34px] bottom-0 w-px bg-line" />
                  <button
                    type="button"
                    onClick={() => toggle(step.id)}
                    aria-pressed={isDone}
                    aria-label={`${isDone ? "Undo" : "Done"}: ${step.title}`}
                    className={cn(
                      "relative z-10 grid size-8 place-items-center rounded-full border-2 tabular-nums transition-colors focus-ring",
                      isDone ? "border-sc bg-sc text-white" : "border-subtle bg-surface text-fg hover:border-sc",
                    )}
                  >
                    {isDone ? <Check size={16} strokeWidth={3} /> : <span className="text-[length:var(--text-small)]">{number.get(step.id)}</span>}
                  </button>

                  <div className="min-w-0 pt-1">
                    <span className={cn("mr-2 inline-block rounded px-1.5 py-0.5 align-[1px] text-[length:var(--text-micro)] font-medium uppercase tracking-wide", BADGE[step.kind])}>
                      {BADGE_LABEL[step.kind]}
                    </span>
                    <span className={cn("font-semibold", isDone && "text-muted line-through", step.milestone && !isDone && "text-sc")}>
                      {step.title}
                    </span>
                    {step.note ? <p className="mt-1 text-[length:var(--text-small)] text-muted">{step.note}</p> : null}

                    {step.videos?.length ? (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {step.videos.map((v) => (
                          <a
                            key={v.url}
                            href={v.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-[var(--radius-control)] bg-sc-soft px-2.5 py-1.5 text-[length:var(--text-small)] font-medium text-sc transition-colors hover:bg-sc/15 focus-ring"
                          >
                            <Play size={13} className="shrink-0 fill-current" />
                            <span>{v.title}</span>
                            {v.dur ? <span className="text-[length:var(--text-micro)] text-subtle tabular-nums">{v.dur}</span> : null}
                          </a>
                        ))}
                      </div>
                    ) : null}

                    {step.facts?.length ? (
                      <div className="mt-2 space-y-1 rounded-[var(--radius-control)] border border-line bg-surface-2/50 p-3 font-mono text-[length:var(--text-micro)] leading-relaxed">
                        {step.facts.map((f, i) => (
                          <div key={i}>{f}</div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}
