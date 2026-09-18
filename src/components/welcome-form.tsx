"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { setOwnPassword } from "@/lib/actions";
import { Button, inputCls } from "@/components/ui";

export function WelcomeForm() {
  const router = useRouter();
  const [pw, setPw] = useState("");
  const [again, setAgain] = useState("");
  const [pending, start] = useTransition();

  const mismatch = again.length > 0 && again !== pw;
  const ready = pw.length >= 8 && again === pw;

  return (
    <form
      className="mt-6 space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (!ready) return;
        start(async () => {
          try {
            await setOwnPassword(pw);
            toast.success("Password set");
            router.replace("/");
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Couldn't set that");
          }
        });
      }}
    >
      <div>
        <label htmlFor="pw" className="text-[length:var(--text-micro)] font-medium text-muted">
          New password
        </label>
        <input
          id="pw"
          type="password"
          autoComplete="new-password"
          autoFocus
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          className={`${inputCls} mt-1`}
        />
        <p className="mt-1 text-[length:var(--text-micro)] text-subtle">At least 8 characters.</p>
      </div>
      <div>
        <label htmlFor="again" className="text-[length:var(--text-micro)] font-medium text-muted">
          Once more
        </label>
        <input
          id="again"
          type="password"
          autoComplete="new-password"
          value={again}
          onChange={(e) => setAgain(e.target.value)}
          className={`${inputCls} mt-1`}
          aria-invalid={mismatch}
        />
        {mismatch ? (
          <p className="mt-1 text-[length:var(--text-micro)] text-[var(--bad)]">
            Those don&rsquo;t match yet.
          </p>
        ) : null}
      </div>
      <Button type="submit" variant="primary" className="w-full" disabled={!ready || pending}>
        {pending ? <Loader2 size={14} className="animate-spin" /> : null}
        Set password and continue
      </Button>
    </form>
  );
}
