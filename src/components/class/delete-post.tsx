"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deletePost } from "@/lib/actions";
import { Button } from "@/components/ui";

export function DeletePost({ id }: { id: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <Button
      variant="danger"
      size="sm"
      disabled={pending}
      onClick={() =>
        start(async () => {
          try {
            await deletePost(id);
            router.push("/class");
          } catch (e) {
            toast.error(e instanceof Error ? e.message : "Couldn't delete");
          }
        })
      }
    >
      <Trash2 size={13} /> Delete post
    </Button>
  );
}
