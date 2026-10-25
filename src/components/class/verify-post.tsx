"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, BadgeX } from "lucide-react";
import { toast } from "sonner";
import { setPostVerified } from "@/lib/actions";
import { Button } from "@/components/ui";

/** Teachers (and the admin): put a tick on a post the class can trust. */
export function VerifyPost({ id, verified }: { id: string; verified: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <Button
      size="sm"
      disabled={pending}
      onClick={() =>
        start(async () => {
          try {
            await setPostVerified(id, !verified);
            toast.success(verified ? "Tick removed" : "Verified — it now shows your tick");
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
