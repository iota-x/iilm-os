/**
 * The content packs a cohort (lib/universities) points at. Server-only in
 * practice — they pull in every syllabus file.
 *
 * - a catalog is one programme-semester's syllabus: subjects with units and
 *   topics, exams, starter questions, curated resources, and the notes/
 *   explainers/sprints keyed to its topic codes;
 * - a timetable is one section's weekly slots;
 * - a grading pack is a university's marking scheme, grades and SGPA rules.
 *
 * Adding a university's semester = a new folder of subject files like
 * ./subjects, then one entry in each map below.
 */
import { subjects as iilmSubjects, SEMESTER, exams as iilmExams, CREDIT_COURSES, GRADES, PROGRESSION, SGPA_RULE } from "./index";
import { slots as iilmSectionE } from "./timetable";
import { questions as iilmQuestions } from "./questions";
import { resources as iilmResources } from "./resources";
import { planDays as iilmPlan } from "./plan";
import { coverage, coverageOf, notesGapOf, unitGaps } from "./coverage";
import { sprints, sprintFor } from "./sprints";
import type { SeedExam, SeedQuestion, SeedResource, SeedSlot, SeedSubject } from "./types";

export interface Catalog {
  id: string;
  semester: { name: string; number: number; session: string; school: string; startDate: string };
  subjects: SeedSubject[];
  exams: SeedExam[];
  questions: SeedQuestion[];
  resources: SeedResource[];
  /** one person's day-by-day plan, opt-in only (seed --with-plan) */
  plan: typeof iilmPlan;
  /** a line under the Exams heading: when the papers are, in order */
  examsIntro: string | null;
  /** class-notes coverage, explainers and sprints keyed to this catalog's topic codes */
  content: CatalogContent;
}

export interface CatalogContent {
  coverage: typeof coverage;
  coverageOf: typeof coverageOf;
  notesGapOf: typeof notesGapOf;
  unitGaps: typeof unitGaps;
  sprints: typeof sprints;
  sprintFor: typeof sprintFor;
}

export interface Grading {
  /** how a theory course's 100 marks split, drawn to scale on /exams */
  scheme: { key: string; name: string; weight: number; of: string; body: string }[];
  schemeNote: string;
  grades: readonly { grade: string; min: number; max: number; points: number; label: string }[];
  passNote: string;
  sgpa: { formula: string; example: string; cgpa: string };
  progression: string[];
  /** courses that carry credits, for the SGPA calculator */
  credits: readonly { slug: string; name: string; credits: number; lab?: boolean }[];
}

const NO_CONTENT: CatalogContent = {
  coverage: {},
  coverageOf: () => null,
  notesGapOf: () => undefined,
  unitGaps: {},
  sprints: [],
  sprintFor: () => null,
};

export const CATALOGS: Record<string, Catalog> = {
  "iilm-btech-cse-s1": {
    id: "iilm-btech-cse-s1",
    semester: {
      name: SEMESTER.name,
      number: SEMESTER.number,
      session: SEMESTER.session,
      school: SEMESTER.school,
      startDate: SEMESTER.startDate,
    },
    subjects: iilmSubjects,
    exams: iilmExams,
    questions: iilmQuestions,
    resources: iilmResources,
    plan: iilmPlan,
    examsIntro:
      "End-semesters run 4–11 Dec 2026: DE+CO Fri 4, Calculus Mon 7, AI Wed 9, C Fri 11.",
    content: { coverage, coverageOf, notesGapOf, unitGaps, sprints, sprintFor },
  },
};

export const TIMETABLES: Record<string, SeedSlot[]> = {
  "iilm-btech-cse-s1-e": iilmSectionE,
};

export const GRADINGS: Record<string, Grading> = {
  iilm: {
    scheme: [
      {
        key: "cla",
        name: "Continuous assessment",
        weight: 30,
        of: "30 marks",
        body: "Class Test 10 · Assignment 10 · Quiz 5 · Project 15 · Innovative Practices 15. Faculty pick at least two; the total can't exceed 30.",
      },
      {
        key: "mse",
        name: "Mid-semester",
        weight: 20,
        of: "20 marks",
        body: "One written paper, 5–8 Oct (done). Roughly the first two or three units; each course plan set its own scope.",
      },
      {
        key: "ese",
        name: "End-semester",
        weight: 50,
        of: "100 marks, halved",
        body: "The whole syllabus in one 3-hour paper, 4–11 Dec: Section A 5×4, B 4×10, C 2×20. Marked out of 100 and scaled to half your grade.",
      },
    ],
    schemeNote:
      "Identical across every theory course in the programme, taken verbatim from your Applied Calculus and Programming in C course plans. Lab courses are marked differently — see rule three.",
    grades: GRADES,
    passNote:
      "A pass is 40 total — a D — and it still needs 40% in internals and 40% on the paper separately (rule one below).",
    sgpa: SGPA_RULE,
    progression: PROGRESSION,
    credits: CREDIT_COURSES,
  },
};

export function catalogOf(id: string | null | undefined): Catalog | null {
  return (id && CATALOGS[id]) || null;
}

/** Notes coverage, explainers and sprints for a catalog — empty for one without them. */
export function contentOf(id: string | null | undefined): CatalogContent {
  return catalogOf(id)?.content ?? NO_CONTENT;
}

export function timetableOf(id: string | null | undefined): SeedSlot[] {
  return (id && TIMETABLES[id]) || [];
}

export function gradingOf(id: string | null | undefined): Grading | null {
  return (id && GRADINGS[id]) || null;
}
