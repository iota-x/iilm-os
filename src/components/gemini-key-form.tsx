"use client";

import { useState, useTransition } from "react";
import { Check, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { setGeminiKey } from "@/lib/actions";
import { Button, Card, CardHead, inputCls } from "@/components/ui";

/** Shows only the ends of a key, so a screenshot of Settings doesn't leak it. */
function masked(key: string) {
  return key.length > 12 ? `${key.slice(0, 6)}…${key.slice(-4)}` : "•".repeat(key.length);
}

export function GeminiKeyForm({ current }: { current: string | null }) {
  const [key, setKey] = useState("");
  const [editing, setEditing] = useState(!current);
  const [pending, start] = useTransition();

  function save(value: string) {
    start(async () => {
      try {
        await setGeminiKey(value);
        toast.success(value ? "Key saved — Ask now runs on it" : "Key removed");
        setKey("");
        setEditing(!value);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Couldn't save that");
      }
    });
  }

  return (
    <Card>
      <CardHead
        title="Your AI key"
        sub="Ask reads your board photos and answers questions with Google's Gemini. It's free, but the free allowance is per key — so everyone brings their own."
      />
      <div className="space-y-4 p-5">
        <ol className="space-y-2 text-[length:var(--text-small)] leading-relaxed text-muted">
          <li className="flex gap-2.5">
            <span className="w-4 shrink-0 tabular-nums text-subtle">1.</span>
            <span>
              Open{" "}
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[var(--accent)] hover:underline"
              >
                aistudio.google.com/apikey <ExternalLink size={11} />
              </a>{" "}
              and sign in with any Google account — your college one works.
            </span>
          </li>
          <li className="flex gap-2.5">
            <span className="w-4 shrink-0 tabular-nums text-subtle">2.</span>
            <span>
              Click <strong className="font-medium text-fg">Create API key</strong>. If it asks for
              a project, pick the default one it offers. No card, no billing.
            </span>
          </li>
          <li className="flex gap-2.5">
            <span className="w-4 shrink-0 tabular-nums text-subtle">3.</span>
            <span>
              Copy the key — it starts with <code className="font-mono text-[length:var(--text-micro)]">AIza</code> or{" "}
              <code className="font-mono text-[length:var(--text-micro)]">AQ.</code> — and paste it below.
              Treat it like a password: it&rsquo;s only ever stored against your account.
            </span>
          </li>
        </ol>

        {editing ? (
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (key.trim()) save(key);
            }}
          >
            <input
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Paste your key"
              autoComplete="off"
              spellCheck={false}
              className={`${inputCls} font-mono text-[length:var(--text-micro)]`}
            />
            <Button type="submit" variant="primary" disabled={pending || !key.trim()}>
              {pending ? <Loader2 size={14} className="animate-spin" /> : null}
              Save
            </Button>
            {current ? (
              <Button type="button" onClick={() => setEditing(false)} disabled={pending}>
                Cancel
              </Button>
            ) : null}
          </form>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-[var(--radius-control)] border border-line bg-surface-2 px-3 py-2">
            <p className="flex items-center gap-2 text-[length:var(--text-small)]">
              <Check size={14} className="text-[var(--good)]" />
              <span className="font-mono text-[length:var(--text-micro)]">{masked(current!)}</span>
              <span className="text-muted">— Ask runs on your key</span>
            </p>
            <div className="flex gap-1.5">
              <Button size="sm" onClick={() => setEditing(true)} disabled={pending}>
                Replace
              </Button>
              <Button size="sm" variant="danger" onClick={() => save("")} disabled={pending}>
                Remove
              </Button>
            </div>
          </div>
        )}

        <p className="text-[length:var(--text-micro)] leading-relaxed text-subtle">
          Without a key, Ask falls back to a shared one that the whole section is on — it will start
          saying &ldquo;try again later&rdquo; on busy evenings. Your own never does.
        </p>
      </div>
    </Card>
  );
}
