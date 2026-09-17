import Link from "next/link";
import { getResources, getSubjects } from "@/lib/queries";
import { ResourceList } from "@/components/resource-list";
import { QuickAdd } from "@/components/quick-add";
import { FindMore } from "@/components/subject/find-more";
import { Card, CardHead } from "@/components/ui";
import { ACCENT_CLASS, cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ResourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ subject?: string; kind?: string }>;
}) {
  const { subject: subjectSlug, kind } = await searchParams;
  const [allResources, subjects] = await Promise.all([getResources(), getSubjects()]);

  const active = subjects.find((s) => s.slug === subjectSlug) ?? null;

  const resources = allResources
    .filter((r) => (active ? r.subject_id === active.id : true))
    .filter((r) => (kind ? r.kind === kind : true));

  const kinds = Array.from(new Set(allResources.map((r) => r.kind))).sort();

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-semibold tracking-tight">Resources</h1>
          <p className="text-[13px] text-muted mt-0.5">
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

      <Card>
        <CardHead
          title={active ? active.name : "Everything"}
          sub={`${resources.length} link${resources.length === 1 ? "" : "s"}`}
        />
        <ResourceList resources={resources} subjects={subjects} showSubject={!active} />
      </Card>

      <p className="text-[12px] text-muted max-w-2xl leading-relaxed">
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
        "inline-flex items-center rounded-lg px-2.5 h-7 text-[12px] font-medium border transition-colors focus-ring capitalize",
        className,
        active
          ? subject
            ? "bg-sc-soft text-sc border-sc"
            : "bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent)]"
          : "bg-surface border-line text-muted hover:text-fg",
      )}
    >
      {children}
    </Link>
  );
}
