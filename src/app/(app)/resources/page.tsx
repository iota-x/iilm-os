import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getResources, getSubjects, getTopics, getUnits } from "@/lib/queries";
import { ResourceList } from "@/components/resource-list";
import { QuickAdd } from "@/components/quick-add";
import { FindMore } from "@/components/subject/find-more";
import { Card, CardHead, Empty } from "@/components/ui";
import type { Resource, Topic, Unit } from "@/lib/db-types";
import { ACCENT_CLASS, cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

/**
 * Within a subject, resources are split by the unit they belong to — directly,
 * or through the topic they name. Whatever covers the subject as a whole goes
 * last, so the specific stuff is what you see first.
 */
function groupBySubject(
  resources: Resource[],
  units: Unit[],
  topics: Topic[],
  subjectId: string,
) {
  const mine = resources.filter((r) => r.subject_id === subjectId);
  const subjectUnits = units
    .filter((u) => u.subject_id === subjectId)
    .sort((a, b) => a.number - b.number);

  const unitOf = (r: Resource): string | null => {
    if (r.unit_id) return r.unit_id;
    if (r.topic_id) return topics.find((t) => t.id === r.topic_id)?.unit_id ?? null;
    return null;
  };

  const groups: { key: string; label: string; href?: string; items: Resource[] }[] = [];

  for (const u of subjectUnits) {
    const items = mine.filter((r) => unitOf(r) === u.id);
    if (items.length) {
      groups.push({
        key: u.id,
        label: `Unit ${u.number} — ${u.title}`,
        items,
      });
    }
  }

  const wide = mine.filter((r) => unitOf(r) === null);
  if (wide.length) {
    groups.push({ key: "wide", label: "Whole subject", items: wide });
  }

  return { total: mine.length, groups };
}

export default async function ResourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ subject?: string; kind?: string }>;
}) {
  const { subject: subjectSlug, kind } = await searchParams;
  const [allResources, subjects, units, topics] = await Promise.all([
    getResources(),
    getSubjects(),
    getUnits(),
    getTopics(),
  ]);

  const active = subjects.find((s) => s.slug === subjectSlug) ?? null;

  // the kind filter narrows what's grouped; the subject filter narrows which
  // subjects get a section at all
  const filtered = allResources.filter((r) => (kind ? r.kind === kind : true));
  const shown = active ? subjects.filter((s) => s.id === active.id) : subjects;
  const kinds = Array.from(new Set(allResources.map((r) => r.kind))).sort();

  const sections = shown
    .map((s) => ({ subject: s, ...groupBySubject(filtered, units, topics, s.id) }))
    .filter((sec) => sec.total > 0);

  const orphans = filtered.filter((r) => !r.subject_id);
  const totalShown = sections.reduce((n, s) => n + s.total, 0) + orphans.length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-semibold tracking-tight">Resources</h1>
          <p className="mt-0.5 text-[13px] text-muted">
            {allResources.filter((r) => r.is_curated).length} curated, ranked best first ·{" "}
            {allResources.filter((r) => !r.is_curated).length} saved by you
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <QuickAdd subjects={subjects} defaultSubjectId={active?.id} />
          <FindMore subject={active?.name ?? "B.Tech first semester"} />
        </div>
      </div>

      {/* filters */}
      <div className="flex flex-wrap gap-1.5">
        <Chip href="/resources" active={!subjectSlug && !kind}>
          All
        </Chip>
        {subjects.map((s) => (
          <Chip
            key={s.id}
            href={`/resources?subject=${s.slug}`}
            active={subjectSlug === s.slug}
            className={ACCENT_CLASS[s.color]}
            subject
          >
            {s.short_name}
          </Chip>
        ))}
        <span className="w-full" />
        {kinds.map((k) => (
          <Chip
            key={k}
            href={`/resources?${new URLSearchParams({ ...(subjectSlug ? { subject: subjectSlug } : {}), kind: k })}`}
            active={kind === k}
          >
            {k}
          </Chip>
        ))}
      </div>

      {totalShown === 0 ? (
        <Card>
          <Empty
            title="Nothing matches those filters"
            body="Clear them, or use Add to save a link of your own."
          />
        </Card>
      ) : null}

      {/* one section per subject */}
      {sections.map(({ subject, groups, total }) => (
        <Card key={subject.id} className={ACCENT_CLASS[subject.color]}>
          <CardHead
            title={
              <Link
                href={`/subjects/${subject.slug}`}
                className="inline-flex items-center gap-1.5 rounded hover:underline focus-ring"
              >
                <span
                  className="h-2 w-2 shrink-0 rounded-full bg-sc"
                  aria-hidden
                />
                {subject.name}
              </Link>
            }
            sub={`${total} link${total === 1 ? "" : "s"}`}
            right={
              <Link
                href={`/subjects/${subject.slug}?tab=resources`}
                className="inline-flex items-center gap-0.5 rounded text-[12px] text-muted hover:text-fg focus-ring"
              >
                Open <ChevronRight size={13} />
              </Link>
            }
          />

          {groups.map((g, i) => (
            <div key={g.key}>
              <div
                className={cn(
                  "flex items-center gap-2 border-b border-line bg-surface-2/40 px-4 py-1.5",
                  i > 0 && "border-t",
                )}
              >
                <span className="text-[10px] font-semibold uppercase tracking-wider text-subtle">
                  {g.label}
                </span>
                <span className="text-[10px] tabular-nums text-subtle">{g.items.length}</span>
              </div>
              <ResourceList resources={g.items} subjects={subjects} />
            </div>
          ))}
        </Card>
      ))}

      {/* anything with no subject at all — shouldn't happen, but don't hide it */}
      {orphans.length ? (
        <Card>
          <CardHead
            title="Not filed under a subject"
            sub={`${orphans.length} link${orphans.length === 1 ? "" : "s"}`}
          />
          <ResourceList resources={orphans} subjects={subjects} showSubject />
        </Card>
      ) : null}

      <p className="max-w-2xl text-[12px] leading-relaxed text-muted">
        Every curated link here was opened and checked before it was added. Ranks 1 and 2 are
        marked &ldquo;start here&rdquo; — those are the ones worth your time first. Anything you
        save yourself sorts to the bottom until you re-rank it.
      </p>
    </div>
  );
}

function Chip({
  href,
  active,
  children,
  className,
  subject,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
  className?: string;
  subject?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex h-7 items-center rounded-lg border px-2.5 text-[12px] font-medium capitalize transition-colors focus-ring",
        className,
        active
          ? subject
            ? "border-sc bg-sc-soft text-sc"
            : "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
          : "border-line bg-surface text-muted hover:text-fg",
      )}
    >
      {children}
    </Link>
  );
}
