"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pin, PinOff } from "lucide-react";
import { toast } from "sonner";
import { setPostPinned } from "@/lib/actions";
import { Button } from "@/components/ui";

export function PinPost({ id, pinned }: { id: string; pinned: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <Button
      size="sm"
      disabled={pending}
      onClick={() =>
        start(async () => {
          try {
            await setPostPinned(id, !pinned);
            toast.success(pinned ? "Unpinned" : "Pinned to the top");
            router.refresh();
          } catch (e) {
            toast.error(e instanceof Error ? e.message : "Couldn't do that");
          }
        })
      }
    >
      {pinned ? <PinOff size={13} /> : <Pin size={13} />}
      {pinned ? "Unpin" : "Pin"}
    </Button>
  );
}
