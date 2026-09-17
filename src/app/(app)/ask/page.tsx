import Link from "next/link";
import { AskChat } from "@/components/ask-chat";
import { Card } from "@/components/ui";
import { getInboxFiles } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function AskPage() {
  const files = await getInboxFiles();
  const configured = Boolean(process.env.ANTHROPIC_API_KEY);

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
            This page needs an Anthropic API key on the server. Create one at{" "}
            <a
              href="https://console.anthropic.com/settings/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--accent)] hover:underline"
            >
              console.anthropic.com
            </a>
            , add it to Vercel as <code className="text-fg">ANTHROPIC_API_KEY</code>, and redeploy.
            Locally, put it in <code className="text-fg">.env.local</code>.
          </p>
          <p className="mt-2 max-w-[62ch] text-[12px] leading-relaxed text-subtle">
            It bills per message against your own Anthropic account — a few paise for a short
            question, more when you attach photos. Nothing else in the app costs anything to run.
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
