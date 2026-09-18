"use client";

import { useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ThumbsUp } from "lucide-react";
import { toast } from "sonner";
import { toggleHelpful } from "@/lib/actions";
import { cn } from "@/lib/utils";

/** "Helpful" toggle with a count. Flips immediately; the write follows. */
export function Helpful({
  target,
  id,
  count,
  mine,
  size = "sm",
}: {
  target: "post" | "reply";
  id: string;
  count: number;
  mine: boolean;
  size?: "sm" | "md";
}) {
  const router = useRouter();
  const [state, setState] = useOptimistic({ count, mine });
  const [, start] = useTransition();

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        start(async () => {
          setState({ count: state.count + (state.mine ? -1 : 1), mine: !state.mine });
          try {
            await toggleHelpful(target, id);
            router.refresh(); // so the real count replaces the optimistic one
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Couldn't save that");
          }
        });
      }}
      aria-pressed={state.mine}
      title={state.mine ? "You marked this helpful" : "Mark as helpful"}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border transition-colors focus-ring tabular-nums",
        size === "sm" ? "px-2 py-0.5 text-[length:var(--text-micro)]" : "px-2.5 py-1 text-[length:var(--text-small)]",
        state.mine
          ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
          : "border-line bg-surface text-muted hover:text-fg",
      )}
    >
      <ThumbsUp size={size === "sm" ? 12 : 14} />
      {state.count > 0 ? state.count : "Helpful"}
    </button>
  );
}
