import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertTriangle,
  BookMarked,
  FileText,
  FlaskConical,
  Folder,
  Target,
} from "lucide-react";
import {
  getBooks,
  getComponents,
  getExperiments,
  getNotes,
  getOutcomes,
  getResources,
  getStrategies,
  getSubjectBySlug,
  getSubjects,
  getSlots,
  getInboxFiles,
  getTopics,
  getUnits,
  getProfile,
} from "@/lib/queries";
import { TopicRow } from "@/components/subject/topic-row";
import { ExperimentRow } from "@/components/subject/experiment-row";
import { MarksTable } from "@/components/subject/marks-table";
import { PhotoWall } from "@/components/subject/photo-wall";
import { Camera } from "lucide-react";
import { FindMore } from "@/components/subject/find-more";
import { ResourceList } from "@/components/resource-list";
import { QuickAdd } from "@/components/quick-add";
import { Markdown } from "@/components/markdown";
import { Badge, Bar, Card, CardHead, Empty, Ring } from "@/components/ui";
import { ACCENT_CLASS, cn, fmtTime, progressOf, relativeDay } from "@/lib/utils";

export const dynamic = "force-dynamic";

const TABS = ["syllabus", "strategy", "resources", "notes", "photos", "marks", "lab"] as const;
type Tab = (typeof TABS)[number];

export default async function SubjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { slug } = await params;
  const { tab: rawTab } = await searchParams;

  const subject = await getSubjectBySlug(slug);
  if (!subject) notFound();

  const [
    allSubjects,
    units,
    topics,
    experiments,
    components,
    strategies,
    outcomes,
    books,
    resources,
    notes,
    slots,
    profile,
    photos,
  ] = await Promise.all([
    getSubjects(),
    getUnits(subject.id),
    getTopics(subject.id),
    getExperiments(subject.id),
    getComponents(subject.id),
    getStrategies(subject.id),
    getOutcomes(subject.id),
    getBooks(subject.id),
    getResources(subject.id),
    getNotes({ subjectId: subject.id }),
    getSlots(),
    getProfile(),
    getInboxFiles(subject.id),
  ]);

  const hasLab = subject.has_lab && experiments.length > 0;
  // A pure lab course has nothing on the syllabus tab, so open it on the lab list.
  const defaultTab: Tab = hasLab && topics.length === 0 ? "lab" : "syllabus";
  const tab: Tab = (TABS.includes(rawTab as Tab) ? rawTab : defaultTab) as Tab;

  const midTopics = topics.filter((t) => t.in_midsem);
  const midProgress = progressOf(midTopics.map((t) => t.status));
  const allProgress = progressOf(topics.map((t) => t.status));
  const group = profile?.lab_group ?? 2;

  const mySlots = slots
    .filter(
      (s) => s.subject_id === subject.id && (s.lab_group === null || s.lab_group === group),
    )
    .sort((a, b) => ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(a.day) - ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(b.day));

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: "syllabus", label: "Syllabus", count: topics.length || undefined },
    { key: "strategy", label: "Strategy", count: strategies.length || undefined },
    { key: "resources", label: "Resources", count: resources.length || undefined },
    { key: "notes", label: "Notes", count: notes.length || undefined },
    { key: "photos", label: "Photos", count: photos.length || undefined },
    { key: "marks", label: "Marks" },
    ...(hasLab ? [{ key: "lab" as Tab, label: "Lab", count: experiments.length }] : []),
  ];

  return (
    <div className={cn("space-y-5", ACCENT_CLASS[subject.color])}>
      {/* ── header ─────────────────────────────────────────── */}
      <div>
        <Link
          href="/subjects"
          className="text-[length:var(--text-micro)] text-muted hover:text-fg focus-ring rounded"
        >
          ← Subjects
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4 mt-2">
          <div className="min-w-0">
            <h1 className="text-[length:var(--text-page)] leading-tight">
              {subject.name}
            </h1>
            <p className="text-[length:var(--text-small)] text-muted mt-1">
              {[subject.code, subject.ltpc, subject.teacher].filter(Boolean).join("\u2002\u2002")}
            </p>
            {mySlots.length ? (
              <p className="text-[length:var(--text-micro)] text-subtle mt-1.5">
                {mySlots
                  .map(
                    (s) =>
                      `${s.day} ${fmtTime(s.start_time)}–${fmtTime(s.end_time)}${s.kind === "lab" ? " (lab)" : ""} · ${s.room}`,
                  )
                  .join("  ·  ")}
              </p>
            ) : null}
          </div>

          {topics.length ? (
            <div className="flex items-center gap-5">
              <div className="text-center">
                <Ring value={midProgress} size={48} />
                <p className="text-[length:var(--text-micro)] text-muted mt-1">mid-sem</p>
              </div>
              <div className="text-center">
                <Ring value={allProgress} size={48} />
                <p className="text-[length:var(--text-micro)] text-muted mt-1">full course</p>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* ── mid-sem scope banner ───────────────────────────── */}
      <Card className={cn(!subject.midsem_confirmed && "border-[var(--warn)]/35")}>
        <div className="flex gap-3 px-4 py-3">
          <Target size={16} className="shrink-0 mt-0.5 text-sc" />
          <div className="min-w-0">
            <p className="text-[length:var(--text-small)] font-semibold">
              Mid-sem scope{" "}
              {subject.midsem_confirmed ? (
                <Badge tone="good">confirmed</Badge>
              ) : (
                <Badge tone="warn">not confirmed</Badge>
              )}
            </p>
            <p className="text-[length:var(--text-small)] text-muted mt-1 leading-relaxed">
              {subject.midsem_scope}
            </p>
            {midTopics.length ? (
              <div className="flex items-center gap-2.5 mt-2.5">
                <Bar value={midProgress} className="w-36" />
                <span className="text-[length:var(--text-micro)] text-muted tabular-nums">
                  {midTopics.filter((t) => t.status !== "not_started").length}/{midTopics.length}{" "}
                  topics started
                </span>
              </div>
            ) : null}
          </div>
        </div>
      </Card>

      {/* ── gaps ───────────────────────────────────────────── */}
      {subject.gaps.length ? (
        <Card className="border-[var(--warn)]/35">
          <div className="flex gap-3 px-4 py-3">
            <AlertTriangle size={16} className="text-[var(--warn)] shrink-0 mt-0.5" />
            <div>
              <p className="text-[length:var(--text-small)] font-semibold">What&rsquo;s missing</p>
              <ul className="mt-1.5 space-y-1">
                {subject.gaps.map((g, i) => (
                  <li key={i} className="text-[length:var(--text-small)] text-muted leading-relaxed flex gap-2">
                    <span className="text-subtle select-none shrink-0">·</span>
                    <span>{g}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      ) : null}

      {/* ── tabs ───────────────────────────────────────────── */}
      <div className="border-b border-line">
        <nav className="flex gap-0.5 -mb-px overflow-x-auto">
          {tabs.map((t) => (
            <Link
              key={t.key}
              href={`/subjects/${slug}?tab=${t.key}`}
              scroll={false}
              className={cn(
                "px-3 py-2 text-[length:var(--text-small)] font-medium border-b-2 transition-colors focus-ring whitespace-nowrap",
                tab === t.key
                  ? "border-sc text-sc"
                  : "border-transparent text-muted hover:text-fg",
              )}
            >
              {t.label}
              {t.count ? <span className="text-subtle ml-1.5 tabular-nums">{t.count}</span> : null}
            </Link>
          ))}
        </nav>
      </div>

      {/* ── panels ─────────────────────────────────────────── */}
      {tab === "syllabus" ? (
        <div className="space-y-4">
          {subject.overview ? (
            <p className="text-[length:var(--text-small)] text-muted leading-relaxed max-w-3xl">
              {subject.overview}
            </p>
          ) : null}

          {units.length ? (
            units.map((u) => {
              const own = topics.filter((t) => t.unit_id === u.id);
              return (
                <Card key={u.id}>
                  <CardHead
                    title={
                      <span className="flex items-center gap-2">
                        <Link
                          href={`/subjects/${slug}/unit-${u.number}`}
                          className="rounded hover:underline focus-ring"
                        >
                          Unit {u.number} — {u.title}
                        </Link>
                        {u.in_midsem ? <Badge tone="accent">in mid-sem</Badge> : null}
                      </span>
                    }
                    sub={[
                      u.sessions ? `${u.sessions} sessions` : null,
                      u.co,
                      u.assessment,
                    ]
                      .filter(Boolean)
                      .join("\u2002\u2002")}
                    right={
                      own.length ? (
                        <Ring value={progressOf(own.map((t) => t.status))} size={34} stroke={3} />
                      ) : null
                    }
                  />
                  <ul className="divide-y divide-[var(--border)]">
                    {own.map((t) => (
                      <TopicRow
                        key={t.id}
                        topic={t}
                        subjectSlug={slug}
                        unitNumber={u.number}
                        noteCount={notes.filter((n) => n.topic_id === t.id).length}
                        resourceCount={resources.filter((r) => r.topic_id === t.id).length}
                      />
                    ))}
                  </ul>
                </Card>
              );
            })
          ) : hasLab ? (
            /* A pure lab course has no units — the experiment list is the syllabus. */
            <Card>
              <Empty
                icon={<FlaskConical size={26} strokeWidth={1.5} />}
                title="This course is taught entirely in the lab"
                body={`All ${experiments.length} experiments are on the Lab tab.`}
                action={
                  <Link
                    href={`/subjects/${slug}?tab=lab`}
                    className="text-[length:var(--text-small)] text-[var(--accent)] hover:underline focus-ring rounded"
                  >
                    Open the lab list
                  </Link>
                }
              />
            </Card>
          ) : (
            <Card>
              <Empty
                icon={<Folder size={26} strokeWidth={1.5} />}
                title="No syllabus loaded"
                body={
                  subject.status === "empty"
                    ? "Get the course plan and re-run the seed — the Strategy tab has exactly who to ask and what to ask for."
                    : "Units haven't been added for this subject yet."
                }
              />
            </Card>
          )}

          {outcomes.length ? (
            <Card>
              <CardHead title="Course outcomes" sub="What the course claims you'll be able to do" />
              <ul className="divide-y divide-[var(--border)]">
                {outcomes.map((o) => (
                  <li key={o.id} className="px-4 py-2.5 flex gap-3">
                    <Badge tone="subject">{o.code}</Badge>
                    <div className="min-w-0">
                      <p className="text-[length:var(--text-small)] leading-relaxed">{o.text}</p>
                      {o.bloom ? (
                        <p className="text-[length:var(--text-micro)] text-subtle mt-0.5">{o.bloom}</p>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}

          {subject.local_files.length ? (
            <Card>
              <CardHead
                title="Files in your iilm folder"
                sub="Already on your Mac — these are what the syllabus above was built from"
              />
              <ul className="px-4 py-3 space-y-1">
                {subject.local_files.map((f) => (
                  <li
                    key={f}
                    className="text-[length:var(--text-micro)] text-muted font-mono flex items-center gap-2"
                  >
                    <FileText size={12} className="shrink-0 text-subtle" />
                    {f}
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}
        </div>
      ) : null}

      {tab === "strategy" ? (
        <div className="space-y-4 max-w-3xl">
          {strategies.length ? (
            strategies.map((s) => (
              <Card key={s.id} className="p-4">
                <h3 className="text-[length:var(--text-body)] font-semibold tracking-tight leading-snug">
                  {s.title}
                </h3>
                <Markdown className="mt-2.5">{s.body}</Markdown>
              </Card>
            ))
          ) : (
            <Card>
              <Empty title="No strategy notes yet" />
            </Card>
          )}

          {books.length ? (
            <Card>
              <CardHead title="Books" />
              <ul className="divide-y divide-[var(--border)]">
                {books.map((b) => (
                  <li key={b.id} className="px-4 py-2.5 flex gap-3">
                    <BookMarked size={15} className="mt-0.5 shrink-0 text-sc" />
                    <div className="min-w-0">
                      <p className="text-[length:var(--text-small)] font-medium">{b.title}</p>
                      <p className="text-[length:var(--text-micro)] text-muted mt-0.5">{b.author}</p>
                      {b.note ? (
                        <p className="text-[length:var(--text-micro)] text-subtle mt-1 leading-relaxed">{b.note}</p>
                      ) : null}
                    </div>
                    <Badge tone="neutral" className="ml-auto self-start">
                      {b.kind}
                    </Badge>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}
        </div>
      ) : null}

      {tab === "resources" ? (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <QuickAdd subjects={allSubjects} defaultSubjectId={subject.id} />
            <FindMore subject={subject.name} />
          </div>
          <Card>
            <CardHead
              title="Curated first, then whatever you save"
              sub="Ranked. The top two are where to start."
            />
            <ResourceList resources={resources} subjects={allSubjects} />
          </Card>
        </div>
      ) : null}

      {tab === "notes" ? (
        <div className="space-y-4">
          <QuickAdd subjects={allSubjects} defaultSubjectId={subject.id} />
          <Card>
            <CardHead title={`${notes.length} note${notes.length === 1 ? "" : "s"}`} />
            {notes.length ? (
              <ul className="divide-y divide-[var(--border)]">
                {notes.map((n) => (
                  <li key={n.id}>
                    <Link
                      href={`/notes?open=${n.id}`}
                      className="block px-4 py-3 hover:bg-surface-2 transition-colors focus-ring"
                    >
                      <p className="text-[length:var(--text-small)] font-medium">{n.title}</p>
                      <p className="text-[length:var(--text-micro)] text-muted mt-0.5 line-clamp-2 leading-relaxed">
                        {n.content.replace(/[#*`>\-]/g, "").slice(0, 160) || "Empty note"}
                      </p>
                      <p className="text-[length:var(--text-micro)] text-subtle mt-1">
                        {relativeDay(n.updated_at.slice(0, 10))}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <Empty
                icon={<FileText size={26} strokeWidth={1.5} />}
                title="No notes for this subject"
                body="Use Add above, or open Notes and pick this subject."
              />
            )}
          </Card>
        </div>
      ) : null}

      {tab === "photos" ? (
        photos.length ? (
          <PhotoWall files={photos} slots={slots} topics={topics} />
        ) : (
          <Card>
            <Empty
              icon={<Camera size={26} strokeWidth={1.5} />}
              title="No photos for this subject yet"
              body="Share board photos from your phone and the ones taken during this subject's classes will appear here, one row per lecture."
            />
          </Card>
        )
      ) : null}

      {tab === "marks" ? (
        <div className="max-w-3xl">
          <MarksTable components={components} />
          <Card className="mt-5 p-4">
            <h3 className="text-[length:var(--text-small)] font-semibold">The two thresholds that actually matter</h3>
            <p className="text-[length:var(--text-small)] text-muted mt-1.5 leading-relaxed">
              You need <strong className="text-fg">40% of the internals</strong> (CLA 30 +
              Mid-Sem 20 = 50 marks, so 20 of them) <strong className="text-fg">and</strong>{" "}
              <strong className="text-fg">40% of the end-sem</strong> (40 of 100 raw marks), as
              two separate hurdles. Clearing one does not rescue the other. On top of that,
              under 75% attendance means you are not allowed to sit the end-sem at all.
            </p>
          </Card>
        </div>
      ) : null}

      {tab === "lab" && hasLab ? (
        <div className="space-y-4">
          <Card>
            <CardHead
              title={subject.lab_title ?? "Lab"}
              sub={[subject.lab_code, subject.lab_ltpc, subject.lab_teacher]
                .filter(Boolean)
                .join("\u2002\u2002")}
              right={
                <Ring
                  value={
                    experiments.filter((e) => e.status === "done").length / experiments.length
                  }
                  size={34}
                  stroke={3}
                />
              }
            />
            <ul className="divide-y divide-[var(--border)]">
              {experiments.map((e) => (
                <ExperimentRow key={e.id} exp={e} />
              ))}
            </ul>
          </Card>
          <Card className="p-4">
            <p className="text-[length:var(--text-small)] text-muted leading-relaxed flex gap-2.5">
              <FlaskConical size={15} className="shrink-0 mt-0.5 text-sc" />
              <span>
                Lab files are checked at the start of every session. The second checkbox on each
                row tracks whether it&rsquo;s written up — keep that current and the lab marks
                take care of themselves.
              </span>
            </p>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
