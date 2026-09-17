import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight, ExternalLink, NotebookPen } from "lucide-react";
import { FindMore } from "@/components/subject/find-more";
import {
  AddResourceForm,
  NewNoteButton,
  TopicStatusControl,
} from "@/components/subject/topic-actions";
import { TopicChecklist } from "@/components/subject/topic-checklist";
import { Badge, Card, Empty, SectionTitle } from "@/components/ui";
import {
  getCheckpoints,
  getNotes,
  getResources,
  getSubjectBySlug,
  getTopics,
  getUnits,
} from "@/lib/queries";
import { cn, fmtDate } from "@/lib/utils";

function parseUnit(segment: string): number | null {
  const m = segment.match(/^unit-(\d+)$/);
  return m ? Number(m[1]) : null;
}

export default async function TopicPage({
  params,
}: {
  params: Promise<{ slug: string; unit: string; topic: string }>;
}) {
  const { slug, unit: unitSegment, topic: topicCode } = await params;
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

  const siblings = allTopics.filter((t) => t.unit_id === unit.id);
  const topic = siblings.find((t) => t.code === topicCode);
  if (!topic) notFound();

  const resources = allResources.filter((r) => r.topic_id === topic.id);
  const notes = allNotes.filter((n) => n.topic_id === topic.id);
  const checkpoints = await getCheckpoints([topic.id]);

  const i = siblings.findIndex((t) => t.id === topic.id);
  const prev = i > 0 ? siblings[i - 1] : null;
  const next = i < siblings.length - 1 ? siblings[i + 1] : null;

  return (
    <div className="space-y-5">
      {/* ── breadcrumb ─────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-1.5 text-[12px] text-subtle">
        <Link href="/subjects" className="rounded hover:text-fg focus-ring">
          Subjects
        </Link>
        <ChevronRight size={12} />
        <Link href={`/subjects/${slug}`} className="rounded hover:text-fg focus-ring">
          {subject.short_name}
        </Link>
        <ChevronRight size={12} />
        <Link href={`/subjects/${slug}/unit-${unit.number}`} className="rounded hover:text-fg focus-ring">
          Unit {unit.number}
        </Link>
        <ChevronRight size={12} />
        <span className="max-w-[46ch] truncate text-muted">{topic.title}</span>
      </div>

      {/* ── header ─────────────────────────────────────────── */}
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-[21px] font-semibold leading-tight tracking-tight">{topic.title}</h1>
          {topic.in_midsem ? <Badge tone="accent">mid-sem</Badge> : null}
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-2.5 text-[12px] text-subtle">
          {topic.session ? <span>{topic.session}</span> : null}
          <span className="flex items-center gap-1.5">
            <span className="font-mono text-[11px]">{topic.code}</span>
          </span>
          <span className="flex items-center gap-1">
            exam weight <span className="tabular-nums text-muted">{topic.weight}/5</span>
            <span className="flex gap-0.5" aria-hidden>
              {[1, 2, 3, 4, 5].map((n) => (
                <span
                  key={n}
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    topic.weight >= n ? "bg-[var(--accent)]" : "bg-surface-3",
                  )}
                />
              ))}
            </span>
          </span>
          {topic.last_studied_at ? (
            <span>last touched {fmtDate(topic.last_studied_at)}</span>
          ) : null}
        </div>
        {topic.outcome ? (
          <p className="mt-3 max-w-[78ch] rounded-[10px] border border-line bg-surface-2 px-3 py-2.5 text-[13px] leading-relaxed text-muted">
            <span className="font-medium text-fg">What you need to be able to do: </span>
            {topic.outcome}
          </p>
        ) : null}
      </div>

      {/* ── status ─────────────────────────────────────────── */}
      <Card className="p-4">
        <TopicStatusControl topic={topic} />
      </Card>

      {/* ── the steps inside this topic ────────────────────── */}
      <section>
        <SectionTitle>
          Breakdown
          {checkpoints.length ? (
            <span className="ml-1.5 tabular-nums text-subtle">
              {checkpoints.filter((c) => c.done).length}/{checkpoints.length}
            </span>
          ) : null}
        </SectionTitle>
        <Card className="mt-2 overflow-hidden">
          {checkpoints.length === 0 ? (
            <p className="px-3.5 pt-3 text-[12.5px] leading-relaxed text-muted">
              Break this topic into the things you actually have to be able to do, then tick them
              off. {topic.outcome ? "The line above is a good place to start." : null}
            </p>
          ) : null}
          <TopicChecklist topicId={topic.id} checkpoints={checkpoints} />
        </Card>
      </section>

      {/* ── resources ──────────────────────────────────────── */}
      <section>
        <SectionTitle>
          Resources
          {resources.length ? (
            <span className="ml-1.5 tabular-nums text-subtle">{resources.length}</span>
          ) : null}
        </SectionTitle>

        <Card className="mt-2 overflow-hidden">
          <div className="flex flex-wrap items-start gap-2 border-b border-line px-3.5 py-2.5">
            <FindMore seed={topic.title} subject={subject.name} />
            <AddResourceForm subjectId={subject.id} topicId={topic.id} />
          </div>
          {resources.length ? (
            <ul className="divide-y divide-line">
              {resources.map((r) => (
                <li key={r.id} className="p-3.5 transition-colors hover:bg-surface-2/60">
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start gap-2 rounded focus-ring"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[13px] font-medium group-hover:underline">
                          {r.title}
                        </span>
                        <Badge>{r.kind}</Badge>
                        {r.minutes ? (
                          <span className="text-[11px] text-subtle">{r.minutes} min</span>
                        ) : null}
                        {!r.is_curated ? <Badge tone="good">yours</Badge> : null}
                      </span>
                      {r.source ? (
                        <span className="mt-0.5 block text-[11px] text-subtle">{r.source}</span>
                      ) : null}
                      {r.why ? (
                        <span className="mt-1 block max-w-[86ch] text-[12px] leading-snug text-muted">
                          {r.why}
                        </span>
                      ) : null}
                    </span>
                    <ExternalLink size={13} className="mt-1 shrink-0 text-subtle" />
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <Empty
              icon={<ExternalLink size={20} />}
              title="Nothing saved for this topic yet"
              body="Use Find more to search, then Add resource to keep whatever's worth coming back to."
            />
          )}
        </Card>
      </section>

      {/* ── notes ──────────────────────────────────────────── */}
      <section>
        <SectionTitle
          right={
            <NewNoteButton
              subjectId={subject.id}
              unitId={unit.id}
              topicId={topic.id}
              topicTitle={topic.title}
            />
          }
        >
          Notes
          {notes.length ? (
            <span className="ml-1.5 tabular-nums text-subtle">{notes.length}</span>
          ) : null}
        </SectionTitle>

        <Card className="mt-2 overflow-hidden">
          {notes.length ? (
            <ul className="divide-y divide-line">
              {notes.map((n) => (
                <li key={n.id}>
                  <Link
                    href={`/notes?open=${n.id}`}
                    className="flex items-center gap-2 px-3.5 py-2.5 transition-colors hover:bg-surface-2/60 focus-ring"
                  >
                    <NotebookPen size={13} className="shrink-0 text-subtle" />
                    <span className="min-w-0 flex-1 truncate text-[13px]">{n.title}</span>
                    <span className="shrink-0 text-[11px] text-subtle">
                      {fmtDate(n.updated_at)}
                    </span>
                    <ChevronRight size={13} className="shrink-0 text-subtle" />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <Empty
              icon={<NotebookPen size={20} />}
              title="No notes on this topic"
              body="New note starts one already linked to this topic — paste screenshots straight in."
            />
          )}
        </Card>
      </section>

      {/* ── prev / next topic ──────────────────────────────── */}
      <nav className="flex items-center justify-between gap-3 border-t border-line pt-4">
        {prev ? (
          <Link
            href={`/subjects/${slug}/unit-${unit.number}/${prev.code}`}
            className="group flex min-w-0 items-center gap-2 rounded p-1 focus-ring"
          >
            <ChevronLeft size={15} className="shrink-0 text-subtle" />
            <span className="min-w-0">
              <span className="block text-[10px] uppercase tracking-wide text-subtle">
                Previous
              </span>
              <span className="block truncate text-[12.5px] text-muted group-hover:text-fg">
                {prev.title}
              </span>
            </span>
          </Link>
        ) : (
          <Link
            href={`/subjects/${slug}/unit-${unit.number}`}
            className="flex items-center gap-2 rounded p-1 text-[12.5px] text-muted hover:text-fg focus-ring"
          >
            <ChevronLeft size={14} /> Unit {unit.number}
          </Link>
        )}
        {next ? (
          <Link
            href={`/subjects/${slug}/unit-${unit.number}/${next.code}`}
            className="group flex min-w-0 items-center gap-2 rounded p-1 text-right focus-ring"
          >
            <span className="min-w-0">
              <span className="block text-[10px] uppercase tracking-wide text-subtle">Next</span>
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
