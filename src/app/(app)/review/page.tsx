import { ReviewQueue, type QueueItem } from "@/components/review-queue";
import { getSubjects, getTopics, getUnits } from "@/lib/queries";
import { dueForReview, reviewStateOf } from "@/lib/review";

export const dynamic = "force-dynamic";

export default async function ReviewPage() {
  const [topics, subjects, units] = await Promise.all([getTopics(), getSubjects(), getUnits()]);

  const subjectById = new Map(subjects.map((s) => [s.id, s]));
  const unitById = new Map(units.map((u) => [u.id, u]));

  const items: QueueItem[] = dueForReview(topics).map(({ topic, review }) => {
    const s = subjectById.get(topic.subject_id);
    return {
      topic,
      review,
      subjectSlug: s?.slug ?? "",
      subjectShort: s?.short_name ?? "",
      unitNumber: unitById.get(topic.unit_id)?.number ?? null,
    };
  });

  const soon = topics.filter((t) => reviewStateOf(t).bucket === "soon").length;
  const scheduled = topics.filter((t) => reviewStateOf(t).bucket === "scheduled").length;

  return (
    <div className="mx-auto max-w-[720px] space-y-4">
      <div>
        <h1 className="text-[20px] font-semibold tracking-tight">Review</h1>
        <p className="mt-0.5 text-[13px] text-muted">
          {items.length
            ? `${items.length} topic${items.length === 1 ? "" : "s"} due. Rate each one honestly — that sets when it comes back.`
            : "Topics come back here on a widening schedule once you've studied them."}
          {soon || scheduled ? (
            <span className="text-subtle">
              {" "}
              · {soon} due within 2 days · {scheduled} scheduled later
            </span>
          ) : null}
        </p>
      </div>

      <ReviewQueue items={items} />
    </div>
  );
}
