import Link from "next/link";
import { AlertTriangle, ArrowRight, FlaskConical } from "lucide-react";
import { getSubjects, getTopics, getUnits, getExperiments } from "@/lib/queries";
import { Badge, Bar, Card } from "@/components/ui";
import { ACCENT_CLASS, cn, progressOf } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function SubjectsPage() {
  const [subjects, topics, units, experiments] = await Promise.all([
    getSubjects(),
    getTopics(),
    getUnits(),
    getExperiments(),
  ]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[length:var(--text-page)]">Subjects</h1>
        <p className="mt-1 text-[length:var(--text-small)] text-muted">
          Six courses, {units.length} units, {topics.length} topics, {experiments.length} lab
          experiments.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {subjects.map((s) => {
          const own = topics.filter((t) => t.subject_id === s.id);
          const mid = own.filter((t) => t.in_midsem);
          const ownUnits = units.filter((u) => u.subject_id === s.id);
          const ownExp = experiments.filter((e) => e.subject_id === s.id);
          const progress = progressOf(own.map((t) => t.status));
          const midProgress = progressOf(mid.map((t) => t.status));

          return (
            <Link key={s.id} href={`/subjects/${s.slug}`} className="focus-ring rounded-[14px]">
              <Card
                className={cn(
                  "h-full p-4 transition-colors hover:border-strong",
                  ACCENT_CLASS[s.color],
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-[length:var(--text-body)] font-semibold tracking-tight leading-snug">
                      {s.name}
                    </h2>
                    <p className="text-[length:var(--text-micro)] text-muted mt-0.5">
                      {s.code ? `${s.code} · ` : ""}
                      {s.ltpc}
                      {s.teacher ? ` · ${s.teacher}` : ""}
                    </p>
                  </div>
                  <ArrowRight size={15} className="text-subtle shrink-0 mt-1" />
                </div>

                <div className="flex flex-wrap gap-1.5 mt-3">
                  {s.status === "empty" ? (
                    <Badge tone="bad">
                      <AlertTriangle size={10} /> no material
                    </Badge>
                  ) : s.status === "partial" ? (
                    <Badge tone="warn">
                      <AlertTriangle size={10} /> partial
                    </Badge>
                  ) : (
                    <Badge tone="subject">complete</Badge>
                  )}
                  {ownUnits.length ? (
                    <Badge tone="neutral">{ownUnits.length} units</Badge>
                  ) : null}
                  {s.has_lab ? (
                    <Badge tone="neutral">
                      <FlaskConical size={10} />
                      {ownExp.length ? `${ownExp.length} experiments` : "lab"}
                    </Badge>
                  ) : null}
                </div>

                {own.length ? (
                  <div className="mt-4 space-y-2.5">
                    <div>
                      <div className="flex items-baseline justify-between text-[length:var(--text-micro)] mb-1">
                        <span className="text-muted">Mid-sem scope</span>
                        <span className="font-semibold tabular-nums">
                          {Math.round(midProgress * 100)}%
                        </span>
                      </div>
                      <Bar value={midProgress} />
                    </div>
                    <div>
                      <div className="flex items-baseline justify-between text-[length:var(--text-micro)] mb-1">
                        <span className="text-muted">Whole course</span>
                        <span className="font-semibold tabular-nums">
                          {Math.round(progress * 100)}%
                        </span>
                      </div>
                      <Bar value={progress} className="opacity-50" />
                    </div>
                  </div>
                ) : (
                  <p className="mt-4 text-[length:var(--text-small)] text-muted leading-relaxed">
                    {s.status === "empty"
                      ? "Nothing loaded. Open it — there's a note on exactly what to chase."
                      : "No topics loaded yet."}
                  </p>
                )}

                {s.gaps.length ? (
                  <p className="mt-3 text-[length:var(--text-micro)] text-[var(--warn)] flex items-start gap-1.5">
                    <AlertTriangle size={11} className="mt-0.5 shrink-0" />
                    {s.gaps.length} gap{s.gaps.length > 1 ? "s" : ""} to close
                  </p>
                ) : null}
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
