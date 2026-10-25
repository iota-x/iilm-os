import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, EyeOff } from "lucide-react";
import { getClassPoints, getNoticeReach, getPost, getProfile, getSubjects, postOnPlanner } from "@/lib/queries";
import { Markdown } from "@/components/markdown";
import { Replies } from "@/components/class/replies";
import { DeletePost } from "@/components/class/delete-post";
import { Helpful } from "@/components/class/helpful";
import { PinPost } from "@/components/class/pin-post";
import { MarkSeen } from "@/components/class/seen";
import { Points, TeacherTag, Verified } from "@/components/class/badges";
import { VerifyPost } from "@/components/class/verify-post";
import { NoticeReach } from "@/components/class/notice-reach";
import { AddToPlanner } from "@/components/class/add-to-planner";
import { boardImageUrl } from "@/lib/board-image";
import { Badge, Card } from "@/components/ui";
import { ACCENT_CLASS, cn, fmtDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [data, profile, subjects, allTime] = await Promise.all([getPost(id), getProfile(), getSubjects(), getClassPoints(null)]);
  if (!data) notFound();
  const { post, replies } = data;
  const subject = post.subject_slug ? subjects.find((s) => s.slug === post.subject_slug) : null;
  const mine = Boolean(post.owned);
  const admin = Boolean(profile?.is_admin);
  const teacher = Boolean(profile?.is_faculty) || admin;
  const points = Object.fromEntries(allTime.map((p) => [p.user_id, p.points]));
  const [reach, onPlanner] = await Promise.all([
    post.kind === "notice" ? getNoticeReach(post.id) : null,
    post.due_date ? postOnPlanner(post.id) : false,
  ]);

  return (
    <div className={cn("mx-auto max-w-[760px] space-y-5", subject ? ACCENT_CLASS[subject.color] : "")}>
      <Link href="/class" className="text-[length:var(--text-micro)] text-muted hover:text-fg focus-ring rounded">
        ← Class
      </Link>

      <Card className="p-5">
        <div className="flex flex-wrap items-center gap-2">
          {post.pinned ? <Badge tone="accent">pinned</Badge> : null}
          <Badge tone="neutral">{post.kind}</Badge>
          <Verified by={post.verifier} />
          {subject ? (
            <Link href={`/subjects/${subject.slug}`}>
              <Badge tone="subject">{subject.short_name}</Badge>
            </Link>
          ) : null}
        </div>
        <h1 className="mt-2 text-[length:var(--text-title)]">{post.title}</h1>
        <p className="mt-1 flex flex-wrap items-center gap-1.5 text-[length:var(--text-micro)] text-subtle">
          {post.anonymous ? <EyeOff size={11} aria-hidden /> : null}
          {post.author}
          <TeacherTag show={post.by_teacher} />
          {post.user_id && !post.anonymous ? <Points n={points[post.user_id]} /> : null}
          {post.anonymous && mine ? <span>(you — only you and the board admin know)</span> : null}
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
        {post.due_date ? (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-control)] bg-surface-2 px-3.5 py-2.5">
            <span className="text-[length:var(--text-small)]">
              Due <span className="font-medium">{fmtDate(post.due_date)}</span>
            </span>
            <AddToPlanner id={post.id} added={onPlanner} />
          </div>
        ) : null}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
          <Helpful target="post" id={post.id} count={post.helpful} mine={post.mine} size="md" />
          <div className="flex items-center gap-1.5">
            {teacher ? <VerifyPost id={post.id} verified={Boolean(post.verified_by)} /> : null}
            {admin ? <PinPost id={post.id} pinned={post.pinned} /> : null}
            {mine || admin ? <DeletePost id={post.id} /> : null}
          </div>
        </div>
      </Card>

      {post.kind === "notice" ? <NoticeReach postId={post.id} reach={reach} /> : null}
      <MarkSeen postId={post.id} replies={replies.length} />
      <Replies
        postId={post.id}
        replies={replies}
        meId={profile?.id ?? null}
        canModerate={admin}
        canAccept={mine && post.kind === "question"}
        answerId={post.answer_reply_id}
        points={points}
      />
    </div>
  );
}
