"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { autoReplan } from "@/lib/actions";

/**
 * Runs the daily re-adjust once per device per day, from Today. The
 * server does the real once-a-day check; this just avoids a call on
 * every navigation.
 */
export function AutoReplan({ today }: { today: string }) {
  const router = useRouter();
  useEffect(() => {
    const key = "replan:ran";
    try {
      if (localStorage.getItem(key) === today) return;
    } catch {}
    let cancelled = false;
    autoReplan()
      .then((r) => {
        try {
          localStorage.setItem(key, today);
        } catch {}
        if (cancelled) return;
        if (r.replanned) {
          toast.message(r.replanned === 1 ? "A goal re-adjusted itself around what slipped." : `${r.replanned} goals re-adjusted around what slipped.`);
          router.refresh();
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [today, router]);
  return null;
}
