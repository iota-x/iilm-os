"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { createReply, deleteReply } from "@/lib/actions";
import type { Reply } from "@/lib/db-types";
import { Markdown } from "@/components/markdown";
import { Button, Card, CardHead, inputCls } from "@/components/ui";
import { cn, fmtDate } from "@/lib/utils";

export function Replies({ postId, replies, meId }: { postId: string; replies: Reply[]; meId: string | null }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [pending, start] = useTransition();

  function run(fn: () => Promise<unknown>) {
    start(async () => {
      try {
        await fn();
        router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "That didn't work");
      }
    });
  }

  return (
    <Card>
      <CardHead title={replies.length ? `${replies.length} ${replies.length === 1 ? "reply" : "replies"}` : "No replies yet"} />
      {replies.length ? (
        <ul className={cn("divide-y divide-[var(--border)]", pending && "opacity-70")}>
          {replies.map((r) => (
            <li key={r.id} className="group px-5 py-3">
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-[length:var(--text-micro)] text-subtle">
                  <span className="font-medium text-fg">{r.author}</span>
                  {"  "}
                  {fmtDate(r.created_at)}
                </p>
                {r.user_id === meId ? (
                  <button
                    onClick={() => run(() => deleteReply(r.id, postId))}
                    className="rounded p-1 text-subtle opacity-0 transition-opacity hover:text-[var(--bad)] focus-ring group-hover:opacity-100"
                    aria-label="Delete reply"
                  >
                    <Trash2 size={13} />
                  </button>
                ) : null}
              </div>
              <div className="prose-note mt-1 text-[length:var(--text-small)]">
                <Markdown>{r.body}</Markdown>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
      <form
        className="flex gap-2 border-t border-line p-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (!text.trim()) return;
          run(async () => {
            await createReply(postId, text);
            setText("");
          });
        }}
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Reply…"
          className={inputCls}
        />
        <Button type="submit" variant="primary" disabled={pending || !text.trim()}>
          {pending ? <Loader2 size={14} className="animate-spin" /> : null}
          Reply
        </Button>
      </form>
    </Card>
  );
}
