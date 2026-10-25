"use client";

import { useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ThumbsUp } from "lucide-react";
import { toast } from "sonner";
import { togglePaperVote } from "@/lib/actions";
import { cn } from "@/lib/utils";

/** Helpful on a past paper — same look as the board's. */
export function PaperVote({ id, count, mine }: { id: string; count: number; mine: boolean }) {
  const router = useRouter();
  const [state, setState] = useOptimistic({ count, mine });
  const [, start] = useTransition();
  return (
    <button
      type="button"
      onClick={() =>
        start(async () => {
          setState({ count: state.count + (state.mine ? -1 : 1), mine: !state.mine });
          try {
            await togglePaperVote(id);
            router.refresh();
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Couldn't save that");
          }
        })
      }
      aria-pressed={state.mine}
      title={state.mine ? "You marked this helpful" : "Mark as helpful"}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[length:var(--text-micro)] tabular-nums transition-colors focus-ring",
        state.mine
          ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
          : "border-line bg-surface text-muted hover:text-fg",
      )}
    >
      <ThumbsUp size={12} />
      {state.count > 0 ? state.count : "Helpful"}
    </button>
  );
}
