export type TopicStatus = "not_started" | "learning" | "revising" | "mastered";
export type TaskStatus = "todo" | "doing" | "done" | "skipped";
export type TaskKind = "learn" | "drill" | "revise" | "admin" | "lab" | "mock" | "custom";
export type ResourceKind =
  | "video"
  | "playlist"
  | "article"
  | "practice"
  | "pdf"
  | "book"
  | "tool";

export interface Profile {
  id: string;
  display_name: string | null;
  lab_group: 1 | 2;
  theme: string;
}

export interface Subject {
  id: string;
  slug: string;
  name: string;
  short_name: string;
  code: string | null;
  credits: number;
  ltpc: string | null;
  color: string;
  status: "complete" | "partial" | "empty";
  teacher: string | null;
  lab_teacher: string | null;
  has_lab: boolean;
  lab_title: string | null;
  lab_code: string | null;
  lab_ltpc: string | null;
  overview: string | null;
  midsem_scope: string | null;
  midsem_confirmed: boolean;
  objectives: string[];
  gaps: string[];
  local_files: string[];
  sort_order: number;
}

export interface Unit {
  id: string;
  subject_id: string;
  number: number;
  title: string;
  sessions: number | null;
  co: string | null;
  assessment: string | null;
  in_midsem: boolean;
}

export interface Topic {
  id: string;
  subject_id: string;
  unit_id: string;
  code: string;
  session: string | null;
  title: string;
  weight: number;
  in_midsem: boolean;
  outcome: string | null;
  status: TopicStatus;
  confidence: number;
  last_studied_at: string | null;
  sort_order: number;
}

export interface Checkpoint {
  id: string;
  topic_id: string;
  title: string;
  done: boolean;
  sort_order: number;
}

export type QuestionKind = "pyq" | "practice" | "quiz" | "example" | "viva";
export type AttemptOutcome = "correct" | "partial" | "wrong";

export interface Question {
  id: string;
  subject_id: string | null;
  topic_id: string | null;
  prompt: string;
  answer: string | null;
  source: string | null;
  marks: number | null;
  kind: QuestionKind;
  created_at: string;
}

export interface Attempt {
  id: string;
  question_id: string;
  outcome: AttemptOutcome;
  note: string | null;
  created_at: string;
}

export interface Experiment {
  id: string;
  subject_id: string;
  number: number;
  title: string;
  co: string | null;
  objective: string | null;
  tasks: string[];
  in_midsem: boolean;
  status: "not_started" | "in_progress" | "done";
  file_done: boolean;
  notes: string | null;
}

export interface Component {
  id: string;
  subject_id: string;
  name: string;
  marks: number;
  weightage: number;
  scope: string | null;
  timing: string | null;
  co: string | null;
  track: "theory" | "lab";
  obtained: number | null;
  status: "upcoming" | "done" | "missed";
  sort_order: number;
}

export interface Strategy {
  id: string;
  subject_id: string;
  title: string;
  body: string;
  sort_order: number;
  pinned: boolean;
}

export interface Outcome {
  id: string;
  subject_id: string;
  code: string;
  text: string;
  bloom: string | null;
}

export interface Book {
  id: string;
  subject_id: string;
  title: string;
  author: string | null;
  note: string | null;
  kind: "textbook" | "reference";
}

export interface Resource {
  id: string;
  subject_id: string | null;
  unit_id: string | null;
  topic_id: string | null;
  title: string;
  url: string;
  kind: ResourceKind;
  source: string | null;
  rank: number;
  minutes: number | null;
  why: string | null;
  is_curated: boolean;
  useful: boolean | null;
  created_at: string;
}

export interface Note {
  id: string;
  subject_id: string | null;
  unit_id: string | null;
  topic_id: string | null;
  title: string;
  content: string;
  tags: string[];
  pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface Attachment {
  id: string;
  note_id: string | null;
  subject_id: string | null;
  topic_id: string | null;
  storage_path: string;
  filename: string | null;
  mime: string | null;
  size_bytes: number | null;
  caption: string | null;
  created_at: string;
}

export interface Task {
  id: string;
  subject_id: string | null;
  topic_id: string | null;
  title: string;
  detail: string | null;
  topic_codes: string[];
  due_date: string | null;
  minutes: number | null;
  kind: TaskKind;
  status: TaskStatus;
  source: "plan" | "manual";
  sort_order: number;
  completed_at: string | null;
}

export interface PlanDay {
  id: string;
  date: string;
  phase: string | null;
  budget: number | null;
  headline: string | null;
  note: string | null;
}

export interface Slot {
  id: string;
  day: string;
  periods: number[];
  start_time: string;
  end_time: string;
  subject_id: string | null;
  kind: "lecture" | "lab";
  lab_group: number | null;
  room: string | null;
  teacher: string | null;
}

export interface Exam {
  id: string;
  subject_id: string | null;
  key: string;
  name: string;
  kind: string;
  exam_date: string | null;
  window_label: string | null;
  max_marks: number | null;
  weightage: number | null;
  scope: string | null;
  obtained: number | null;
  status: string;
}

export interface Attendance {
  id: string;
  subject_id: string;
  held: number;
  attended: number;
}

export interface StudySession {
  id: string;
  subject_id: string | null;
  topic_id: string | null;
  started_at: string;
  ended_at: string | null;
  minutes: number | null;
  kind: string;
}
