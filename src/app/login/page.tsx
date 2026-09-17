"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button, Card, inputCls } from "@/components/ui";
import { ThemeToggle } from "@/components/theme";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"in" | "up">("in");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setInfo(null);
    const supabase = createClient();

    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
        setBusy(false);
        return;
      }
      router.push(next);
      router.refresh();
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
        setBusy(false);
        return;
      }
      setInfo("Account created. If email confirmation is on, check your inbox — then sign in.");
      setMode("in");
      setBusy(false);
    }
  }

  return (
    <div className="min-h-dvh grid place-items-center px-4">
      <div className="w-full max-w-[380px]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--accent)] text-[var(--accent-fg)] text-[13px] font-bold">
              I
            </span>
            <div>
              <p className="text-[14px] font-semibold tracking-tight leading-tight">IILM OS</p>
              <p className="text-[11.5px] text-muted leading-tight">B.Tech CSE · Semester I</p>
            </div>
          </div>
          <ThemeToggle />
        </div>

        <Card className="p-5">
          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className="text-[12px] font-medium text-muted" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`${inputCls} mt-1`}
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="text-[12px] font-medium text-muted" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                autoComplete={mode === "in" ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${inputCls} mt-1`}
                placeholder="••••••••"
              />
            </div>

            {error ? (
              <p className="text-[12px] text-[var(--bad)] bg-[var(--bad-soft)] rounded-lg px-3 py-2">
                {error}
              </p>
            ) : null}
            {info ? (
              <p className="text-[12px] text-[var(--good)] bg-[var(--good-soft)] rounded-lg px-3 py-2">
                {info}
              </p>
            ) : null}

            <Button type="submit" variant="primary" className="w-full" disabled={busy}>
              {busy ? "…" : mode === "in" ? "Sign in" : "Create account"}
            </Button>
          </form>

          <button
            onClick={() => {
              setMode(mode === "in" ? "up" : "in");
              setError(null);
            }}
            className="mt-3 w-full text-[12px] text-muted hover:text-fg transition-colors focus-ring rounded"
          >
            {mode === "in" ? "Need an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
