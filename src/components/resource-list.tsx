"use client";

import { useTransition } from "react";
import {
  BookOpen,
  ExternalLink,
  FileText,
  ListVideo,
  PlayCircle,
  Trash2,
  Wrench,
  Dumbbell,
  FileType,
} from "lucide-react";
import { toast } from "sonner";
import { deleteResource } from "@/lib/actions";
import type { Resource, Subject } from "@/lib/db-types";
import { ACCENT_CLASS, cn, fmtDuration } from "@/lib/utils";
import { Badge } from "@/components/ui";

const ICON = {
  video: PlayCircle,
  playlist: ListVideo,
  article: FileText,
  practice: Dumbbell,
  pdf: FileType,
  book: BookOpen,
  tool: Wrench,
} as const;

export function ResourceList({
  resources,
  subjects,
  showSubject = false,
}: {
  resources: Resource[];
  subjects: Subject[];
  showSubject?: boolean;
}) {
  if (!resources.length) {
    return (
      <p className="px-4 py-8 text-center text-[12.5px] text-muted">
        Nothing here yet. Use Add to save a link.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-[var(--border)]">
      {[...resources]
        .sort((a, b) => a.rank - b.rank)
        .map((r) => {
          const subject = subjects.find((s) => s.id === r.subject_id) ?? null;
          return (
            <ResourceRow
              key={r.id}
              r={r}
              subject={subject}
              showSubject={showSubject}
            />
          );
        })}
    </ul>
  );
}

function ResourceRow({
  r,
  subject,
  showSubject,
}: {
  r: Resource;
  subject: Subject | null;
  showSubject: boolean;
}) {
  const [pending, start] = useTransition();
  const Icon = ICON[r.kind] ?? FileText;

  return (
    <li
      className={cn(
        "group px-4 py-3",
        subject ? ACCENT_CLASS[subject.color] : "",
        pending && "opacity-50",
      )}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 shrink-0 text-sc">
          <Icon size={16} strokeWidth={1.9} />
        </span>

        <div className="min-w-0 flex-1">
          <a
            href={r.url}
            target="_blank"
            rel="noreferrer noopener"
            className="text-[13px] font-medium leading-snug hover:text-sc transition-colors inline-flex items-start gap-1.5 focus-ring rounded"
          >
            {r.title}
            <ExternalLink size={11} className="mt-1 shrink-0 text-subtle" />
          </a>

          {r.why ? (
            <p className="text-[12.5px] text-muted mt-1 leading-relaxed">{r.why}</p>
          ) : null}

          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
            {r.rank <= 2 && r.is_curated ? <Badge tone="good">start here</Badge> : null}
            {showSubject && subject ? <Badge tone="subject">{subject.short_name}</Badge> : null}
            {r.source ? <span className="text-[11px] text-subtle">{r.source}</span> : null}
            <Badge tone="neutral">{r.kind}</Badge>
            {r.minutes ? (
              <span className="text-[11px] text-subtle">{fmtDuration(r.minutes)}</span>
            ) : null}
            {!r.is_curated ? (
              <button
                onClick={() =>
                  start(async () => {
                    await deleteResource(r.id);
                    toast.success("Removed");
                  })
                }
                aria-label="Remove resource"
                className="ml-auto opacity-0 group-hover:opacity-100 focus:opacity-100 text-subtle hover:text-[var(--bad)] transition-opacity focus-ring rounded"
              >
                <Trash2 size={13} />
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </li>
  );
}
