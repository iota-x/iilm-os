"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { teacherPost } from "@/lib/staff-actions";
import { Button, Card, inputCls } from "@/components/ui";
import { cn } from "@/lib/utils";

const KINDS = [
  ["notice", "Notice", "Deadlines, changes, anything they must read — you'll see who has."],
  ["resource", "Resource", "Notes, a link, a reading — it goes on their board under your name, marked Teacher."],
  ["discussion", "Discussion", "Anything else."],
] as const;

/** Write once, pick the classes, and it lands on each of their boards. */
export function TeacherPostForm({ cohorts }: { cohorts: { id: string; label: string }[] }) {
  const router = useRouter();
  const [kind, setKind] = useState<string>("notice");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const [pending, start] = useTransition();
  const all = picked.length === cohorts.length;

  return (
    <Card className="p-4">
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          start(async () => {
            try {
              const n = await teacherPost({ title, body, kind, cohorts: picked });
              toast.success(`Posted to ${n} class${n === 1 ? "" : "es"}`);
              setTitle("");
              setBody("");
              router.refresh();
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "Couldn't post");
            }
          });
        }}
      >
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
        <p className="text-[length:var(--text-micro)] text-subtle">{KINDS.find(([k]) => k === kind)?.[2]}</p>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title — e.g. C lab file due Friday 5 pm" className={inputCls} required />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Details. Markdown and links work."
          rows={4}
          className={cn(inputCls, "h-auto resize-y py-2")}
        />
        <div>
          <div className="flex items-center justify-between">
            <p className="text-[length:var(--text-micro)] font-medium text-muted">Send to</p>
            <button
              type="button"
              onClick={() => setPicked(all ? [] : cohorts.map((c) => c.id))}
              className="rounded text-[length:var(--text-micro)] text-[var(--accent)] hover:underline focus-ring"
            >
              {all ? "Clear" : "All classes"}
            </button>
          </div>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {cohorts.map((c) => {
              const on = picked.includes(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setPicked(on ? picked.filter((x) => x !== c.id) : [...picked, c.id])}
                  className={cn(
                    "rounded-md border px-2 py-1 text-[length:var(--text-micro)] font-medium transition-colors focus-ring",
                    on ? "border-[var(--accent)] bg-[var(--accent-soft)] text-fg" : "border-line text-muted hover:text-fg",
                  )}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex justify-end">
          <Button type="submit" variant="primary" size="sm" disabled={pending || !title.trim() || !picked.length}>
            {pending ? <Loader2 size={14} className="animate-spin" /> : <Send size={13} />}
            Post to {picked.length || "…"} class{picked.length === 1 ? "" : "es"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
