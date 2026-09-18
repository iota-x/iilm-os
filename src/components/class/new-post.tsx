"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { createPost } from "@/lib/actions";
import type { Subject } from "@/lib/db-types";
import { Button, Card, chipCls, inputCls } from "@/components/ui";
import { cn } from "@/lib/utils";

const KINDS = [
  ["discussion", "Discussion"],
  ["question", "Question"],
  ["resource", "Resource"],
  ["notice", "Notice"],
] as const;

export function NewPost({ subjects, defaultSubject }: { subjects: Subject[]; defaultSubject: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [url, setUrl] = useState("");
  const [kind, setKind] = useState<string>("discussion");
  const [subject, setSubject] = useState(defaultSubject);
  const [pending, start] = useTransition();

  if (!open) {
    return (
      <Button variant="primary" onClick={() => setOpen(true)}>
        <Plus size={14} /> New post
      </Button>
    );
  }

  return (
    <Card className="w-full p-4">
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          start(async () => {
            try {
              const id = await createPost({ title, body, url, kind, subject_slug: subject || null });
              setOpen(false);
              setTitle("");
              setBody("");
              setUrl("");
              router.push(`/class/${id}`);
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "Couldn't post");
            }
          });
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1">
            {KINDS.map(([k, label]) => (
              <button
                key={k}
                type="button"
                onClick={() => setKind(k)}
                className={cn(
                  "rounded-md px-2 py-1 text-[length:var(--text-micro)] font-medium transition-colors focus-ring",
                  kind === k ? "bg-surface-3 text-fg" : "text-muted hover:text-fg",
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Close">
            <X size={14} />
          </Button>
        </div>
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={kind === "question" ? "What's the question?" : "Title"}
          className={inputCls}
        />
        {kind === "resource" ? (
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" className={inputCls} />
        ) : null}
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Details, if any. Markdown works."
          rows={4}
          className={cn(inputCls, "h-auto resize-y py-2")}
        />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <select value={subject} onChange={(e) => setSubject(e.target.value)} className={chipCls}>
            <option value="">No subject</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.slug}>
                {s.short_name}
              </option>
            ))}
          </select>
          <Button type="submit" variant="primary" size="sm" disabled={pending || !title.trim()}>
            {pending ? <Loader2 size={14} className="animate-spin" /> : null}
            Post
          </Button>
        </div>
      </form>
    </Card>
  );
}
