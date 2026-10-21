import Link from "next/link";
import { getSubjects } from "@/lib/queries";
import { sprints, sprintFor } from "@/data/sprints";
import { SprintBoard } from "@/components/sprint-board";
import { PlanRunSection } from "@/components/planner/plan-run-section";
import { Card } from "@/components/ui";
import { ACCENT_CLASS, cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

/**
 * Sprint: the prep plan day by day (end-sem prep, DSA, GSoC), Planly-style,
 * then the video routes — a strict, ordered checklist per subject for the
 * subjects that have one (see src/data/sprints.ts).
 */
export default async function SprintPage({
  searchParams,
}: {
  searchParams: Promise<{ subject?: string }>;
}) {
  const { subject } = await searchParams;
  const subjects = await getSubjects();
  const active = sprintFor(subject ?? "") ?? sprints[0];
  const activeSubject = subjects.find((s) => s.slug === active.subject) ?? null;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[length:var(--text-page)]">Sprint</h1>
        <p className="mt-1 max-w-2xl text-[length:var(--text-small)] text-muted">
          Your prep, one numbered day at a time — end-sems, DSA and GSoC. Tick blocks here, on
          Today, or with <code>done</code> in life-helper.
        </p>
      </div>

      <PlanRunSection />

      <div className="pt-4">
        <h2 className="text-[length:var(--text-title)]">Video routes</h2>
        <p className="mt-1 max-w-2xl text-[length:var(--text-small)] text-muted">
          A strict, ordered video route per subject — watch each step in turn and tick it off.
          Written for the mid-sems, so they cover the first units only; progress is kept in this browser.
        </p>
      </div>

      {/* one chip per subject that has a sprint */}
      <div className="flex flex-wrap gap-1.5">
        {sprints.map((sp) => {
          const s = subjects.find((x) => x.slug === sp.subject);
          const on = active.subject === sp.subject;
          return (
            <Link
              key={sp.subject}
              href={`/sprint?subject=${sp.subject}`}
              className={cn(
                "inline-flex h-7 items-center rounded-lg border px-2.5 text-[length:var(--text-micro)] font-medium transition-colors focus-ring",
                s ? ACCENT_CLASS[s.color] : "",
                on ? "border-sc bg-sc-soft text-sc" : "border-line bg-surface text-muted hover:text-fg",
              )}
            >
              {s?.short_name ?? sp.title}
            </Link>
          );
        })}
      </div>

      <Card className={cn("p-5 sm:p-6", activeSubject ? ACCENT_CLASS[activeSubject.color] : "")}>
        <div className="mb-5">
          <h2 className="font-serif text-[length:var(--text-title)] font-semibold">{active.title}</h2>
          <p className="mt-1 text-[length:var(--text-small)] text-muted">{active.examLine}</p>
          <p className="text-[length:var(--text-small)] text-muted">{active.scopeLine}</p>
          {active.intro ? (
            <p className="mt-3 max-w-2xl text-[length:var(--text-small)]">{active.intro}</p>
          ) : null}
        </div>
        <SprintBoard sprint={active} />
      </Card>
    </div>
  );
}
