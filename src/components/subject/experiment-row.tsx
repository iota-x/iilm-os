"use client";

import { useOptimistic, useState, useTransition } from "react";
import { Check, ChevronDown, FileCheck2 } from "lucide-react";
import { setExperiment } from "@/lib/actions";
import type { Experiment } from "@/lib/db-types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui";

export function ExperimentRow({ exp: experiment }: { exp: Experiment }) {
  const [open, setOpen] = useState(false);
  const [, start] = useTransition();
  const [exp, applyOptimistic] = useOptimistic(
    experiment,
    (prev, patch: Partial<Experiment>) => ({ ...prev, ...patch }),
  );
  const done = exp.status === "done";

  return (
    <li className="px-4 py-3">
      <div className="flex items-start gap-3">
        <button
          onClick={() =>
            start(async () => {
              const next: Experiment["status"] = done ? "not_started" : "done";
              applyOptimistic({ status: next });
              await setExperiment(exp.id, { status: next });
            })
          }
          aria-label={done ? "Mark not done" : "Mark done"}
          className={cn(
            "mt-0.5 grid h-[18px] w-[18px] shrink-0 place-items-center rounded-[6px] border transition-colors focus-ring",
            done ? "bg-sc border-sc text-white" : "border-strong hover:border-sc bg-surface",
          )}
        >
          {done ? <Check size={12} strokeWidth={3} /> : null}
        </button>

        <div className="min-w-0 flex-1">
          <button
            onClick={() => setOpen(!open)}
            className="text-left w-full focus-ring rounded group"
          >
            <p className={cn("text-[length:var(--text-small)] font-medium leading-snug", done && "text-muted")}>
              <span className="text-subtle font-mono mr-1.5">{exp.number}.</span>
              {exp.title}
              <ChevronDown
                size={13}
                className={cn(
                  "inline ml-1.5 -mt-0.5 text-subtle transition-transform",
                  open && "rotate-180",
                )}
              />
            </p>
          </button>

          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
            {exp.co ? <Badge tone="neutral">{exp.co}</Badge> : null}
            {exp.in_midsem ? <Badge tone="accent">expected by now</Badge> : null}
            <button
              onClick={() =>
                start(async () => {
                  applyOptimistic({ file_done: !exp.file_done });
                  await setExperiment(exp.id, { file_done: !exp.file_done });
                })
              }
              className={cn(
                "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[length:var(--text-micro)] font-medium transition-colors focus-ring",
                exp.file_done
                  ? "bg-[var(--good-soft)] text-[var(--good)]"
                  : "bg-surface-3 text-muted hover:text-fg",
              )}
            >
              <FileCheck2 size={10} />
              {exp.file_done ? "in lab file" : "not written up"}
            </button>
          </div>

          {open ? (
            <div className="mt-2.5 space-y-2 animate-in">
              {exp.objective ? (
                <p className="text-[length:var(--text-small)] text-muted leading-relaxed">{exp.objective}</p>
              ) : null}
              {exp.tasks.length ? (
                <ul className="space-y-1">
                  {exp.tasks.map((t, i) => (
                    <li key={i} className="text-[length:var(--text-small)] leading-relaxed flex gap-2">
                      <span className="text-subtle select-none shrink-0">·</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </li>
  );
}
