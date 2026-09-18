"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, Loader2, Minus, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { addQuestion, deleteQuestion, logAttempt } from "@/lib/actions";
import type { Attempt, Question } from "@/lib/db-types";
import { statsFor } from "@/lib/questions";
import { Badge, Button, inputCls } from "@/components/ui";
import { Markdown } from "@/components/markdown";
import { cn, fmtDate } from "@/lib/utils";

const KINDS = ["pyq", "practice", "quiz", "example", "viva"] as const;

export function TopicQuestions({
  subjectId,
  topicId,
  questions,
  attempts,
}: {
  subjectId: string;
  topicId: string;
  questions: Question[];
  attempts: Attempt[];
}) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const [prompt, setPrompt] = useState("");
  const [answer, setAnswer] = useState("");
  const [source, setSource] = useState("");
  const [marks, setMarks] = useState("");
  const [kind, setKind] = useState<string>("pyq");

  function run(fn: () => Promise<unknown>, onOk?: () => void) {
    start(async () => {
      try {
        await fn();
        onOk?.();
        router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "That didn't work");
      }
    });
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim()) {
      toast.error("The question needs some text");
      return;
    }
    run(
      () =>
        addQuestion({
          prompt,
          answer: answer || null,
          subject_id: subjectId,
          topic_id: topicId,
          source: source || null,
          marks: marks ? Number(marks) : null,
          kind,
        }),
      () => {
        setPrompt("");
        setAnswer("");
        setSource("");
        setMarks("");
        setAdding(false);
        toast.success("Question saved");
      },
    );
  }

  return (
    <div className={cn(pending && "opacity-70")}>
      <ul className="divide-y divide-line">
        {questions.map((q) => {
          const s = statsFor(q, attempts);
          const open = openId === q.id;
          return (
            <li key={q.id} className="group">
              <div className="flex items-start gap-2.5 px-3.5 py-2.5">
                <button
                  onClick={() => setOpenId(open ? null : q.id)}
                  className="mt-0.5 shrink-0 rounded text-subtle transition-transform focus-ring"
                  aria-label={open ? "Hide answer" : "Show answer"}
                  aria-expanded={open}
                >
                  <ChevronDown
                    size={14}
                    className={cn("transition-transform", open && "rotate-180")}
                  />
                </button>

                <div className="min-w-0 flex-1">
                  <div className="prose-note text-[length:var(--text-small)] leading-snug">
                    <Markdown>{q.prompt}</Markdown>
                  </div>

                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    <Badge>{q.kind}</Badge>
                    {q.marks ? (
                      <span className="text-[length:var(--text-micro)] text-subtle">{q.marks} marks</span>
                    ) : null}
                    {q.source ? (
                      <span className="text-[length:var(--text-micro)] text-subtle">{q.source}</span>
                    ) : null}

                    {s.fresh ? (
                      <span className="text-[length:var(--text-micro)] text-subtle">not tried</span>
                    ) : (
                      <span
                        className={cn(
                          "text-[length:var(--text-micro)]",
                          s.settled
                            ? "text-[var(--good)]"
                            : s.shaky
                              ? "text-[var(--bad)]"
                              : "text-muted",
                        )}
                      >
                        {s.correct}/{s.tries} right
                        {s.wrong ? ` · wrong ${s.wrong}×` : ""}
                      </span>
                    )}

                    {/* the run of attempts, newest on the right */}
                    {s.history.length ? (
                      <span className="flex gap-0.5" title="most recent last">
                        {[...s.history]
                          .reverse()
                          .slice(-6)
                          .map((o, i) => (
                            <span
                              key={i}
                              className={cn(
                                "h-1.5 w-1.5 rounded-full",
                                o === "correct" && "bg-[var(--good)]",
                                o === "partial" && "bg-[var(--warn)]",
                                o === "wrong" && "bg-[var(--bad)]",
                              )}
                            />
                          ))}
                      </span>
                    ) : null}
                  </div>

                  {open ? (
                    <div className="mt-2.5 rounded-lg border border-line bg-surface-2 px-3 py-2.5">
                      {q.answer ? (
                        <div className="prose-note text-[length:var(--text-small)]">
                          <Markdown>{q.answer}</Markdown>
                        </div>
                      ) : (
                        <p className="text-[length:var(--text-micro)] text-subtle">
                          No answer saved. Add one so future-you doesn&rsquo;t redo the work.
                        </p>
                      )}
                    </div>
                  ) : null}

                  {/* log an attempt */}
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span className="text-[length:var(--text-micro)] text-subtle">How did it go?</span>
                    <AttemptButton
                      tone="good"
                      icon={<Check size={11} />}
                      label="Got it"
                      onClick={() => run(() => logAttempt({ question_id: q.id, outcome: "correct" }))}
                    />
                    <AttemptButton
                      tone="warn"
                      icon={<Minus size={11} />}
                      label="Half"
                      onClick={() => run(() => logAttempt({ question_id: q.id, outcome: "partial" }))}
                    />
                    <AttemptButton
                      tone="bad"
                      icon={<X size={11} />}
                      label="Wrong"
                      onClick={() => run(() => logAttempt({ question_id: q.id, outcome: "wrong" }))}
                    />
                    <span className="ml-auto text-[length:var(--text-micro)] text-subtle">
                      {s.tries ? `last ${fmtDate(q.created_at)}` : ""}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => run(() => deleteQuestion(q.id))}
                  aria-label="Delete question"
                  className="shrink-0 rounded p-0.5 text-subtle opacity-0 transition-opacity hover:text-[var(--bad)] focus-ring group-hover:opacity-100"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="border-t border-line px-3.5 py-2.5">
        {adding ? (
          <form onSubmit={submit} className="space-y-2">
            <textarea
              autoFocus
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={2}
              placeholder="The question, as it would be asked"
              className={cn(inputCls, "resize-y text-[length:var(--text-small)]")}
            />
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={3}
              placeholder="The answer, or the key steps — markdown and $LaTeX$ work"
              className={cn(inputCls, "resize-y text-[length:var(--text-small)]")}
            />
            <div className="flex flex-wrap gap-2">
              <input
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="Where from? e.g. Mid-sem 2024"
                className={cn(inputCls, "h-7 flex-1 text-[length:var(--text-micro)]")}
              />
              <input
                value={marks}
                onChange={(e) => setMarks(e.target.value.replace(/\D/g, ""))}
                placeholder="Marks"
                inputMode="numeric"
                className={cn(inputCls, "h-7 w-[84px] text-[length:var(--text-micro)]")}
              />
            </div>
            <div className="flex flex-wrap items-center gap-1">
              {KINDS.map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setKind(k)}
                  className={cn(
                    "rounded-md px-2 py-1 text-[length:var(--text-micro)] transition-colors focus-ring",
                    kind === k ? "bg-surface-3 text-fg" : "text-subtle hover:text-fg",
                  )}
                >
                  {k}
                </button>
              ))}
              <div className="ml-auto flex gap-1.5">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setAdding(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={pending}>
                  {pending ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
                  Save
                </Button>
              </div>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-1.5 rounded text-[length:var(--text-micro)] text-subtle transition-colors hover:text-fg focus-ring"
          >
            <Plus size={13} /> Add a question
          </button>
        )}
      </div>
    </div>
  );
}

function AttemptButton({
  tone,
  icon,
  label,
  onClick,
}: {
  tone: "good" | "warn" | "bad";
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[length:var(--text-micro)] transition-colors focus-ring",
        tone === "good" &&
          "border-line text-subtle hover:border-[var(--good)] hover:text-[var(--good)]",
        tone === "warn" &&
          "border-line text-subtle hover:border-[var(--warn)] hover:text-[var(--warn)]",
        tone === "bad" &&
          "border-line text-subtle hover:border-[var(--bad)] hover:text-[var(--bad)]",
      )}
    >
      {icon}
      {label}
    </button>
  );
}
