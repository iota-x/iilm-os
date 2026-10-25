"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarCheck, CalendarPlus } from "lucide-react";
import { toast } from "sonner";
import { addPostToPlanner } from "@/lib/actions";
import { Button } from "@/components/ui";

/** A deadline a classmate posted on the board, onto my own Planner. */
export function AddToPlanner({ id, added }: { id: string; added: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  if (added) {
    return (
      <span className="inline-flex items-center gap-1 text-[length:var(--text-micro)] text-[var(--good)]">
        <CalendarCheck size={13} /> On your Planner
      </span>
    );
  }
  return (
    <Button
      size="sm"
      disabled={pending}
      onClick={() =>
        start(async () => {
          try {
            const { error } = await addPostToPlanner(id);
            if (error) toast.error(error);
            else toast.success("Added to your Planner");
            router.refresh();
          } catch (e) {
            toast.error(e instanceof Error ? e.message : "Couldn't add it");
          }
        })
      }
    >
      <CalendarPlus size={13} /> Add to my Planner
    </Button>
  );
}
