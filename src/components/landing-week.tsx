"use client";

import { useState } from "react";
import { WeekGrid } from "@/components/planner/week-grid";
import type { Slot, Subject } from "@/lib/db-types";
import { cn } from "@/lib/utils";

/** The section's real week, drawn to scale, with a group switch. */
export function LandingWeek({ slots, subjects }: { slots: Slot[]; subjects: Subject[] }) {
  const [group, setGroup] = useState<1 | 2>(2);
  const mine = slots.filter((s) => s.lab_group === null || s.lab_group === group);
  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-[length:var(--text-small)] text-muted">
          Section E, this semester. Free time is drawn, not implied.
        </p>
        <div className="inline-flex rounded-lg border border-line bg-surface-2 p-0.5">
          {([1, 2] as const).map((g) => (
            <button
              key={g}
              onClick={() => setGroup(g)}
              className={cn(
                "rounded-[7px] px-2.5 py-1 text-[length:var(--text-micro)] font-medium transition-colors focus-ring",
                group === g ? "bg-surface text-fg shadow-card" : "text-subtle hover:text-fg",
              )}
            >
              Group {g}
            </button>
          ))}
        </div>
      </div>
      <WeekGrid slots={mine} subjects={subjects} />
    </div>
  );
}
