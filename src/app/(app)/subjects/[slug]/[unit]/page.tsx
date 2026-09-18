import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  NotebookPen,
  Target,
} from "lucide-react";
import { TopicRow } from "@/components/subject/topic-row";
import { Badge, Bar, Card, Empty, SectionTitle } from "@/components/ui";
import {
  getNotes,
  getResources,
  getSubjectBySlug,
  getTopics,
  getUnits,
} from "@/lib/queries";
import { cn } from "@/lib/utils";

/** URLs look like /subjects/applied-calculus/unit-2 */
function parseUnit(segment: string): number | null {
  const m = segment.match(/^unit-(\d+)$/);
  return m ? Number(m[1]) : null;
}

export default async function UnitPage({
  params,
}: {
  params: Promise<{ slug: string; unit: string }>;
}) {
  const { slug, unit: unitSegment } = await params;
  const number = parseUnit(unitSegment);
  if (number === null) notFound();

  const subject = await getSubjectBySlug(slug);
  if (!subject) notFound();

  const [units, allTopics, allResources, allNotes] = await Promise.all([
    getUnits(subject.id),
    getTopics(subject.id),
    getResources(subject.id),
    getNotes({ subjectId: subject.id }),
  ]);

  const unit = units.find((u) => u.number === number);
  if (!unit) notFound();

  const topics = allTopics.filter((t) => t.unit_id === unit.id);
  const topicIds = new Set(topics.map((t) => t.id));

  // A resource belongs to this unit if it names the unit, or names a topic
  // inside it. Everything else on the subject is still worth having to hand,
  // so it goes in its own clearly-labelled group rather than being hidden.
  const unitResources = allResources.filter(
    (r) => r.unit_id === unit.id || (r.topic_id && topicIds.has(r.topic_id)),
  );
  const subjectResources = allResources.filter(
    (r) => !r.unit_id && !r.topic_id,
  );

  const unitNotes = allNotes.filter(
    (n) => n.unit_id === unit.id || (n.topic_id && topicIds.has(n.topic_id)),
  );

  const mastered = topics.filter((t) => t.status === "mastered").length;
  const started = topics.filter((t) => t.status !== "not_started").length;
  const pct = topics.length ? Math.round((mastered / topics.length) * 100) : 0;

  const idx = units.findIndex((u) => u.id === unit.id);
  const prev = idx > 0 ? units[idx - 1] : null;
  const next = idx < units.length - 1 ? units[idx + 1] : null;

  return (
    <div className="space-y-5">
      {/* ── breadcrumb ─────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 text-[12px] text-subtle">
        <Link href="/subjects" className="hover:text-fg focus-ring rounded">
          Subjects
        </Link>
        <ChevronRight size={12} />
        <Link href={`/subjects/${slug}`} className="hover:text-fg focus-ring rounded">
          {subject.short_name}
        </Link>
        <ChevronRight size={12} />
        <span className="text-muted">Unit {unit.number}</span>
      </div>

      {/* ── header ─────────────────────────────────────────── */}
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-[22px] font-semibold tracking-tight">
            Unit {unit.number} — {unit.title}
          </h1>
          {unit.in_midsem ? <Badge tone="accent">in mid-sem</Badge> : null}
        </div>
        <p className="mt-1 text-[13px] text-muted">
          {unit.sessions ? `${unit.sessions} sessions` : "Sessions not stated"}
          {unit.co ? ` · ${unit.co}` : ""}
          {topics.length ? ` · ${topics.length} topics` : ""}
        </p>
      </div>

      {/* ── progress ───────────────────────────────────────── */}
      {topics.length ? (
        <Card className="p-4">
          <div className="flex items-baseline justify-between">
            <span className="text-[12px] font-medium text-muted">Progress in this unit</span>
            <span className="text-[12px] tabular-nums text-muted">
              {mastered}/{topics.length} solid · {started} started
            </span>
          </div>
          <div className="mt-2">
            <Bar value={pct} />
          </div>
          {unit.assessment ? (
            <p className="mt-3 border-t border-line pt-3 text-[12px] text-muted">
              <span className="font-medium text-fg">Assessment:</span> {unit.assessment}
            </p>
          ) : null}
        </Card>
      ) : null}

      {/* ── topics ─────────────────────────────────────────── */}
      <section>
        <SectionTitle>Topics</SectionTitle>
        <Card className="mt-2 overflow-hidden">
          {topics.length ? (
            <ul className="divide-y divide-line">
              {topics.map((t) => (
                <TopicRow
                  key={t.id}
                  topic={t}
                  subjectSlug={slug}
                  unitNumber={unit.number}
                  noteCount={allNotes.filter((n) => n.topic_id === t.id).length}
                  resourceCount={allResources.filter((r) => r.topic_id === t.id).length}
                />
              ))}
            </ul>
          ) : (
            <Empty
              icon={<Target size={20} />}
              title="No topics in this unit yet"
              body="Add the course plan to src/data/subjects/ and re-run npm run seed."
            />
          )}
        </Card>
      </section>

      {/* ── resources ──────────────────────────────────────── */}
      <section>
        <SectionTitle>
          Resources for this unit
          {unitResources.length ? (
            <span className="ml-1.5 tabular-nums text-subtle">{unitResources.length}</span>
          ) : null}
        </SectionTitle>
        <Card className="mt-2 overflow-hidden">
          {unitResources.length ? (
            <ul className="divide-y divide-line">
              {unitResources.map((r) => {
                const topic = topics.find((t) => t.id === r.topic_id);
                return (
                  <li key={r.id} className="p-3.5 transition-colors hover:bg-surface-2/60">
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-start gap-2 focus-ring rounded"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[13px] font-medium text-fg group-hover:underline">
                            {r.title}
                          </span>
                          <Badge>{r.kind}</Badge>
                          {r.minutes ? (
                            <span className="text-[11px] text-subtle">{r.minutes} min</span>
                          ) : null}
                        </span>
                        {r.source ? (
                          <span className="mt-0.5 block text-[11px] text-subtle">{r.source}</span>
                        ) : null}
                        {r.why ? (
                          <span className="mt-1 block max-w-[86ch] text-[12px] leading-snug text-muted">
                            {r.why}
                          </span>
                        ) : null}
                        {topic ? (
                          <span className="mt-1 inline-block text-[11px] text-subtle">
                            for “{topic.title}”
                          </span>
                        ) : null}
                      </span>
                      <ExternalLink size={13} className="mt-1 shrink-0 text-subtle" />
                    </a>
                  </li>
                );
              })}
            </ul>
          ) : (
            <Empty
              icon={<ExternalLink size={20} />}
              title="Nothing pinned to this unit yet"
              body={
                subjectResources.length
                  ? "The subject-wide resources below cover it. Tag a resource to a topic to have it show up here."
                  : "Use Find more on the subject page to pull some in."
              }
            />
          )}
        </Card>
      </section>

      {/* ── subject-wide resources ─────────────────────────── */}
      {subjectResources.length ? (
        <section>
          <SectionTitle>
            Whole-subject resources
            <span className="ml-1.5 tabular-nums text-subtle">{subjectResources.length}</span>
          </SectionTitle>
          <p className="mt-1 text-[12px] text-subtle">
            Not specific to Unit {unit.number}, but they cover it.
          </p>
          <Card className="mt-2 overflow-hidden">
            <ul className="divide-y divide-line">
              {subjectResources.slice(0, 6).map((r) => (
                <li key={r.id} className="px-3.5 py-2.5 transition-colors hover:bg-surface-2/60">
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 focus-ring rounded"
                  >
                    <span className="min-w-0 flex-1 truncate text-[13px] text-fg group-hover:underline">
                      {r.title}
                    </span>
                    <Badge>{r.kind}</Badge>
                    <ExternalLink size={12} className="shrink-0 text-subtle" />
                  </a>
                </li>
              ))}
            </ul>
            {subjectResources.length > 6 ? (
              <Link
                href={`/subjects/${slug}?tab=resources`}
                className="block border-t border-line px-3.5 py-2 text-[12px] text-muted hover:bg-surface-2 focus-ring"
              >
                See all {subjectResources.length} →
              </Link>
            ) : null}
          </Card>
        </section>
      ) : null}

      {/* ── notes ──────────────────────────────────────────── */}
      <section>
        <SectionTitle>
          Notes
          {unitNotes.length ? (
            <span className="ml-1.5 tabular-nums text-subtle">{unitNotes.length}</span>
          ) : null}
        </SectionTitle>
        <Card className="mt-2 overflow-hidden">
          {unitNotes.length ? (
            <ul className="divide-y divide-line">
              {unitNotes.map((n) => (
                <li key={n.id}>
                  <Link
                    href={`/notes?open=${n.id}`}
                    className="flex items-center gap-2 px-3.5 py-2.5 transition-colors hover:bg-surface-2/60 focus-ring"
                  >
                    <NotebookPen size={13} className="shrink-0 text-subtle" />
                    <span className="min-w-0 flex-1 truncate text-[13px]">{n.title}</span>
                    <ChevronRight size={13} className="shrink-0 text-subtle" />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <Empty
              icon={<NotebookPen size={20} />}
              title="No notes for this unit"
              body="Open Notes, start one, and link it to this unit or one of its topics."
            />
          )}
        </Card>
      </section>

      {/* ── prev / next ────────────────────────────────────── */}
      <nav className="flex items-center justify-between gap-3 border-t border-line pt-4">
        {prev ? (
          <Link
            href={`/subjects/${slug}/unit-${prev.number}`}
            className="group flex min-w-0 items-center gap-2 focus-ring rounded p-1"
          >
            <ChevronLeft size={15} className="shrink-0 text-subtle" />
            <span className="min-w-0">
              <span className="block text-[length:var(--text-micro)] text-subtle">
                Unit {prev.number}
              </span>
              <span className="block truncate text-[12.5px] text-muted group-hover:text-fg">
                {prev.title}
              </span>
            </span>
          </Link>
        ) : (
          <Link
            href={`/subjects/${slug}`}
            className="flex items-center gap-2 rounded p-1 text-[12.5px] text-muted hover:text-fg focus-ring"
          >
            <ArrowLeft size={14} /> Back to {subject.short_name}
          </Link>
        )}
        {next ? (
          <Link
            href={`/subjects/${slug}/unit-${next.number}`}
            className={cn("group flex min-w-0 items-center gap-2 rounded p-1 text-right focus-ring")}
          >
            <span className="min-w-0">
              <span className="block text-[length:var(--text-micro)] text-subtle">
                Unit {next.number}
              </span>
              <span className="block truncate text-[12.5px] text-muted group-hover:text-fg">
                {next.title}
              </span>
            </span>
            <ChevronRight size={15} className="shrink-0 text-subtle" />
          </Link>
        ) : null}
      </nav>
    </div>
  );
}
