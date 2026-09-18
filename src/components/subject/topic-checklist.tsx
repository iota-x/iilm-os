"use client";

import { useOptimistic, useState, useTransition } from "react";
import { Check, Loader2, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import {
  addCheckpoint,
  deleteCheckpoint,
  renameCheckpoint,
  setCheckpointDone,
} from "@/lib/actions";
import type { Checkpoint } from "@/lib/db-types";
import { Button, inputCls } from "@/components/ui";
import { cn } from "@/lib/utils";

export function TopicChecklist({
  topicId,
  checkpoints,
}: {
  topicId: string;
  checkpoints: Checkpoint[];
}) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [pending, start] = useTransition();

  // The tick lands immediately; the server catches up behind it. Without this
  // every checkbox waited on a round-trip plus a full layout revalidation.
  const [items, toggleOptimistic] = useOptimistic(
    checkpoints,
    (prev: Checkpoint[], id: string) =>
      prev.map((c) => (c.id === id ? { ...c, done: !c.done } : c)),
  );

  const done = items.filter((c) => c.done).length;
  const pct = items.length ? Math.round((done / items.length) * 100) : 0;

  function run(fn: () => Promise<void>, onOk?: () => void) {
    start(async () => {
      try {
        await fn();
        onOk?.();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "That didn't work");
      }
    });
  }

  return (
    <div>{/* no dimming: the optimistic tick is the feedback */}
      {/* progress */}
      {items.length ? (
        <div className="flex items-center gap-3 border-b border-line px-3.5 py-2.5">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-3">
            <div
              className="h-full rounded-full bg-[var(--good)] transition-[width] duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="shrink-0 text-[length:var(--text-micro)] tabular-nums text-muted">
            {done}/{items.length} done
          </span>
        </div>
      ) : null}

      {/* steps */}
      <ul className="divide-y divide-line">
        {items.map((c) => (
          <li key={c.id} className="group flex items-start gap-2.5 px-3.5 py-2">
            <button
              onClick={() =>
                start(async () => {
                  toggleOptimistic(c.id);
                  try {
                    await setCheckpointDone(c.id, !c.done);
                  } catch (e) {
                    toast.error(e instanceof Error ? e.message : "Couldn't save that");
                  }
                })
              }
              aria-label={c.done ? `Mark "${c.title}" not done` : `Mark "${c.title}" done`}
              className={cn(
                "mt-[1px] grid h-[18px] w-[18px] shrink-0 place-items-center rounded-[5px] border transition-colors focus-ring",
                c.done
                  ? "border-[var(--good)] bg-[var(--good)] text-white"
                  : "border-line hover:border-muted",
              )}
            >
              {c.done ? <Check size={12} strokeWidth={3} className="pop" /> : null}
            </button>

            {editingId === c.id ? (
              <form
                className="flex min-w-0 flex-1 items-center gap-1.5"
                onSubmit={(e) => {
                  e.preventDefault();
                  run(
                    () => renameCheckpoint(c.id, editDraft),
                    () => setEditingId(null),
                  );
                }}
              >
                <input
                  autoFocus
                  value={editDraft}
                  onChange={(e) => setEditDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") setEditingId(null);
                  }}
                  className={cn(inputCls, "h-7 text-[length:var(--text-small)]")}
                />
                <Button type="submit" size="icon" variant="ghost" aria-label="Save">
                  <Check size={14} />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => setEditingId(null)}
                  aria-label="Cancel"
                >
                  <X size={14} />
                </Button>
              </form>
            ) : (
              <>
                <button
                  onClick={() => {
                    setEditingId(c.id);
                    setEditDraft(c.title);
                  }}
                  className={cn(
                    "min-w-0 flex-1 rounded text-left text-[length:var(--text-small)] leading-snug transition-colors focus-ring",
                    c.done ? "text-subtle line-through" : "text-fg hover:text-muted",
                  )}
                  title="Click to rename"
                >
                  {c.title}
                </button>
                <button
                  onClick={() => run(() => deleteCheckpoint(c.id))}
                  aria-label={`Delete "${c.title}"`}
                  className="shrink-0 rounded p-0.5 text-subtle opacity-0 transition-opacity hover:text-[var(--bad)] focus-ring group-hover:opacity-100"
                >
                  <Trash2 size={13} />
                </button>
              </>
            )}
          </li>
        ))}
      </ul>

      {/* add */}
      <div className="border-t border-line px-3.5 py-2">
        {adding ? (
          <form
            className="flex items-center gap-1.5"
            onSubmit={(e) => {
              e.preventDefault();
              run(
                () => addCheckpoint({ topic_id: topicId, title: draft }),
                () => setDraft(""), // stay open so you can type the next one
              );
            }}
          >
            <input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setAdding(false);
                  setDraft("");
                }
              }}
              placeholder="e.g. One-sided limits"
              className={cn(inputCls, "h-7 text-[length:var(--text-small)]")}
            />
            <Button type="submit" size="sm" disabled={pending || !draft.trim()}>
              {pending ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
              Add
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={() => {
                setAdding(false);
                setDraft("");
              }}
              aria-label="Done adding"
            >
              <X size={14} />
            </Button>
          </form>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-1.5 rounded text-[length:var(--text-micro)] text-subtle transition-colors hover:text-fg focus-ring"
          >
            <Plus size={13} /> Add a step
          </button>
        )}
      </div>
    </div>
  );
}
