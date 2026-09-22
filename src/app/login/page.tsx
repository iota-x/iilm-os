"use client";

import { Mark } from "@/components/mark";
import Link from "next/link";
import { Suspense, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button, Card, inputCls } from "@/components/ui";
import { ThemeToggle } from "@/components/theme";

/** "ankit.pandey.26@gg.iilm.edu" → "Ankit Pandey" */
function nameFromEmail(email: string) {
  return email
    .split("@")[0]
    .split(".")
    .filter((p) => p && !/^\d+$/.test(p))
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"in" | "up">(params.get("mode") === "up" ? "up" : "in");
  const [group, setGroup] = useState<1 | 2>(2);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function forgot() {
    if (!email) {
      setError("Type your email first, then tap this again.");
      return;
    }
    setBusy(true);
    setError(null);
    const { error } = await createClient().auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/confirm?next=/reset-password`,
    });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    setInfo("Check your college inbox — the link there lets you set a new password.");
  }

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
      // Created server-side, confirmed, and seeded with the whole curriculum
      // before this returns — so the first page is complete. Then sign in.
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password, group }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Couldn't create the account.");
        setBusy(false);
        return;
      }
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setInfo("Account created — sign in to continue.");
        setMode("in");
        setBusy(false);
        return;
      }
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div className="min-h-dvh grid place-items-center px-4">
      <div className="w-full max-w-[380px]">
        <Link
          href="/landing"
          className="mb-5 inline-flex items-center gap-1.5 rounded text-[length:var(--text-micro)] text-muted hover:text-fg focus-ring"
        >
          <ArrowLeft size={13} /> Back to the front page
        </Link>
        <div className="flex items-center justify-between mb-6">
          <Link href="/landing" className="flex items-center gap-2.5 rounded focus-ring">
            <Mark size={32} />
            <div>
              <p className="font-serif text-[length:var(--text-lead)] font-semibold tracking-tight leading-tight">IILM OS</p>
              <p className="text-[length:var(--text-micro)] text-muted leading-tight">B.Tech CSE, Semester I</p>
            </div>
          </Link>
          <ThemeToggle />
        </div>

        <Card className="p-5">
          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className="text-[length:var(--text-micro)] font-medium text-muted" htmlFor="email">
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
                placeholder={mode === "up" ? "first.last.26@gg.iilm.edu" : "you@gg.iilm.edu"}
              />
              {mode === "up" && /@gg\.iilm\.edu$/i.test(email) ? (
                <p className="mt-1 text-[length:var(--text-micro)] text-subtle">
                  You&rsquo;ll appear as <span className="text-fg">{nameFromEmail(email)}</span>.
                </p>
              ) : mode === "up" ? (
                <p className="mt-1 text-[length:var(--text-micro)] text-subtle">
                  Your college address. Your name comes from it.
                </p>
              ) : null}
            </div>
            <div>
              <label className="text-[length:var(--text-micro)] font-medium text-muted" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={mode === "up" ? 8 : 6}
                autoComplete={mode === "in" ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${inputCls} mt-1`}
                placeholder={mode === "up" ? "At least 8 characters" : "••••••••"}
              />
            </div>

            {mode === "up" ? (
              <div className="rounded-[var(--radius-control)] border border-line bg-surface-2 px-3 py-2 text-[length:var(--text-micro)] text-muted">
                <span className="font-medium text-fg">Section E only, for now.</span> The timetable,
                lab groups and test dates in here are Section E&rsquo;s. Other sections can sign up
                once their timetables are in.
              </div>
            ) : null}

            {mode === "up" ? (
              <div>
                <p className="text-[length:var(--text-micro)] font-medium text-muted">Lab group</p>
                <p className="mt-0.5 text-[length:var(--text-micro)] text-subtle">
                  Decides which lab slots your timetable shows. Changeable in Settings.
                </p>
                <div className="mt-1.5 grid grid-cols-2 gap-2">
                  {([1, 2] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGroup(g)}
                      aria-pressed={group === g}
                      className={`rounded-[var(--radius-control)] border px-3 py-2 text-[length:var(--text-small)] font-medium transition-colors focus-ring ${
                        group === g
                          ? "border-[var(--accent)] bg-[var(--accent-soft)] text-fg"
                          : "border-line bg-surface text-muted hover:bg-surface-2"
                      }`}
                    >
                      Group {g}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {error ? (
              <p className="text-[length:var(--text-micro)] text-[var(--bad)] bg-[var(--bad-soft)] rounded-lg px-3 py-2">
                {error}
              </p>
            ) : null}
            {info ? (
              <p className="text-[length:var(--text-micro)] text-[var(--good)] bg-[var(--good-soft)] rounded-lg px-3 py-2">
                {info}
              </p>
            ) : null}

            <Button type="submit" variant="primary" className="w-full" disabled={busy}>
              {busy ? "…" : mode === "in" ? "Sign in" : "Create account"}
            </Button>
          </form>

          {mode === "in" ? (
            <button
              type="button"
              onClick={forgot}
              disabled={busy}
              className="mt-3 w-full text-[length:var(--text-micro)] text-muted hover:text-fg transition-colors focus-ring rounded"
            >
              Forgot your password?
            </button>
          ) : null}
          <button
            onClick={() => {
              setMode(mode === "in" ? "up" : "in");
              setError(null);
            }}
            className="mt-3 w-full text-[length:var(--text-micro)] text-muted hover:text-fg transition-colors focus-ring rounded"
          >
            {mode === "in" ? "New here? Create your account" : "Already have an account? Sign in"}
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
