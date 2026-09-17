// Shape of the seeded academic data.
// These files are the source of truth; `npm run seed` pushes them into Supabase.

export type SubjectStatus = "complete" | "partial" | "empty";

export interface SeedTopic {
  /** stable slug, e.g. "calc-u1-limits" — used as the upsert key */
  code: string;
  /** session label from the course plan, e.g. "S1-S2" */
  session: string;
  title: string;
  /** rough exam weight, 1 (minor) to 5 (always asked) */
  weight: number;
  /** falls inside the mid-sem syllabus */
  inMidsem: boolean;
  /** one-line "what you actually need to be able to do" */
  outcome?: string;
  /** the steps inside this topic, in the order you'd work them */
  subtopics?: string[];
}

export interface SeedUnit {
  number: number;
  title: string;
  sessions: number;
  co: string;
  assessment: string;
  inMidsem: boolean;
  topics: SeedTopic[];
}

export interface SeedExperiment {
  number: number;
  title: string;
  co: string;
  objective: string;
  tasks: string[];
  inMidsem: boolean;
}

export interface SeedOutcome {
  code: string;
  text: string;
  bloom: string;
}

export interface SeedComponent {
  name: string;
  marks: number;
  weightage: number;
  scope: string;
  timing: string;
  co: string;
  track: "theory" | "lab";
}

export interface SeedStrategy {
  title: string;
  body: string;
}

export interface SeedBook {
  title: string;
  author: string;
  note?: string;
}

export interface SeedResource {
  /** topic code this hangs off, or unit key like "calc-u1", or subject slug */
  target: string;
  title: string;
  url: string;
  kind: "video" | "playlist" | "article" | "practice" | "pdf" | "book" | "tool";
  source: string;
  /** 1 = best. Resources are shown in rank order. */
  rank: number;
  minutes?: number;
  why: string;
}

export interface SeedSubject {
  slug: string;
  name: string;
  shortName: string;
  code: string | null;
  credits: number;
  ltpc: string;
  /** tailwind-ish accent token defined in globals.css */
  color: string;
  status: SubjectStatus;
  teacher: string | null;
  labTeacher?: string | null;
  hasLab: boolean;
  labTitle?: string;
  labCode?: string | null;
  labLtpc?: string;
  overview: string;
  /** what the mid-sem actually covers, verbatim from the course plan where known */
  midsemScope: string;
  /** null when we don't have the course plan yet */
  midsemConfirmed: boolean;
  objectives: string[];
  outcomes: SeedOutcome[];
  units: SeedUnit[];
  experiments: SeedExperiment[];
  components: SeedComponent[];
  strategies: SeedStrategy[];
  textbooks: SeedBook[];
  references: SeedBook[];
  /** files already sitting in the user's iilm folder */
  localFiles: string[];
  /** what's missing, shown as a prompt in the UI */
  gaps: string[];
}

export type Weekday = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat";

export interface SeedSlot {
  day: Weekday;
  /** period number(s) this slot spans */
  periods: number[];
  start: string;
  end: string;
  subject: string; // subject slug
  kind: "lecture" | "lab";
  group: 1 | 2 | null;
  room: string;
  teacher: string;
}

export interface SeedExam {
  key: string;
  name: string;
  kind: "mse" | "ese" | "quiz" | "class_test" | "assignment" | "project" | "viva";
  subject: string | null;
  date: string | null;
  window: string | null;
  maxMarks: number;
  weightage: number;
  scope: string;
}
