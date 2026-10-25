"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, BadgeX } from "lucide-react";
import { toast } from "sonner";
import { setPaperVerified } from "@/lib/actions";
import { Button } from "@/components/ui";

export function VerifyPaper({ id, verified }: { id: string; verified: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <Button
      size="sm"
      disabled={pending}
      onClick={() =>
        start(async () => {
          try {
            await setPaperVerified(id, !verified);
            toast.success(verified ? "Tick removed" : "Verified");
            router.refresh();
          } catch (e) {
            toast.error(e instanceof Error ? e.message : "Couldn't do that");
          }
        })
      }
    >
      {verified ? <BadgeX size={13} /> : <BadgeCheck size={13} />}
      {verified ? "Unverify" : "Verify"}
    </Button>
  );
}
