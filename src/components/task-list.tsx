"use client";

import { useOptimistic, useState, useTransition } from "react";
import Link from "next/link";
import { Check, Trash2, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { setTaskStatus, deleteTask } from "@/lib/actions";
import type { Task } from "@/lib/db-types";
import type { Subject } from "@/lib/db-types";
import { ACCENT_CLASS, cn, fmtDuration } from "@/lib/utils";
import { Badge } from "@/components/ui";

const KIND_LABEL: Record<string, string> = {
  learn: "Learn",
  drill: "Drill",
  revise: "Revise",
  admin: "Admin",
  lab: "Lab",
  mock: "Mock",
  custom: "Task",
};

const KIND_TONE: Record<string, "neutral" | "accent" | "good" | "warn" | "bad"> = {
  learn: "accent",
  drill: "warn",
  revise: "good",
  admin: "bad",
  lab: "neutral",
  mock: "bad",
  custom: "neutral",
};

export function TaskList({
  tasks,
  subjects,
  showDate = false,
  emptyText = "Nothing scheduled.",
}: {
  tasks: Task[];
  subjects: Subject[];
  showDate?: boolean;
  emptyText?: string;
}) {
  if (!tasks.length) {
    return <p className="px-4 py-6 text-[length:var(--text-small)] text-muted text-center">{emptyText}</p>;
  }
  return (
    <ul className="divide-y divide-[var(--border)]">
      {tasks.map((t) => (
        <TaskRow
          key={t.id}
          task={t}
          subject={subjects.find((s) => s.id === t.subject_id) ?? null}
          showDate={showDate}
        />
      ))}
    </ul>
  );
}

function TaskRow({
  task,
  subject,
  showDate,
}: {
  task: Task;
  subject: Subject | null;
  showDate: boolean;
}) {
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false);
  // tick now, persist behind it
  const [status, setStatusOptimistic] = useOptimistic(task.status);
  const done = status === "done";
  const details = (task.detail ?? "").split("\n").filter(Boolean);

  function toggle() {
    const next = done ? "todo" : "done";
    start(async () => {
      setStatusOptimistic(next as typeof status);
      await setTaskStatus(task.id, next);
    });
  }

  function remove() {
    start(async () => {
      await deleteTask(task.id);
      toast.success("Task removed");
    });
  }

  return (
    <li
      className={cn(
        "group px-4 py-2.5 transition-opacity",
        subject ? ACCENT_CLASS[subject.color] : "",
        pending && !open && "opacity-100",
      )}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={toggle}
          aria-label={done ? "Mark not done" : "Mark done"}
          className={cn(
            "mt-0.5 grid h-[18px] w-[18px] shrink-0 place-items-center rounded-[6px] border transition-colors focus-ring",
            done
              ? "bg-sc border-sc text-white"
              : "border-strong hover:border-sc bg-surface",
          )}
        >
          {done ? <Check size={12} strokeWidth={3} /> : null}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <button
              onClick={() => details.length && setOpen(!open)}
              className={cn(
                "text-left text-[length:var(--text-small)] leading-snug focus-ring rounded",
                done && "line-through text-subtle",
                details.length && "hover:text-sc",
              )}
            >
              {task.title}
              {details.length ? (
                <ChevronDown
                  size={13}
                  className={cn(
                    "inline ml-1 -mt-0.5 text-subtle transition-transform",
                    open && "rotate-180",
                  )}
                />
              ) : null}
            </button>
            {task.minutes ? (
              <span className="text-[length:var(--text-micro)] text-subtle tabular-nums shrink-0 mt-0.5">
                {fmtDuration(task.minutes)}
              </span>
            ) : null}
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            {subject ? (
              <Link href={`/subjects/${subject.slug}`}>
                <Badge tone="subject">{subject.short_name}</Badge>
              </Link>
            ) : null}
            <Badge tone={KIND_TONE[task.kind] ?? "neutral"}>{KIND_LABEL[task.kind]}</Badge>
            {showDate && task.due_date ? (
              <span className="text-[length:var(--text-micro)] text-subtle">{task.due_date}</span>
            ) : null}
            {task.source === "manual" ? (
              <button
                onClick={remove}
                aria-label="Delete task"
                className="ml-auto opacity-0 group-hover:opacity-100 focus:opacity-100 text-subtle hover:text-[var(--bad)] transition-opacity focus-ring rounded"
              >
                <Trash2 size={13} />
              </button>
            ) : null}
          </div>

          {open && details.length ? (
            <ul className="mt-2 space-y-1 animate-in">
              {details.map((d, i) => (
                <li key={i} className="text-[length:var(--text-small)] text-muted leading-relaxed flex gap-2">
                  <span className="text-subtle select-none">·</span>
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </li>
  );
}
