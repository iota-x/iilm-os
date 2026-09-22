import Link from "next/link";
import { PracticeDeck, type DeckItem } from "@/components/practice-deck";
import { getAttempts, getQuestions, getSubjects, getTopics, getUnits } from "@/lib/queries";
import { accuracyOf, drillScore, statsFor } from "@/lib/questions";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PracticePage({
  searchParams,
}: {
  searchParams: Promise<{ subject?: string; scope?: string; topics?: string }>;
}) {
  const { subject: subjectSlug, scope, topics: topicsParam } = await searchParams;
  // a goal's week review links here with the week's topic codes
  const onlyCodes = new Set((topicsParam ?? "").split(",").map((c) => c.trim()).filter(Boolean));

  const [subjects, topics, units, allQuestions] = await Promise.all([
    getSubjects(),
    getTopics(),
    getUnits(),
    getQuestions(),
  ]);
  const attempts = await getAttempts(allQuestions.map((q) => q.id));

  const active = subjects.find((s) => s.slug === subjectSlug) ?? null;
  const topicById = new Map(topics.map((t) => [t.id, t]));
  const unitById = new Map(units.map((u) => [u.id, u]));
  const subjectById = new Map(subjects.map((s) => [s.id, s]));

  const midsemOnly = scope === "midsem";

  const onlyIds = new Set(topics.filter((t) => onlyCodes.has(t.code)).map((t) => t.id));
  const pool = allQuestions.filter((q) => {
    if (active && q.subject_id !== active.id) return false;
    if (onlyCodes.size && !(q.topic_id && onlyIds.has(q.topic_id))) return false;
    if (midsemOnly) {
      const t = q.topic_id ? topicById.get(q.topic_id) : null;
      if (!t?.in_midsem) return false;
    }
    return true;
  });

  const items: DeckItem[] = pool
    .map((question) => {
      const stats = statsFor(question, attempts);
      const topic = question.topic_id ? topicById.get(question.topic_id) : null;
      const s = question.subject_id ? subjectById.get(question.subject_id) : null;
      const unit = topic ? unitById.get(topic.unit_id) : null;
      return {
        question,
        stats,
        topicTitle: topic?.title ?? null,
        topicHref:
          topic && s && unit ? `/subjects/${s.slug}/unit-${unit.number}/${topic.code}` : null,
        subjectShort: s?.short_name ?? null,
        score: drillScore(stats, topic?.weight ?? 3),
      };
    })
    .filter((x) => x.score >= 0)
    .sort((a, b) => b.score - a.score)
    .map((x) => ({
      question: x.question,
      stats: x.stats,
      topicTitle: x.topicTitle,
      topicHref: x.topicHref,
      subjectShort: x.subjectShort,
    }));

  const accuracy = accuracyOf(pool, attempts);
  const settled = pool.length - items.length;

  return (
    <div className="mx-auto max-w-[720px] space-y-4">
      <div>
        <h1 className="text-[length:var(--text-page)]">Practice</h1>
        <p className="mt-1 text-[length:var(--text-small)] text-muted">
          {items.length
            ? `${items.length} question${items.length === 1 ? "" : "s"} queued, the ones you get wrong first.`
            : "Questions you add on a topic page show up here."}
          {accuracy !== null ? (
            <span className="text-subtle">
              {" "}
              · {accuracy}% correct so far
              {settled ? ` · ${settled} answered right twice running, parked` : ""}
            </span>
          ) : null}
        </p>
      </div>

      {/* filters */}
      <div className="flex flex-wrap gap-1.5">
        <Chip href="/practice" active={!subjectSlug && !scope}>
          Everything
        </Chip>
        <Chip
          href={`/practice?${new URLSearchParams({ ...(subjectSlug ? { subject: subjectSlug } : {}), scope: "midsem" })}`}
          active={midsemOnly}
        >
          Mid-sem only
        </Chip>
        {subjects.map((s) => (
          <Chip
            key={s.id}
            href={`/practice?${new URLSearchParams({ subject: s.slug, ...(midsemOnly ? { scope: "midsem" } : {}) })}`}
            active={subjectSlug === s.slug}
          >
            {s.short_name}
          </Chip>
        ))}
      </div>

      <PracticeDeck items={items} />
    </div>
  );
}

function Chip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex h-7 items-center rounded-lg border px-2.5 text-[length:var(--text-micro)] font-medium transition-colors focus-ring",
        active
          ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
          : "border-line bg-surface text-muted hover:text-fg",
      )}
    >
      {children}
    </Link>
  );
}
