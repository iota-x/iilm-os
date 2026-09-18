import { InboxUpload } from "@/components/inbox-upload";
import { Card, CardHead } from "@/components/ui";
import { getInboxFiles, getProfile, getSlots, getSubjects } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function InboxPage() {
  const [files, subjects, slots, profile] = await Promise.all([
    getInboxFiles(),
    getSubjects(),
    getSlots(),
    getProfile(),
  ]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[length:var(--text-page)]">Inbox</h1>
        <p className="mt-0.5 max-w-2xl text-[length:var(--text-small)] leading-relaxed text-muted">
          Somewhere to put what actually happened in class — board photos, your handwritten notes,
          lecture PDFs, tutorial sheets.
        </p>
      </div>

      <InboxUpload
        files={files}
        subjects={subjects}
        slots={slots}
        labGroup={profile?.lab_group ?? 2}
      />

      <Card>
        <CardHead title="What this does, and doesn't" />
        <div className="space-y-2 px-4 py-3 text-[length:var(--text-small)] leading-relaxed text-muted">
          <p>
            Uploading stores the file privately against your account. It does <strong>not</strong>{" "}
            change anything in the app on its own — nothing here reads your handwriting or turns a
            photo into topics.
          </p>
          <p>
            It becomes useful when you ask Claude to do something with it:{" "}
            <em>&ldquo;turn Tuesday&rsquo;s board photos into checkpoints on partial
            derivatives&rdquo;</em>, <em>&ldquo;make questions out of this tutorial sheet&rdquo;</em>,{" "}
            <em>&ldquo;the teacher said Unit 4 is out of the mid-sem — fix the scope&rdquo;</em>.
            That is the step that changes the syllabus data, the question bank and your notes.
          </p>
          <p className="text-subtle">
            Files live in the same private vault as your note screenshots — only you can read them,
            and they are served through the app rather than a public link.
          </p>
        </div>
      </Card>
    </div>
  );
}
