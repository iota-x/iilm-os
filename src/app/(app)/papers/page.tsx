import { ExternalLink, FileText } from "lucide-react";
import { getPapers, getProfile, getSubjects } from "@/lib/queries";
import { boardImageUrl } from "@/lib/board-image";
import { NewPaper } from "@/components/papers/new-paper";
import { PaperVote } from "@/components/papers/paper-vote";
import { VerifyPaper } from "@/components/papers/verify-paper";
import { Verified } from "@/components/class/badges";
import { ActionButton } from "@/components/staff/action-button";
import { deletePaper } from "@/lib/actions";
import { Card, CardHead, Empty } from "@/components/ui";
import { ACCENT_CLASS, cn } from "@/lib/utils";
import type { Paper } from "@/lib/db-types";

export const dynamic = "force-dynamic";

const EXAM_LABEL: Record<string, string> = { "end-sem": "End-sem", "mid-sem": "Mid-sem", quiz: "Quiz", other: "Paper" };

/**
 * Previous years' papers, per subject. Shared by every section on the same
 * syllabus, ranked by the class: a teacher's tick first, then Helpful votes.
 */
export default async function PapersPage() {
  const [papers, subjects, profile] = await Promise.all([getPapers(), getSubjects(), getProfile()]);
  const teacher = Boolean(profile?.is_faculty || profile?.is_admin);
  const rank = (a: Paper, b: Paper) =>
    Number(Boolean(b.verified_by)) - Number(Boolean(a.verified_by)) || b.helpful - a.helpful || b.year - a.year;
  const groups = subjects
    .map((s) => ({ s, items: papers.filter((p) => p.subject_slug === s.slug).sort(rank) }))
    .filter((g) => g.items.length);

  return (
    <div className="mx-auto max-w-[820px] space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[length:var(--text-page)]">Past papers</h1>
          <p className="mt-1 max-w-xl text-[length:var(--text-small)] text-muted">
            Last years&rsquo; question papers, shared by every section on your syllabus. Mark the useful ones
            Helpful — the best rise to the top, and whoever added them earns brownie points.
          </p>
        </div>
        <NewPaper subjects={subjects} />
      </div>

      {groups.length ? (
        groups.map(({ s, items }) => (
          <Card key={s.id} className={ACCENT_CLASS[s.color]}>
            <CardHead title={s.name} sub={`${items.length} paper${items.length === 1 ? "" : "s"}`} />
            <ul className="divide-y divide-[var(--border)]">
              {items.map((p) => {
                const href = p.file_path ? boardImageUrl(p.file_path) : (p.url ?? "#");
                return (
                  <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                    <div className="min-w-0">
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 font-medium hover:underline focus-ring rounded"
                      >
                        {p.file_path ? <FileText size={14} className="text-[var(--sc,var(--accent))]" /> : <ExternalLink size={14} />}
                        {EXAM_LABEL[p.exam] ?? "Paper"} {p.year}
                      </a>
                      {p.title ? <span className="text-[length:var(--text-small)] text-muted"> — {p.title}</span> : null}
                      <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[length:var(--text-micro)] text-subtle">
                        <Verified by={p.verifier} />
                        added by {p.author}
                      </p>
                    </div>
                    <div className={cn("flex items-center gap-1.5")}>
                      <PaperVote id={p.id} count={p.helpful} mine={p.mine} />
                      {teacher ? <VerifyPaper id={p.id} verified={Boolean(p.verified_by)} /> : null}
                      {p.user_id === profile?.id || profile?.is_admin ? (
                        <ActionButton action={deletePaper.bind(null, p.id)} confirm="Delete?" done="Deleted" variant="ghost">
                          Delete
                        </ActionButton>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>
        ))
      ) : (
        <Card>
          <Empty
            icon={<FileText size={26} strokeWidth={1.5} />}
            title="No papers yet"
            body="Got last year's end-sem on your phone? Add it — every section on your syllabus will see it, and you'll be first on the board."
          />
        </Card>
      )}
    </div>
  );
}
