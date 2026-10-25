"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function SignOut({ to = "/teacher/signin" }: { to?: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={async () => {
        await createClient().auth.signOut();
        router.push(to);
        router.refresh();
      }}
      className="grid h-8 w-8 place-items-center rounded-lg text-subtle hover:bg-surface-2 hover:text-fg focus-ring"
      aria-label="Sign out"
      title="Sign out"
    >
      <LogOut size={14} />
    </button>
  );
}
