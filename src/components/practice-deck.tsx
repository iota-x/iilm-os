"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Eye, Loader2, Minus, SkipForward, X } from "lucide-react";
import { toast } from "sonner";
import { logAttempt } from "@/lib/actions";
import type { Question } from "@/lib/db-types";
import type { QuestionStats } from "@/lib/questions";
import { Badge, Card } from "@/components/ui";
import { Markdown } from "@/components/markdown";
import { cn } from "@/lib/utils";

export interface DeckItem {
  question: Question;
  stats: QuestionStats;
  topicTitle: string | null;
  topicHref: string | null;
  subjectShort: string | null;
}

export function PracticeDeck({ items }: { items: DeckItem[] }) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [tally, setTally] = useState({ correct: 0, partial: 0, wrong: 0 });
  const [pending, start] = useTransition();

  const item = items[index];

  if (!item) {
    const total = tally.correct + tally.partial + tally.wrong;
    return (
      <Card className="p-8 text-center">
        <p className="text-[15px] font-medium">
          {total ? "Deck finished." : "No questions to drill yet."}
        </p>
        {total ? (
          <p className="mx-auto mt-1.5 max-w-sm text-[13px] leading-relaxed text-muted">
            {tally.correct} right · {tally.partial} half · {tally.wrong} wrong. Anything you got
            wrong comes back to the front of the deck next time.
          </p>
        ) : (
          <p className="mx-auto mt-1.5 max-w-sm text-[13px] leading-relaxed text-muted">
            Add questions from any topic page — past papers, tutorial sheets, whatever your
            teacher actually drills — and they show up here.
          </p>
        )}
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

  const { question, stats, topicTitle, topicHref, subjectShort } = item;

  function record(outcome: "correct" | "partial" | "wrong") {
    start(async () => {
      try {
        await logAttempt({ question_id: question.id, outcome });
        setTally((t) => ({ ...t, [outcome]: t[outcome] + 1 }));
        setRevealed(false);
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
        <span className="flex items-center gap-2.5">
          {tally.correct ? (
            <span className="text-[var(--good)]">{tally.correct} right</span>
          ) : null}
          {tally.partial ? <span className="text-[var(--warn)]">{tally.partial} half</span> : null}
          {tally.wrong ? <span className="text-[var(--bad)]">{tally.wrong} wrong</span> : null}
        </span>
      </div>

      <div className="h-1 overflow-hidden rounded-full bg-surface-3">
        <div
          className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-300"
          style={{ width: `${(index / items.length) * 100}%` }}
        />
      </div>

      <Card className={cn("p-5", pending && "opacity-60")}>
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-subtle">
          {subjectShort ? <span>{subjectShort}</span> : null}
          {topicTitle ? <span className="truncate">· {topicTitle}</span> : null}
          <Badge>{question.kind}</Badge>
          {question.marks ? <span>{question.marks} marks</span> : null}
          {question.source ? <span>· {question.source}</span> : null}
          {!stats.fresh ? (
            <span
              className={cn(
                "ml-auto",
                stats.shaky ? "text-[var(--bad)]" : "text-muted",
              )}
            >
              {stats.wrong ? `wrong ${stats.wrong}× before` : `${stats.correct}/${stats.tries} right`}
            </span>
          ) : (
            <span className="ml-auto">first go</span>
          )}
        </div>

        <p className="mt-3 text-[15px] leading-relaxed">{question.prompt}</p>

        {revealed ? (
          <div className="mt-4 rounded-lg border border-line bg-surface-2 px-3.5 py-3">
            {question.answer ? (
              <div className="prose-note text-[13px]">
                <Markdown>{question.answer}</Markdown>
              </div>
            ) : (
              <p className="text-[12.5px] text-subtle">
                No answer saved for this one — check your notes, then add it so next time it&rsquo;s
                here.
              </p>
            )}
            {topicHref ? (
              <Link
                href={topicHref}
                className="mt-2.5 inline-flex items-center gap-1 rounded text-[12px] text-[var(--accent)] hover:underline focus-ring"
              >
                Open the topic <ArrowRight size={12} />
              </Link>
            ) : null}
          </div>
        ) : null}

        <div className="mt-5 border-t border-line pt-4">
          {!revealed ? (
            <button
              onClick={() => setRevealed(true)}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-surface-2 px-3.5 text-[13px] font-medium transition-colors hover:bg-surface-3 focus-ring"
            >
              <Eye size={14} /> Show the answer
            </button>
          ) : (
            <>
              <p className="text-[12px] font-medium text-muted">Be honest — how did you do?</p>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                <Outcome
                  tone="good"
                  icon={<Check size={14} />}
                  label="Got it"
                  onClick={() => record("correct")}
                  disabled={pending}
                />
                <Outcome
                  tone="warn"
                  icon={<Minus size={14} />}
                  label="Half right"
                  onClick={() => record("partial")}
                  disabled={pending}
                />
                <Outcome
                  tone="bad"
                  icon={<X size={14} />}
                  label="Got it wrong"
                  onClick={() => record("wrong")}
                  disabled={pending}
                />
              </div>
            </>
          )}
        </div>
      </Card>

      <div className="flex justify-between">
        <button
          onClick={() => {
            setRevealed(false);
            setIndex((i) => i + 1);
          }}
          disabled={pending}
          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[12.5px] text-subtle hover:text-fg focus-ring disabled:opacity-50"
        >
          <SkipForward size={13} /> Skip
        </button>
        {pending ? (
          <span className="inline-flex items-center gap-1.5 text-[12.5px] text-subtle">
            <Loader2 size={13} className="animate-spin" /> saving
          </span>
        ) : null}
      </div>
    </div>
  );
}

function Outcome({
  tone,
  icon,
  label,
  onClick,
  disabled,
}: {
  tone: "good" | "warn" | "bad";
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex h-9 flex-1 min-w-[112px] items-center justify-center gap-1.5 rounded-lg border bg-surface-2 px-3 text-[13px] font-medium transition-colors focus-ring disabled:opacity-50",
        tone === "good" && "border-line hover:border-[var(--good)] hover:text-[var(--good)]",
        tone === "warn" && "border-line hover:border-[var(--warn)] hover:text-[var(--warn)]",
        tone === "bad" && "border-line hover:border-[var(--bad)] hover:text-[var(--bad)]",
      )}
    >
      {icon}
      {label}
    </button>
  );
}
