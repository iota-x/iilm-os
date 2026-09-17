import Link from "next/link";
import { AlertTriangle, CalendarClock, ShieldAlert } from "lucide-react";
import { getComponents, getExams, getSubjects, getTopics } from "@/lib/queries";
import { MarksTable } from "@/components/subject/marks-table";
import { Badge, Bar, Card, CardHead, Ring } from "@/components/ui";
import { ACCENT_CLASS, cn, daysUntil, MIDSEM_START, progressOf } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ExamsPage() {
  const [subjects, exams, components, topics] = await Promise.all([
    getSubjects(),
    getExams(),
    getComponents(),
    getTopics(),
  ]);

  const left = daysUntil(MIDSEM_START);
  const subjectExams = exams.filter((e) => e.subject_id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[20px] font-semibold tracking-tight">Exams & marking</h1>
        <p className="text-[13px] text-muted mt-0.5">
          How the 100 marks are actually split, and where you stand.
        </p>
      </div>

      {/* ── countdown ──────────────────────────────────────── */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-3">
            <CalendarClock size={20} className="text-[var(--accent)]" />
            <div>
              <p className="text-[15px] font-semibold tracking-tight">
                Mid-semester examinations
              </p>
              <p className="text-[12.5px] text-muted mt-0.5">
                5–11 Oct 2026 ·{" "}
                <span className="text-[var(--warn)]">dates not officially confirmed</span>
              </p>
            </div>
          </div>
          <div className="ml-auto text-right">
            <p className="text-[26px] font-semibold tabular-nums leading-none">{left}</p>
            <p className="text-[11.5px] text-muted mt-1">days left</p>
          </div>
        </div>
      </Card>

      {/* ── readiness per subject ──────────────────────────── */}
      <Card>
        <CardHead title="Readiness" sub="Only topics inside the mid-sem scope" />
        <ul className="divide-y divide-[var(--border)]">
          {subjects.map((s) => {
            const mid = topics.filter((t) => t.subject_id === s.id && t.in_midsem);
            const p = progressOf(mid.map((t) => t.status));
            const exam = subjectExams.find((e) => e.subject_id === s.id);
            return (
              <li key={s.id} className={cn("px-4 py-3", ACCENT_CLASS[s.color])}>
                <Link href={`/subjects/${s.slug}`} className="flex items-start gap-3 focus-ring rounded">
                  <Ring value={p} size={40} stroke={3.5} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium flex items-center gap-2">
                      {s.name}
                      {!s.midsem_confirmed ? <Badge tone="warn">scope unconfirmed</Badge> : null}
                    </p>
                    <p className="text-[12px] text-muted mt-0.5 leading-relaxed">
                      {exam?.scope ?? s.midsem_scope}
                    </p>
                    {mid.length ? (
                      <Bar value={p} className="w-40 mt-2" />
                    ) : (
                      <p className="text-[11.5px] text-[var(--warn)] mt-1.5">
                        no syllabus loaded — nothing to measure
                      </p>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </Card>

      {/* ── the scheme ─────────────────────────────────────── */}
      <div>
        <h2 className="text-[15px] font-semibold tracking-tight">How your marks are made up</h2>
        <p className="text-[12.5px] text-muted mt-1 max-w-2xl leading-relaxed">
          Identical across every theory course in the programme. Taken verbatim from your Applied
          Calculus and Programming in C course plans.
        </p>

        <div className="grid gap-3 sm:grid-cols-3 mt-4">
          <SchemeCard
            label="Continuous Learning Assessment"
            marks={30}
            weight={30}
            body="Class Test 10 · Assignment 10 · Quiz 5 · Project 15 · Innovative Practices 15. Faculty pick at least two of these; the total can't exceed 30."
          />
          <SchemeCard
            label="Mid-Semester Examination"
            marks={20}
            weight={20}
            body="One written paper, 5–11 Oct. Covers roughly the first three units."
            highlight
          />
          <SchemeCard
            label="End-Semester Examination"
            marks={100}
            weight={50}
            body="Marked out of 100, scaled to 50% of your final grade. Covers the entire syllabus."
          />
        </div>
      </div>

      {/* ── the rules that bite ────────────────────────────── */}
      <Card className="border-[var(--warn)]/35">
        <div className="px-4 py-3.5">
          <p className="text-[13px] font-semibold flex items-center gap-2">
            <ShieldAlert size={15} className="text-[var(--warn)]" />
            Three rules that fail people who were otherwise fine
          </p>
          <ol className="mt-2.5 space-y-2.5">
            <li className="text-[12.5px] leading-relaxed flex gap-2.5">
              <span className="text-subtle font-mono shrink-0">1.</span>
              <span>
                <strong>40% in internals AND 40% in the end-sem, separately.</strong> Internals are
                CLA 30 + MSE 20 = 50 marks, so you need 20. The end-sem is out of 100 raw, so you
                need 40. A brilliant end-sem does not rescue weak internals, and the reverse is
                also true.
              </span>
            </li>
            <li className="text-[12.5px] leading-relaxed flex gap-2.5">
              <span className="text-subtle font-mono shrink-0">2.</span>
              <span>
                <strong>75% attendance in every subject.</strong> Below it and you are barred from
                sitting the end-sem at all — no marks, regardless of performance. You started a
                month late, so this is a live risk, not a theoretical one. Find out your current
                percentage per subject this week.
              </span>
            </li>
            <li className="text-[12.5px] leading-relaxed flex gap-2.5">
              <span className="text-subtle font-mono shrink-0">3.</span>
              <span>
                <strong>Lab courses have no end-sem paper.</strong> They&rsquo;re 100% continuous —
                50 marks of quizzes plus 50 of execution &amp; viva, all during lab hours, with
                your lab file checked each session. Miss the sessions and there is no way to make
                the marks up later.
              </span>
            </li>
          </ol>
        </div>
      </Card>

      {/* ── per-subject components ─────────────────────────── */}
      <div className="space-y-6">
        <h2 className="text-[15px] font-semibold tracking-tight">Every assessment, by subject</h2>
        {subjects.map((s) => {
          const own = components.filter((c) => c.subject_id === s.id);
          if (!own.length) return null;
          return (
            <div key={s.id} className={ACCENT_CLASS[s.color]}>
              <div className="flex items-center gap-2 mb-2.5">
                <h3 className="text-[13.5px] font-semibold">
                  <Link href={`/subjects/${s.slug}`} className="hover:text-sc focus-ring rounded">
                    {s.name}
                  </Link>
                </h3>
                {s.status !== "complete" ? (
                  <Badge tone="warn">
                    <AlertTriangle size={10} /> unconfirmed
                  </Badge>
                ) : null}
              </div>
              <MarksTable components={own} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SchemeCard({
  label,
  marks,
  weight,
  body,
  highlight,
}: {
  label: string;
  marks: number;
  weight: number;
  body: string;
  highlight?: boolean;
}) {
  return (
    <Card className={cn("p-4", highlight && "ring-1 ring-[var(--accent)]")}>
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-[12px] font-medium text-muted leading-snug">{label}</p>
        <p className="text-[18px] font-semibold tabular-nums shrink-0">{weight}%</p>
      </div>
      <p className="text-[11.5px] text-subtle mt-0.5">out of {marks} marks</p>
      <p className="text-[12px] text-muted mt-2.5 leading-relaxed">{body}</p>
    </Card>
  );
}
