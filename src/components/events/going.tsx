"use client";

import { useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Plus } from "lucide-react";
import { toast } from "sonner";
import { toggleGoing } from "@/lib/actions";
import { cn } from "@/lib/utils";

/** "I'm going" — and it shows on your Today the evening before. */
export function Going({ id, count, mine }: { id: string; count: number; mine: boolean }) {
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
            const now = await toggleGoing(id);
            if (now) toast.success("You're going — it'll be on your Today the evening before");
            router.refresh();
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Couldn't save that");
          }
        })
      }
      aria-pressed={state.mine}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[length:var(--text-small)] font-medium tabular-nums transition-colors focus-ring",
        state.mine
          ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-fg)]"
          : "border-line bg-surface text-muted hover:text-fg",
      )}
    >
      {state.mine ? <Check size={13} /> : <Plus size={13} />}
      {state.mine ? "Going" : "I'm going"}
      <span className={cn("text-[length:var(--text-micro)]", state.mine ? "opacity-80" : "text-subtle")}>{state.count}</span>
    </button>
  );
}
