"use client";

import { Mark } from "@/components/mark";
import Link from "next/link";
import { Suspense, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button, Card, inputCls } from "@/components/ui";
import { ThemeToggle } from "@/components/theme";
import { emailDomain, nameFromEmail, publicDirectory } from "@/lib/universities";

const DIRECTORY = publicDirectory();

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"in" | "up">(params.get("mode") === "up" ? "up" : "in");
  const [cohortId, setCohortId] = useState("");
  const [group, setGroup] = useState<number | null>(null);
  const [college, setCollege] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  // The college comes from the address; its classes and lab groups follow.
  const domain = emailDomain(email);
  const uni = DIRECTORY.find((u) => u.domains.includes(domain)) ?? null;
  const cohort = uni?.cohorts.find((c) => c.id === cohortId) ?? null;
  const unknownCollege = mode === "up" && domain.includes(".") && !uni;

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
        body: JSON.stringify({ email, password, cohort: cohortId, group, college }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string; waitlisted?: boolean };
      if (data.waitlisted) {
        setInfo(data.error ?? "You're on the list.");
        setBusy(false);
        return;
      }
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
              <p className="font-serif text-[length:var(--text-lead)] font-semibold tracking-tight leading-tight">Semwise</p>
              <p className="text-[length:var(--text-micro)] text-muted leading-tight">Your semester, planned</p>
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
                placeholder={mode === "up" ? "you@your-college.edu" : "Your college email"}
              />
              {mode === "up" && uni ? (
                <p className="mt-1 text-[length:var(--text-micro)] text-subtle">
                  <span className="text-fg">{uni.name}</span> · you&rsquo;ll appear as{" "}
                  <span className="text-fg">{nameFromEmail(email)}</span>.
                </p>
              ) : unknownCollege ? (
                <p className="mt-1 text-[length:var(--text-micro)] text-subtle">
                  Semwise isn&rsquo;t at <span className="text-fg">{domain}</span> yet. Tell us your
                  college and we&rsquo;ll email you when it&rsquo;s in.
                </p>
              ) : mode === "up" ? (
                <p className="mt-1 text-[length:var(--text-micro)] text-subtle">
                  Your college address. Your name comes from it.
                </p>
              ) : null}
            </div>
            {!unknownCollege ? (
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
            ) : null}

            {unknownCollege ? (
              <div>
                <label className="text-[length:var(--text-micro)] font-medium text-muted" htmlFor="college">
                  Your college
                </label>
                <input
                  id="college"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  className={`${inputCls} mt-1`}
                  placeholder="e.g. Delhi Technological University"
                />
              </div>
            ) : null}

            {mode === "up" && uni ? (
              <div>
                <label className="text-[length:var(--text-micro)] font-medium text-muted" htmlFor="cohort">
                  Your class
                </label>
                <select
                  id="cohort"
                  required
                  value={cohortId}
                  onChange={(e) => {
                    setCohortId(e.target.value);
                    setGroup(null);
                  }}
                  className={`${inputCls} mt-1`}
                >
                  <option value="" disabled>
                    Programme, semester, section
                  </option>
                  {uni.cohorts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
                {cohort ? (
                  <p className="mt-1 text-[length:var(--text-micro)] text-subtle">
                    {!cohort.ready
                      ? "Your syllabus isn’t loaded yet — you can sign up now and it fills in when it is."
                      : cohort.timetable
                        ? "Syllabus, timetable and exam dates are all in."
                        : "Syllabus and exam dates are in; your section’s timetable isn’t yet."}
                  </p>
                ) : null}
              </div>
            ) : null}

            {mode === "up" && cohort?.labGroups.length ? (
              <div>
                <p className="text-[length:var(--text-micro)] font-medium text-muted">Lab group</p>
                <p className="mt-0.5 text-[length:var(--text-micro)] text-subtle">
                  Decides which lab slots your timetable shows. Changeable in Settings.
                </p>
                <div className="mt-1.5 grid grid-cols-2 gap-2">
                  {cohort.labGroups.map((g) => (
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
              {busy ? "…" : mode === "in" ? "Sign in" : unknownCollege ? "Tell me when it’s in" : "Create account"}
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
