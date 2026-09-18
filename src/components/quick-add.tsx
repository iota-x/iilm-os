"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createTask, createNote, addResource } from "@/lib/actions";
import type { Subject } from "@/lib/db-types";
import { Button, inputCls } from "@/components/ui";
import { cn, istToday } from "@/lib/utils";

type Mode = "task" | "note" | "link";

export function QuickAdd({
  subjects,
  defaultSubjectId,
  defaultDate,
}: {
  subjects: Subject[];
  defaultSubjectId?: string;
  defaultDate?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("task");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [subjectId, setSubjectId] = useState(defaultSubjectId ?? "");
  const [date, setDate] = useState(defaultDate ?? istToday());
  const [minutes, setMinutes] = useState("");
  const [pending, start] = useTransition();

  function reset() {
    setTitle("");
    setUrl("");
    setMinutes("");
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    start(async () => {
      try {
        if (mode === "task") {
          await createTask({
            title: title.trim(),
            subject_id: subjectId || null,
            due_date: date || null,
            minutes: minutes ? Number(minutes) : null,
          });
          toast.success("Task added");
        } else if (mode === "note") {
          const id = await createNote({
            title: title.trim(),
            subject_id: subjectId || null,
          });
          toast.success("Note created");
          router.push(`/notes?open=${id}`);
        } else {
          if (!url.trim()) {
            toast.error("Paste a URL");
            return;
          }
          await addResource({
            title: title.trim(),
            url: url.trim(),
            subject_id: subjectId || null,
          });
          toast.success("Resource saved");
        }
        reset();
        setOpen(false);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Plus size={14} /> Add
      </Button>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="bg-surface border border-line rounded-[14px] p-3 shadow-pop w-full max-w-[520px] animate-in"
    >
      <div className="flex gap-0.5 mb-2.5 bg-surface-2 rounded-lg p-0.5 border border-line w-fit">
        {(["task", "note", "link"] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={cn(
              "px-2.5 h-6.5 py-1 rounded-[7px] text-[length:var(--text-micro)] font-medium capitalize transition-colors focus-ring",
              mode === m ? "bg-surface shadow-card" : "text-muted hover:text-fg",
            )}
          >
            {m}
          </button>
        ))}
      </div>

      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={
          mode === "task"
            ? "What needs doing?"
            : mode === "note"
              ? "Note title"
              : "What is this link?"
        }
        className={inputCls}
      />

      {mode === "link" ? (
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://…"
          type="url"
          className={`${inputCls} mt-2`}
        />
      ) : null}

      <div className="flex flex-wrap gap-2 mt-2">
        <select
          value={subjectId}
          onChange={(e) => setSubjectId(e.target.value)}
          className={`${inputCls} flex-1 min-w-[140px]`}
        >
          <option value="">No subject</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        {mode === "task" ? (
          <>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={`${inputCls} w-[140px]`}
            />
            <input
              type="number"
              min={5}
              step={5}
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              placeholder="mins"
              className={`${inputCls} w-[80px]`}
            />
          </>
        ) : null}
      </div>

      <div className="flex justify-end gap-2 mt-3">
        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" size="sm" disabled={pending}>
          {pending ? <Loader2 size={13} className="animate-spin" /> : null}
          Add
        </Button>
      </div>
    </form>
  );
}
