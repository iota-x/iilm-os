"use client";

import { useTransition } from "react";
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
}: {
  topic: Topic;
  noteCount?: number;
  resourceCount?: number;
  subjectSlug: string;
}) {
  const [pending, start] = useTransition();
  const Icon = ICON[topic.status];

  return (
    <li
      id={`topic-${topic.code}`}
      className={cn(
        "group px-4 py-2.5 hover:bg-surface-2/60 transition-colors",
        // room for the sticky header when linked to directly, plus a flash
        // so you can see which row the link meant
        "scroll-mt-24 target:bg-[var(--accent-soft)]",
        pending && "opacity-50",
      )}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={() => start(async () => setTopicStatus(topic.id, nextStatus(topic.status)))}
          title={`${STATUS_LABEL[topic.status]} — click to advance`}
          aria-label={`Status: ${STATUS_LABEL[topic.status]}`}
          className={cn(
            "mt-0.5 shrink-0 transition-colors focus-ring rounded-full",
            topic.status === "not_started" && "text-subtle hover:text-sc",
            topic.status === "learning" && "text-[var(--warn)]",
            topic.status === "revising" && "text-sc",
            topic.status === "mastered" && "text-[var(--good)]",
          )}
        >
          <Icon size={17} strokeWidth={2} />
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <p
              className={cn(
                "text-[13px] leading-snug",
                topic.status === "mastered" && "text-muted",
              )}
            >
              {topic.title}
            </p>
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
            <span className="text-[11px] text-subtle">{STATUS_LABEL[topic.status]}</span>
            {noteCount ? (
              <Link
                href={`/notes?open=`}
                className="text-[11px] text-subtle hover:text-sc inline-flex items-center gap-0.5 focus-ring rounded"
              >
                <StickyNote size={10} /> {noteCount}
              </Link>
            ) : null}
            {resourceCount ? (
              <Link
                href={`/resources?subject=${subjectSlug}`}
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
