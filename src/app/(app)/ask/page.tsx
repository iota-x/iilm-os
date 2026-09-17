import Link from "next/link";
import { AskChat } from "@/components/ask-chat";
import { Card } from "@/components/ui";
import { hasModelCredential } from "@/lib/ai-model";
import { getInboxFiles } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function AskPage() {
  const files = await getInboxFiles();
  const configured = hasModelCredential();

  return (
    <div className="mx-auto max-w-[760px] space-y-4">
      <div>
        <h1 className="text-[20px] font-semibold tracking-tight">Ask</h1>
        <p className="mt-0.5 text-[13px] text-muted">
          Claude, with your syllabus loaded and permission to change your data.
        </p>
      </div>

      {configured ? (
        <AskChat files={files} />
      ) : (
        <Card className="p-5">
          <p className="text-[13.5px] font-medium">Not switched on yet</p>
          <p className="mt-1.5 max-w-[62ch] text-[12.5px] leading-relaxed text-muted">
            This page needs a model key on the server. The free option is Gemini — get a key at{" "}
            <a
              href="https://aistudio.google.com/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--accent)] hover:underline"
            >
              aistudio.google.com/apikey
            </a>
            , add it as <code className="text-fg">GOOGLE_GENERATIVE_AI_API_KEY</code>, and
            redeploy. Locally, put it in <code className="text-fg">.env.local</code>.
          </p>
          <p className="mt-2 max-w-[62ch] text-[12px] leading-relaxed text-subtle">
            Gemini&rsquo;s free tier has no card and real rate limits, which is plenty for a few
            questions a day. <code className="text-fg">GROQ_API_KEY</code> or{" "}
            <code className="text-fg">ANTHROPIC_API_KEY</code> work instead if you ever want them —
            whichever is set wins, free keys first.
          </p>
          <Link
            href="/inbox"
            className="mt-3 inline-flex h-8 items-center rounded-lg border border-line bg-surface-2 px-3 text-[12.5px] hover:bg-surface-3 focus-ring"
          >
            Back to Inbox
          </Link>
        </Card>
      )}
    </div>
  );
}
