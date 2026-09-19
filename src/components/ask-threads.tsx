"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { History, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteAskThread } from "@/lib/actions";
import type { AskThread } from "@/lib/db-types";
import { cn, relativeDay } from "@/lib/utils";

/**
 * Earlier conversations, one row. The current one is lit; "New" clears the
 * URL. Nothing here unless there's something to come back to.
 */
export function AskThreads({
  threads,
  currentId,
}: {
  threads: Pick<AskThread, "id" | "title" | "updated_at">[];
  currentId: string | null;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  if (!threads.length && !currentId) return null;

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]">
      <span className="inline-flex shrink-0 items-center gap-1 pr-1 text-[length:var(--text-micro)] text-subtle">
        <History size={12} />
      </span>
      <Link
        href="/ask"
        className={cn(
          "inline-flex h-7 shrink-0 items-center gap-1 rounded-full border px-2.5 text-[length:var(--text-micro)] font-medium transition-colors focus-ring",
          currentId ? "border-line text-muted hover:text-fg" : "border-[var(--accent)] bg-surface-2 text-fg",
        )}
      >
        <Plus size={12} /> New
      </Link>
      {threads.map((t) => {
        const on = t.id === currentId;
        return (
          <span key={t.id} className="inline-flex shrink-0 items-center">
            <Link
              href={`/ask?t=${t.id}`}
              title={t.title}
              className={cn(
                "inline-flex h-7 max-w-[220px] items-center gap-1.5 rounded-full border px-2.5 text-[length:var(--text-micro)] transition-colors focus-ring",
                on ? "border-[var(--accent)] bg-surface-2 text-fg rounded-r-none" : "border-line text-muted hover:text-fg",
              )}
            >
              <span className="truncate">{t.title}</span>
              <span className="shrink-0 text-subtle">{relativeDay(t.updated_at.slice(0, 10))}</span>
            </Link>
            {on ? (
              <button
                type="button"
                disabled={pending}
                aria-label="Delete conversation"
                onClick={() =>
                  start(async () => {
                    try {
                      await deleteAskThread(t.id);
                      router.push("/ask");
                    } catch (e) {
                      toast.error(e instanceof Error ? e.message : "Couldn't delete");
                    }
                  })
                }
                className="grid h-7 w-7 place-items-center rounded-r-full border border-l-0 border-[var(--accent)] bg-surface-2 text-subtle hover:text-[var(--bad)] focus-ring"
              >
                <Trash2 size={12} />
              </button>
            ) : null}
          </span>
        );
      })}
    </div>
  );
}
