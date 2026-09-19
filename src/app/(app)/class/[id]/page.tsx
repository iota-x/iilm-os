import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { getPost, getProfile, getSubjects } from "@/lib/queries";
import { Markdown } from "@/components/markdown";
import { Replies } from "@/components/class/replies";
import { DeletePost } from "@/components/class/delete-post";
import { Helpful } from "@/components/class/helpful";
import { PinPost } from "@/components/class/pin-post";
import { MarkSeen } from "@/components/class/seen";
import { boardImageUrl } from "@/lib/board-image";
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
  const admin = Boolean(profile?.is_admin);

  return (
    <div className={cn("mx-auto max-w-[760px] space-y-5", subject ? ACCENT_CLASS[subject.color] : "")}>
      <Link href="/class" className="text-[length:var(--text-micro)] text-muted hover:text-fg focus-ring rounded">
        ← Class
      </Link>

      <Card className="p-5">
        <div className="flex flex-wrap items-center gap-2">
          {post.pinned ? <Badge tone="accent">pinned</Badge> : null}
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
        {post.image_path ? (
          <a href={boardImageUrl(post.image_path)} target="_blank" rel="noopener noreferrer" className="mt-4 block focus-ring rounded-[var(--radius-control)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={boardImageUrl(post.image_path)}
              alt=""
              className="max-h-[520px] w-auto max-w-full rounded-[var(--radius-control)] border border-line"
            />
          </a>
        ) : null}
        {post.body ? (
          <div className="prose-note mt-4">
            <Markdown>{post.body}</Markdown>
          </div>
        ) : null}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
          <Helpful target="post" id={post.id} count={post.helpful} mine={post.mine} size="md" />
          <div className="flex items-center gap-1.5">
            {admin ? <PinPost id={post.id} pinned={post.pinned} /> : null}
            {mine || admin ? <DeletePost id={post.id} /> : null}
          </div>
        </div>
      </Card>

      <MarkSeen postId={post.id} replies={replies.length} />
      <Replies
        postId={post.id}
        replies={replies}
        meId={profile?.id ?? null}
        canModerate={admin}
        canAccept={mine && post.kind === "question"}
        answerId={post.answer_reply_id}
      />
    </div>
  );
}
