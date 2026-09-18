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

  // No page heading here on purpose — the nav already says Notes, and the
  // writing surface is worth the 90px it would have cost.
  return (
    <Suspense>
      <NotesShell initialNotes={notes} subjects={subjects} topics={topics} />
    </Suspense>
  );
}
