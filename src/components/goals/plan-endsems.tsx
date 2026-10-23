"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { planEndsems } from "@/lib/actions";
import { Button } from "@/components/ui";

/** The fast path for a new account: one goal per end-sem paper, in one tap. */
export function PlanEndsems({ papers }: { papers: number }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <Button
      variant="primary"
      disabled={pending}
      onClick={() =>
        start(async () => {
          try {
            const { created } = await planEndsems();
            toast.success(
              created
                ? `Planned ${created} end-sem paper${created === 1 ? "" : "s"} — today's share is on Today.`
                : "Every paper already has a goal.",
            );
            router.refresh();
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Couldn't plan the end-sems");
          }
        })
      }
    >
      {pending ? <Loader2 size={15} className="animate-spin" /> : <CalendarCheck size={15} />}
      Plan all {papers} end-sems
    </Button>
  );
}
