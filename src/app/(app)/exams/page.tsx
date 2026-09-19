import Link from "next/link";
import { AlertTriangle, ShieldAlert } from "lucide-react";
import {
  getComponents,
  getExams,
  getExperiments,
  getSubjects,
  getTopics,
} from "@/lib/queries";
import { MarksTable } from "@/components/subject/marks-table";
import { Badge, Bar, Card, Ring } from "@/components/ui";
import { ACCENT_CLASS, cn, daysUntil, MIDSEM_START, progressOf } from "@/lib/utils";

export const dynamic = "force-dynamic";

/** The three ways a theory course is marked, and what each is worth. The
 *  widths on screen are these numbers — that's the whole point of the bar. */
const SCHEME = [
  {
    key: "cla",
    name: "Continuous assessment",
    weight: 30,
    of: "30 marks",
    body: "Class Test 10 · Assignment 10 · Quiz 5 · Project 15 · Innovative Practices 15. Faculty pick at least two; the total can't exceed 30.",
  },
  {
    key: "mse",
    name: "Mid-semester",
    weight: 20,
    of: "20 marks",
    body: "One written paper, 5–11 Oct. Roughly the first three units, though each course plan sets its own scope.",
  },
  {
    key: "ese",
    name: "End-semester",
    weight: 50,
    of: "100 marks, halved",
    body: "The whole syllabus in one paper, marked out of 100 and scaled to half your grade.",
  },
] as const;

export default async function ExamsPage() {
  const [subjects, exams, components, topics, experiments] = await Promise.all([
    getSubjects(),
    getExams(),
    getComponents(),
    getTopics(),
    getExperiments(),
  ]);

  const left = daysUntil(MIDSEM_START);
  const subjectExams = exams.filter((e) => e.subject_id);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-[length:var(--text-page)]">Exams &amp; marking</h1>
        <p className="mt-1 text-[length:var(--text-small)] text-muted">
          Mid-semesters run 5&ndash;11 Oct 2026 — {left} days away, on{" "}
          <span className="text-[var(--warn)]">dates not yet officially confirmed</span>. Below is
          how the 100 marks are split and where you stand in each paper.
        </p>
      </div>

      {/* ── the split, drawn to scale ──────────────────────── */}
      <section className="space-y-3">
        <h2 className="text-[length:var(--text-title)]">Where the 100 marks go</h2>

        <div className="flex h-14 overflow-hidden rounded-[var(--radius-card)]">
          {SCHEME.map((part) => (
            <div
              key={part.key}
              style={{ width: `${part.weight}%` }}
              className={cn(
                "flex flex-col justify-center border-r border-[var(--bg)] px-3 last:border-r-0",
                part.key === "mse"
                  ? "bg-[var(--accent)] text-[var(--accent-fg)]"
                  : "bg-surface-3 text-fg",
              )}
            >
              <p className="text-[length:var(--text-lead)] font-semibold leading-none tabular-nums">
                {part.weight}%
              </p>
              <p
                className={cn(
                  "mt-1 truncate text-[length:var(--text-micro)]",
                  part.key === "mse" ? "opacity-80" : "text-muted",
                )}
              >
                {part.name}
              </p>
            </div>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {SCHEME.map((part) => (
            <div key={part.key}>
              <p className="text-[length:var(--text-small)] font-medium">
                {part.name}
                <span className="ml-2 font-normal text-subtle">{part.of}</span>
              </p>
              <p className="mt-1 text-[length:var(--text-small)] leading-relaxed text-muted">
                {part.body}
              </p>
            </div>
          ))}
        </div>

        <p className="text-[length:var(--text-small)] text-subtle">
          Identical across every theory course in the programme, taken verbatim from your Applied
          Calculus and Programming in C course plans. Lab courses are marked differently — see rule
          three.
        </p>
      </section>

      {/* ── readiness, per paper ───────────────────────────── */}
      <section className="space-y-3">
        <h2 className="text-[length:var(--text-title)]">Where you stand, paper by paper</h2>
        <Card>
          <ul className="divide-y divide-[var(--border)]">
            {subjects.map((s) => {
              // Lab-only courses measure experiments; there are no topics to count.
              const mid = topics.filter((t) => t.subject_id === s.id && t.in_midsem);
              const labs = experiments.filter((e) => e.subject_id === s.id);
              const measured = mid.length
                ? mid.map((t) => t.status)
                : labs.map((e) => e.status);
              const noun = mid.length ? "topics" : "experiments";
              const p = progressOf(measured);
              const exam = subjectExams.find((e) => e.subject_id === s.id);
              const internals = internalsStanding(components.filter((c) => c.subject_id === s.id));

              return (
                <li key={s.id} className={cn("px-4 py-3", ACCENT_CLASS[s.color])}>
                  <Link
                    href={`/subjects/${s.slug}`}
                    className="flex items-start gap-3 rounded focus-ring"
                  >
                    <Ring value={p} size={40} stroke={3.5} />
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-2 text-[length:var(--text-small)] font-medium">
                        {s.name}
                        {!s.midsem_confirmed ? <Badge tone="warn">scope unconfirmed</Badge> : null}
                      </p>
                      <p className="mt-0.5 text-[length:var(--text-micro)] leading-relaxed text-muted">
                        {exam?.scope ?? s.midsem_scope}
                      </p>
                      {measured.length ? (
                        <div className="mt-2 flex items-center gap-2.5">
                          <Bar value={p} className="w-40" />
                          <span className="text-[length:var(--text-micro)] tabular-nums text-subtle">
                            {measured.filter((x) => x !== "not_started").length}/{measured.length}{" "}
                            {noun} started
                          </span>
                        </div>
                      ) : (
                        <p className="mt-1.5 text-[length:var(--text-micro)] text-[var(--warn)]">
                          no syllabus loaded — nothing to measure
                        </p>
                      )}
                      {internals ? (
                        <p
                          className={cn(
                            "mt-1.5 text-[length:var(--text-micro)] tabular-nums",
                            internals.tone === "good" && "text-[var(--good)]",
                            internals.tone === "bad" && "text-[var(--bad)]",
                            internals.tone === "muted" && "text-subtle",
                          )}
                        >
                          {internals.text}
                        </p>
                      ) : null}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>
      </section>

      {/* ── the rules that bite ────────────────────────────── */}
      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-[length:var(--text-title)]">
          <ShieldAlert size={18} className="text-[var(--warn)]" />
          Three rules that fail people who were otherwise fine
        </h2>
        <ol className="space-y-3">
          <Rule n={1} title="40% in internals and 40% in the end-sem, separately">
            Internals are CLA 30 + MSE 20 = 50 marks, so you need 20. The end-sem is out of 100
            raw, so you need 40. A brilliant end-sem does not rescue weak internals, and the
            reverse is also true.
          </Rule>
          <Rule n={2} title="75% attendance in every subject">
            Below it and you are barred from sitting the end-sem at all — no marks, regardless of
            performance. You started a month late, so this is live rather than theoretical.{" "}
            <Link
              href="/attendance"
              className="text-fg underline underline-offset-2 hover:text-[var(--accent)]"
            >
              Check where you are
            </Link>
            .
          </Rule>
          <Rule n={3} title="Lab courses have no end-sem paper">
            They&rsquo;re 100% continuous — 50 marks of quizzes plus 50 of execution and viva, all
            during lab hours, with your lab file checked each session. Miss the sessions and there
            is no way to make the marks up later.
          </Rule>
        </ol>
      </section>

      {/* ── per-subject components ─────────────────────────── */}
      <section className="space-y-5">
        <h2 className="text-[length:var(--text-title)]">Every assessment, by subject</h2>
        {subjects.map((s) => {
          const own = components.filter((c) => c.subject_id === s.id);
          if (!own.length) return null;
          return (
            <div key={s.id} className={ACCENT_CLASS[s.color]}>
              <div className="mb-2.5 flex items-center gap-2">
                <h3 className="text-[length:var(--text-small)] font-semibold">
                  <Link href={`/subjects/${s.slug}`} className="rounded hover:text-sc focus-ring">
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
      </section>
    </div>
  );
}

function Rule({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex gap-3">
      <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[var(--warn-soft)] text-[length:var(--text-micro)] font-semibold tabular-nums text-[var(--warn)]">
        {n}
      </span>
      <div className="min-w-0">
        <p className="text-[length:var(--text-small)] font-medium">{title}</p>
        <p className="mt-0.5 max-w-[72ch] text-[length:var(--text-small)] leading-relaxed text-muted">
          {children}
        </p>
      </div>
    </li>
  );
}

/**
 * One line on the internals: what's recorded against the 40% you need. Null
 * until a mark is entered — a row of "0 of 50" is noise, not information.
 */
function internalsStanding(components: { name: string; marks: number; obtained: number | null; track: string }[]) {
  // theory only: the lab track is marked on its own 100 and has no 40% gate
  const internal = components.filter((c) => c.track === "theory" && !/end[- ]?(term|sem)/i.test(c.name));
  const recorded = internal.filter((c) => c.obtained !== null);
  if (!recorded.length) return null;
  const total = internal.reduce((a, c) => a + c.marks, 0);
  const need = Math.ceil(total * 0.4);
  const got = recorded.reduce((a, c) => a + (c.obtained ?? 0), 0);
  const ahead = total - recorded.reduce((a, c) => a + c.marks, 0);
  if (got >= need) return { tone: "good" as const, text: `internals ${got}/${total} — past the ${need} bar` };
  if (got + ahead < need) return { tone: "bad" as const, text: `internals ${got}/${total} — can't reach ${need}` };
  return { tone: "muted" as const, text: `internals ${got}/${total} — need ${need - got} more from ${ahead} to come` };
}
