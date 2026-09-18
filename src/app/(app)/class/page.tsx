import Link from "next/link";
import { MessageSquare, Pin } from "lucide-react";
import { getPosts, getSubjects } from "@/lib/queries";
import { NewPost } from "@/components/class/new-post";
import { Badge, Card, Empty } from "@/components/ui";
import { ACCENT_CLASS, cn, relativeDay } from "@/lib/utils";
import type { PostKind } from "@/lib/db-types";

export const dynamic = "force-dynamic";

const KIND_LABEL: Record<PostKind, string> = {
  discussion: "Discussion",
  question: "Question",
  resource: "Resource",
  notice: "Notice",
};
const KIND_TONE: Record<PostKind, "neutral" | "accent" | "good" | "warn"> = {
  discussion: "neutral",
  question: "accent",
  resource: "good",
  notice: "warn",
};

export default async function ClassPage({
  searchParams,
}: {
  searchParams: Promise<{ subject?: string }>;
}) {
  const { subject } = await searchParams;
  const [posts, subjects] = await Promise.all([getPosts(subject), getSubjects()]);
  const bySlug = new Map(subjects.map((s) => [s.slug, s]));

  return (
    <div className="mx-auto max-w-[820px] space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[length:var(--text-page)]">Class</h1>
          <p className="mt-1 text-[length:var(--text-small)] text-muted">
            Section E, all of it. Questions, links worth sharing, and anything a teacher said
            that the rest of the room should know.
          </p>
        </div>
        <NewPost subjects={subjects} defaultSubject={subject ?? ""} />
      </div>

      {/* subject filter */}
      <div className="flex flex-wrap gap-1.5">
        <FilterChip href="/class" active={!subject}>
          Everything
        </FilterChip>
        {subjects.map((s) => (
          <FilterChip
            key={s.id}
            href={`/class?subject=${s.slug}`}
            active={subject === s.slug}
            className={ACCENT_CLASS[s.color]}
          >
            {s.short_name}
          </FilterChip>
        ))}
      </div>

      {posts.length ? (
        <Card>
          <ul className="divide-y divide-[var(--border)]">
            {posts.map((p) => {
              const s = p.subject_slug ? bySlug.get(p.subject_slug) : null;
              return (
                <li key={p.id} className={cn(s ? ACCENT_CLASS[s.color] : "")}>
                  <Link
                    href={`/class/${p.id}`}
                    className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-surface-2 focus-ring"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-center gap-2">
                        {p.pinned ? <Pin size={12} className="text-[var(--accent)]" /> : null}
                        <span className="font-serif text-[length:var(--text-body)] font-semibold">
                          {p.title}
                        </span>
                        <Badge tone={KIND_TONE[p.kind]}>{KIND_LABEL[p.kind]}</Badge>
                        {s ? <Badge tone="subject">{s.short_name}</Badge> : null}
                      </p>
                      {p.body ? (
                        <p className="mt-0.5 line-clamp-2 text-[length:var(--text-small)] text-muted">
                          {p.body}
                        </p>
                      ) : null}
                      <p className="mt-1 text-[length:var(--text-micro)] text-subtle">
                        {p.author}
                        {"  "}
                        {relativeDay(p.created_at.slice(0, 10))}
                      </p>
                    </div>
                    <span className="flex shrink-0 items-center gap-1 pt-1 text-[length:var(--text-micro)] tabular-nums text-subtle">
                      <MessageSquare size={13} /> {p.reply_count}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>
      ) : (
        <Card>
          <Empty
            icon={<MessageSquare size={26} strokeWidth={1.5} />}
            title={subject ? "Nothing on this subject yet" : "Nothing posted yet"}
            body="Ask the thing you didn't want to ask in class. Someone else didn't either."
          />
        </Card>
      )}
    </div>
  );
}

function FilterChip({
  href,
  active,
  className,
  children,
}: {
  href: string;
  active: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-md px-2 py-1 text-[length:var(--text-micro)] font-medium transition-colors focus-ring",
        active ? "bg-sc-soft text-sc" : "text-muted hover:bg-surface-2 hover:text-fg",
        className,
      )}
    >
      {children}
    </Link>
  );
}
