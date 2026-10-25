import { CATALOGS } from "@/data/catalogs";
import { cohortLabel, universityById } from "@/lib/universities";

/** A university's classes, labelled for pickers. "Another programme" has no board worth posting to. */
export function classesOf(universityId: string | null | undefined) {
  return (universityById(universityId)?.cohorts ?? [])
    .filter((c) => c.section || c.catalog)
    .map((c) => ({ id: c.id, label: c.section ? `Section ${c.section}` : cohortLabel(c), full: cohortLabel(c) }));
}

/** Subject short names by slug, across every syllabus the university runs. */
export function subjectNamesOf(universityId: string | null | undefined): Map<string, string> {
  const names = new Map<string, string>();
  for (const c of universityById(universityId)?.cohorts ?? []) {
    for (const s of CATALOGS[c.catalog ?? ""]?.subjects ?? []) names.set(s.slug, s.shortName);
  }
  return names;
}
