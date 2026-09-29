import Link from "next/link";
import { getSubjects } from "@/lib/queries";
import { sprints, sprintFor } from "@/data/sprints";
import { SprintBoard } from "@/components/sprint-board";
import { Card } from "@/components/ui";
import { ACCENT_CLASS, cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

/**
 * Exam sprints — a strict, ordered video checklist per subject. Only the
 * subjects that have a sprint defined (see src/data/sprints.ts) show up.
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
        <h1 className="text-[length:var(--text-page)]">Exam Sprint</h1>
        <p className="mt-1 max-w-2xl text-[length:var(--text-small)] text-muted">
          A strict, ordered video route to get exam-ready — watch each step in turn and tick it
          off. Progress is kept in this browser.
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
