"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Mark } from "@/components/mark";
import { ThemeToggle } from "@/components/theme";
import { createClient } from "@/lib/supabase/client";
import { Button, Card, inputCls } from "@/components/ui";

/** Teachers sign in here, or ask for access. The admin approves every request. */
export default function TeacherSignIn() {
  const router = useRouter();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [department, setDepartment] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const supabase = createClient();
    if (mode === "up") {
      const res = await fetch("/api/teacher-signup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, email, password, department }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Couldn't send the request.");
        setBusy(false);
        return;
      }
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setBusy(false);
      return;
    }
    router.push("/teacher");
    router.refresh();
  }

  const label = "text-[length:var(--text-micro)] font-medium text-muted";

  return (
    <div className="grid min-h-dvh place-items-center px-4">
      <div className="w-full max-w-[400px]">
        <Link
          href="/landing"
          className="mb-5 inline-flex items-center gap-1.5 rounded text-[length:var(--text-micro)] text-muted hover:text-fg focus-ring"
        >
          <ArrowLeft size={13} /> Back to the front page
        </Link>
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Mark size={32} />
            <div>
              <p className="font-serif text-[length:var(--text-lead)] font-semibold leading-tight tracking-tight">Semwise for teachers</p>
              <p className="text-[length:var(--text-micro)] leading-tight text-muted">Post once. Every section sees it.</p>
            </div>
          </div>
          <ThemeToggle />
        </div>

        <Card className="p-5">
          <div className="mb-4 grid grid-cols-2 rounded-lg border border-line bg-surface-2 p-0.5">
            {(["in", "up"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMode(m);
                  setError(null);
                }}
                className={`rounded-[7px] px-2.5 py-1.5 text-[length:var(--text-small)] font-medium transition-colors focus-ring ${
                  mode === m ? "bg-surface text-fg shadow-card" : "text-subtle hover:text-fg"
                }`}
              >
                {m === "in" ? "Sign in" : "Request access"}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-3">
            {mode === "up" ? (
              <div>
                <label className={label} htmlFor="name">Your name</label>
                <input id="name" required value={name} onChange={(e) => setName(e.target.value)} className={`${inputCls} mt-1`} placeholder="As students know you, e.g. Dr. Sonam Lata" />
              </div>
            ) : null}
            <div>
              <label className={label} htmlFor="email">University email</label>
              <input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={`${inputCls} mt-1`} placeholder="you@iilm.edu" />
            </div>
            <div>
              <label className={label} htmlFor="password">Password</label>
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
              <div>
                <label className={label} htmlFor="dept">Department and subjects</label>
                <input id="dept" value={department} onChange={(e) => setDepartment(e.target.value)} className={`${inputCls} mt-1`} placeholder="e.g. CSE — Digital Electronics, C" />
                <p className="mt-1 text-[length:var(--text-micro)] text-subtle">
                  The admin checks every request before teacher tools open up, usually within a day.
                </p>
              </div>
            ) : null}

            {error ? (
              <p className="rounded-lg bg-[var(--bad-soft)] px-3 py-2 text-[length:var(--text-micro)] text-[var(--bad)]">{error}</p>
            ) : null}

            <Button type="submit" variant="primary" className="w-full" disabled={busy}>
              {busy ? "One moment…" : mode === "in" ? "Sign in" : "Request access"}
            </Button>
          </form>
        </Card>
        <p className="mt-4 text-center text-[length:var(--text-micro)] text-subtle">
          A student? <Link href="/login" className="text-[var(--accent)] hover:underline">Sign in here</Link>.
        </p>
      </div>
    </div>
  );
}
