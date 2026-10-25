"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui";

/**
 * A button for a bound server action. With `confirm`, the first click arms
 * it and the second runs it — no browser dialog.
 */
export function ActionButton({
  action,
  children,
  done,
  confirm,
  variant,
}: {
  action: () => Promise<unknown>;
  children: React.ReactNode;
  done?: string;
  confirm?: string;
  variant?: "primary" | "ghost" | "outline" | "subtle" | "danger";
}) {
  const router = useRouter();
  const [armed, setArmed] = useState(false);
  const [pending, start] = useTransition();
  return (
    <Button
      size="sm"
      variant={variant}
      disabled={pending}
      onClick={() => {
        if (confirm && !armed) {
          setArmed(true);
          setTimeout(() => setArmed(false), 4000);
          return;
        }
        start(async () => {
          try {
            await action();
            if (done) toast.success(done);
            router.refresh();
          } catch (e) {
            toast.error(e instanceof Error ? e.message : "That didn't work");
          } finally {
            setArmed(false);
          }
        });
      }}
    >
      {armed ? confirm : children}
    </Button>
  );
}
