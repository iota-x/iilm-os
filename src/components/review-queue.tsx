"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Loader2, SkipForward } from "lucide-react";
import { toast } from "sonner";
import { markReviewed } from "@/lib/actions";
import type { Topic } from "@/lib/db-types";
import { reviewLabel, type ReviewState } from "@/lib/review";
import { Badge, Card } from "@/components/ui";
import { cn } from "@/lib/utils";

export interface QueueItem {
  topic: Topic;
  review: ReviewState;
  subjectSlug: string;
  subjectShort: string;
  unitNumber: number | null;
}

const SCALE: { value: number; label: string; hint: string }[] = [
  { value: 1, label: "Blank", hint: "tomorrow" },
  { value: 2, label: "Shaky", hint: "2 days" },
  { value: 3, label: "Getting there", hint: "4 days" },
  { value: 4, label: "Good", hint: "9 days" },
  { value: 5, label: "Solid", hint: "3 weeks" },
];

export function ReviewQueue({ items }: { items: QueueItem[] }) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [reviewed, setReviewed] = useState(0);
  const [pending, start] = useTransition();

  const item = items[index];

  if (!item) {
    return (
      <Card className="p-8 text-center">
        <p className="text-[15px] font-medium">
          {reviewed > 0 ? "That's the queue cleared." : "Nothing due right now."}
        </p>
        <p className="mx-auto mt-1.5 max-w-sm text-[13px] leading-relaxed text-muted">
          {reviewed > 0
            ? `You reviewed ${reviewed} topic${reviewed === 1 ? "" : "s"}. Anything you rated Blank or Shaky comes back within a couple of days.`
            : "Topics reappear here once enough time has passed since you last studied them. Start something new from Subjects in the meantime."}
        </p>
        <div className="mt-4 flex justify-center gap-2">
          <Link
            href="/subjects"
            className="inline-flex h-8 items-center rounded-lg border border-line bg-surface-2 px-3 text-[13px] hover:bg-surface-3 focus-ring"
          >
            Subjects
          </Link>
          <Link
            href="/"
            className="inline-flex h-8 items-center rounded-lg border border-line bg-surface-2 px-3 text-[13px] hover:bg-surface-3 focus-ring"
          >
            Today
          </Link>
        </div>
      </Card>
    );
  }

  const { topic, review, subjectSlug, subjectShort, unitNumber } = item;
  const href =
    unitNumber !== null
      ? `/subjects/${subjectSlug}/unit-${unitNumber}/${topic.code}`
      : `/subjects/${subjectSlug}`;

  function rate(confidence: number) {
    start(async () => {
      try {
        await markReviewed(topic.id, confidence);
        setReviewed((n) => n + 1);
        setIndex((i) => i + 1);
        router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Couldn't save that");
      }
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-[12px] text-subtle">
        <span>
          {index + 1} of {items.length}
        </span>
        {reviewed > 0 ? <span>{reviewed} done this session</span> : null}
      </div>

      <div className="h-1 overflow-hidden rounded-full bg-surface-3">
        <div
          className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-300"
          style={{ width: `${(index / items.length) * 100}%` }}
        />
      </div>

      <Card className={cn("p-5", pending && "opacity-60")}>
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-subtle">
          <span>{subjectShort}</span>
          {unitNumber !== null ? <span>· Unit {unitNumber}</span> : null}
          {topic.in_midsem ? <Badge tone="accent">mid-sem</Badge> : null}
          <span
            className={cn(
              "ml-auto",
              review.bucket === "overdue" && "text-[var(--warn)]",
            )}
          >
            {reviewLabel(review)}
          </span>
        </div>

        <h2 className="mt-2 text-[19px] font-semibold leading-tight tracking-tight">
          {topic.title}
        </h2>

        {topic.outcome ? (
          <p className="mt-2 max-w-[70ch] text-[13px] leading-relaxed text-muted">
            {topic.outcome}
          </p>
        ) : null}

        <Link
          href={href}
          className="mt-3 inline-flex items-center gap-1 rounded text-[12.5px] text-[var(--accent)] hover:underline focus-ring"
        >
          Open the topic — notes, resources, breakdown <ArrowRight size={13} />
        </Link>

        <div className="mt-5 border-t border-line pt-4">
          <p className="text-[12px] font-medium text-muted">
            Without looking: how well do you know this?
          </p>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {SCALE.map((s) => (
              <button
                key={s.value}
                disabled={pending}
                onClick={() => rate(s.value)}
                className={cn(
                  "group flex min-w-[92px] flex-1 flex-col items-start rounded-lg border border-line bg-surface-2 px-2.5 py-2 text-left transition-colors hover:border-[var(--accent)] hover:bg-surface-3 focus-ring disabled:opacity-50",
                )}
              >
                <span className="text-[12.5px] font-medium">{s.label}</span>
                <span className="text-[10.5px] text-subtle">back in {s.hint}</span>
              </button>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-subtle">
            Answer honestly — the gap until it comes back is set by what you pick.
          </p>
        </div>
      </Card>

      <div className="flex justify-between">
        <button
          onClick={() => setIndex((i) => i + 1)}
          disabled={pending}
          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[12.5px] text-subtle hover:text-fg focus-ring disabled:opacity-50"
        >
          <SkipForward size={13} /> Skip for now
        </button>
        {pending ? (
          <span className="inline-flex items-center gap-1.5 text-[12.5px] text-subtle">
            <Loader2 size={13} className="animate-spin" /> saving
          </span>
        ) : reviewed > 0 ? (
          <span className="inline-flex items-center gap-1.5 text-[12.5px] text-[var(--good)]">
            <Check size={13} /> {reviewed} reviewed
          </span>
        ) : null}
      </div>
    </div>
  );
}

