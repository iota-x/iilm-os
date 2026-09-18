"use client";

import { useOptimistic, useTransition } from "react";
import Link from "next/link";
import { Circle, CircleDashed, CircleDot, CheckCircle2, Link2, StickyNote } from "lucide-react";
import { setTopicStatus } from "@/lib/actions";
import type { Topic } from "@/lib/db-types";
import { cn, nextStatus, STATUS_LABEL } from "@/lib/utils";
import { Badge } from "@/components/ui";

const ICON = {
  not_started: CircleDashed,
  learning: CircleDot,
  revising: Circle,
  mastered: CheckCircle2,
} as const;

export function TopicRow({
  topic,
  noteCount = 0,
  resourceCount = 0,
  subjectSlug,
  unitNumber,
}: {
  topic: Topic;
  noteCount?: number;
  resourceCount?: number;
  subjectSlug: string;
  /** When known, the title and the count chips open the topic's own page. */
  unitNumber?: number;
}) {
  const [, start] = useTransition();
  // show the next status straight away; the write follows
  const [status, setStatusOptimistic] = useOptimistic(topic.status);
  const Icon = ICON[status];
  const topicHref =
    unitNumber !== undefined
      ? `/subjects/${subjectSlug}/unit-${unitNumber}/${topic.code}`
      : null;

  return (
    <li
      id={`topic-${topic.code}`}
      className={cn(
        "group px-4 py-2.5 hover:bg-surface-2/60 transition-colors",
        // room for the sticky header when linked to directly, plus a flash
        // so you can see which row the link meant
        "scroll-mt-24 target:bg-[var(--accent-soft)]",
      )}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={() =>
            start(async () => {
              const next = nextStatus(status);
              setStatusOptimistic(next as typeof status);
              await setTopicStatus(topic.id, next);
            })
          }
          title={`${STATUS_LABEL[status]} — click to advance`}
          aria-label={`Status: ${STATUS_LABEL[status]}`}
          className={cn(
            "mt-0.5 shrink-0 transition-colors focus-ring rounded-full",
            status === "not_started" && "text-subtle hover:text-sc",
            status === "learning" && "text-[var(--warn)]",
            status === "revising" && "text-sc",
            status === "mastered" && "text-[var(--good)]",
          )}
        >
          <Icon size={17} strokeWidth={2} />
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            {topicHref ? (
              <Link
                href={topicHref}
                className={cn(
                  "text-[13px] leading-snug hover:underline focus-ring rounded",
                  status === "mastered" && "text-muted",
                )}
              >
                {topic.title}
              </Link>
            ) : (
              <p
                className={cn(
                  "text-[13px] leading-snug",
                  status === "mastered" && "text-muted",
                )}
              >
                {topic.title}
              </p>
            )}
            <div className="flex items-center gap-1 shrink-0">
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "h-1 w-1 rounded-full",
                    i < topic.weight ? "bg-sc" : "bg-surface-3",
                  )}
                  aria-hidden
                />
              ))}
            </div>
          </div>

          {topic.outcome ? (
            <p className="text-[12px] text-muted mt-1 leading-relaxed">{topic.outcome}</p>
          ) : null}

          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
            {topic.session ? (
              <span className="text-[11px] text-subtle font-mono">{topic.session}</span>
            ) : null}
            {topic.in_midsem ? <Badge tone="accent">mid-sem</Badge> : null}
            <span className="text-[11px] text-subtle">{STATUS_LABEL[status]}</span>
            {noteCount ? (
              <Link
                href={topicHref ?? `/notes`}
                className="text-[11px] text-subtle hover:text-sc inline-flex items-center gap-0.5 focus-ring rounded"
              >
                <StickyNote size={10} /> {noteCount}
              </Link>
            ) : null}
            {resourceCount ? (
              <Link
                href={topicHref ?? `/resources?subject=${subjectSlug}`}
                className="text-[11px] text-subtle hover:text-sc inline-flex items-center gap-0.5 focus-ring rounded"
              >
                <Link2 size={10} /> {resourceCount}
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </li>
  );
}
