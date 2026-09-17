import { Suspense } from "react";
import { getNotes, getSubjects, getTopics } from "@/lib/queries";
import { NotesShell } from "@/components/notes/notes-shell";

export const dynamic = "force-dynamic";

export default async function NotesPage() {
  const [notes, subjects, topics] = await Promise.all([
    getNotes(),
    getSubjects(),
    getTopics(),
  ]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-[20px] font-semibold tracking-tight">Notes</h1>
        <p className="text-[13px] text-muted mt-0.5">
          Markdown with LaTeX. Paste a screenshot straight into the editor and it uploads.
        </p>
      </div>
      <Suspense>
        <NotesShell initialNotes={notes} subjects={subjects} topics={topics} />
      </Suspense>
    </div>
  );
}
