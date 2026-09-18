import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { getPost, getProfile, getSubjects } from "@/lib/queries";
import { Markdown } from "@/components/markdown";
import { Replies } from "@/components/class/replies";
import { DeletePost } from "@/components/class/delete-post";
import { Helpful } from "@/components/class/helpful";
import { Badge, Card } from "@/components/ui";
import { ACCENT_CLASS, cn, fmtDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [data, profile, subjects] = await Promise.all([getPost(id), getProfile(), getSubjects()]);
  if (!data) notFound();
  const { post, replies } = data;
  const subject = post.subject_slug ? subjects.find((s) => s.slug === post.subject_slug) : null;
  const mine = profile?.id === post.user_id;

  return (
    <div className={cn("mx-auto max-w-[760px] space-y-5", subject ? ACCENT_CLASS[subject.color] : "")}>
      <Link href="/class" className="text-[length:var(--text-micro)] text-muted hover:text-fg focus-ring rounded">
        ← Class
      </Link>

      <Card className="p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="neutral">{post.kind}</Badge>
          {subject ? (
            <Link href={`/subjects/${subject.slug}`}>
              <Badge tone="subject">{subject.short_name}</Badge>
            </Link>
          ) : null}
        </div>
        <h1 className="mt-2 text-[length:var(--text-title)]">{post.title}</h1>
        <p className="mt-1 text-[length:var(--text-micro)] text-subtle">
          {post.author}
          {"  "}
          {fmtDate(post.created_at)}
        </p>
        {post.url ? (
          <a
            href={post.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 rounded-[var(--radius-control)] border border-line bg-surface-2 px-2.5 py-1.5 text-[length:var(--text-small)] text-[var(--accent)] hover:underline focus-ring"
          >
            <ExternalLink size={13} />
            {post.url.replace(/^https?:\/\/(www\.)?/, "").slice(0, 60)}
          </a>
        ) : null}
        {post.body ? (
          <div className="prose-note mt-4">
            <Markdown>{post.body}</Markdown>
          </div>
        ) : null}
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-3">
          <Helpful target="post" id={post.id} count={post.helpful} mine={post.mine} size="md" />
          {mine ? <DeletePost id={post.id} /> : null}
        </div>
      </Card>

      <Replies postId={post.id} replies={replies} meId={profile?.id ?? null} />
    </div>
  );
}
