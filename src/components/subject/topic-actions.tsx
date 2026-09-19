"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Link2, Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { addResource, createNote, setTopicConfidence, setTopicStatus } from "@/lib/actions";
import type { Topic } from "@/lib/db-types";
import { Button, inputCls } from "@/components/ui";
import { cn, STATUS_LABEL, STATUS_ORDER } from "@/lib/utils";

const KINDS = ["article", "video", "playlist", "practice", "pdf", "book", "tool"] as const;

export function TopicStatusControl({ topic }: { topic: Topic }) {
  const [pending, start] = useTransition();

  return (
    <div className={cn("flex flex-wrap items-center gap-x-6 gap-y-3", pending && "opacity-60")}>
      <div>
        <span className="mb-1.5 block text-[length:var(--text-micro)] font-medium text-subtle">Where you are</span>
        <div className="inline-flex rounded-lg border border-line bg-surface-2 p-0.5">
          {STATUS_ORDER.map((s) => (
            <button
              key={s}
              onClick={() => start(() => setTopicStatus(topic.id, s).then(() => {}))}
              className={cn(
                "rounded-[7px] px-2.5 py-1 text-[length:var(--text-micro)] transition-colors focus-ring",
                topic.status === s
                  ? "bg-surface text-fg shadow-card"
                  : "text-subtle hover:text-fg",
              )}
            >
              {STATUS_LABEL[s]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <span className="mb-1.5 block text-[length:var(--text-micro)] font-medium text-subtle">Confidence</span>
        <div className="inline-flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => start(() => setTopicConfidence(topic.id, n).then(() => {}))}
              aria-label={`Confidence ${n} of 5`}
              className={cn(
                "h-6 w-6 rounded-md text-[length:var(--text-micro)] tabular-nums transition-colors focus-ring",
                topic.confidence >= n
                  ? "bg-[var(--accent)] text-[var(--accent-fg)]"
                  : "bg-surface-2 text-subtle hover:bg-surface-3",
              )}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <p className="basis-full text-[length:var(--text-micro)] leading-relaxed text-subtle">
        These two decide when this topic comes back in Review: once it&rsquo;s past &ldquo;not
        started&rdquo;, confidence 1 brings it back tomorrow, 3 in about four days, 5 in three
        weeks. Be honest — a 5 you don&rsquo;t mean hides it from you.
      </p>
    </div>
  );
}

export function NewNoteButton({
  subjectId,
  unitId,
  topicId,
  topicTitle,
}: {
  subjectId: string;
  unitId: string;
  topicId: string;
  topicTitle: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() =>
        start(async () => {
          try {
            const id = await createNote({
              title: topicTitle,
              subject_id: subjectId,
              unit_id: unitId,
              topic_id: topicId,
            });
            toast.success("Note created for this topic");
            router.push(`/notes?open=${id}`);
          } catch (e) {
            toast.error(e instanceof Error ? e.message : "Could not create the note");
          }
        })
      }
    >
      {pending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
      New note
    </Button>
  );
}

export function AddResourceForm({
  subjectId,
  topicId,
}: {
  subjectId: string;
  topicId: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [kind, setKind] = useState<string>("article");
  const [pending, start] = useTransition();

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Link2 size={14} /> Add resource
      </Button>
    );
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !url.trim()) {
      toast.error("Both a title and a URL, please");
      return;
    }
    start(async () => {
      try {
        await addResource({
          title: title.trim(),
          url: url.trim(),
          subject_id: subjectId,
          topic_id: topicId,
          kind,
        });
        toast.success("Saved to this topic");
        setTitle("");
        setUrl("");
        setOpen(false);
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Could not save it");
      }
    });
  }

  return (
    <form
      onSubmit={submit}
      className="w-full max-w-[480px] rounded-[14px] border border-line bg-surface p-3 shadow-pop"
    >
      <div className="flex items-center justify-between">
        <span className="text-[length:var(--text-micro)] font-medium">Save a link to this topic</span>
        <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Close">
          <X size={14} />
        </Button>
      </div>
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="What is it?"
        className={cn(inputCls, "mt-2")}
      />
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://…"
        className={cn(inputCls, "mt-2")}
      />
      <div className="mt-2 flex flex-wrap gap-1">
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
      </div>
      <div className="mt-3 flex justify-end">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
          Save
        </Button>
      </div>
    </form>
  );
}
