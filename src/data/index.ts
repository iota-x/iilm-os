import { calculus } from "./subjects/calculus";
import { programmingC } from "./subjects/programming-c";
import { designThinking } from "./subjects/design-thinking";
import { digitalElectronics } from "./subjects/digital-electronics";
import { aiAutomation } from "./subjects/ai-automation";
import { linux } from "./subjects/linux";
import type { SeedSubject, SeedExam } from "./types";

export const subjects: SeedSubject[] = [
  calculus,
  programmingC,
  digitalElectronics,
  designThinking,
  aiAutomation,
  linux,
];

export const SEMESTER = {
  name: "B.Tech CSE — Semester I",
  number: 1,
  section: "B.Tech Sem 1 E",
  batch: "2026-30",
  session: "2026-27",
  university: "IILM University, Gurugram",
  school: "School of Computer Science & Engineering",
  startDate: "2026-08-06",
  timetableGenerated: "2026-08-11",
};

/**
 * The marking scheme is identical across every theory course in the programme —
 * taken verbatim from the Applied Calculus and Programming in C course plans.
 */
export const MARKING = {
  cla: { marks: 30, weightage: 30, label: "Continuous Learning Assessment" },
  mse: { marks: 20, weightage: 20, label: "Mid-Semester Examination" },
  ese: { marks: 100, weightage: 50, label: "End-Semester Examination" },
  claComponents: [
    { code: "C1", name: "Class Test", marks: 10 },
    { code: "C2", name: "Assignment", marks: 10 },
    { code: "C3", name: "Quiz", marks: 5 },
    { code: "C4", name: "Project", marks: 15 },
    { code: "C5", name: "Innovative Practices", marks: 15 },
  ],
  labScheme: [
    { code: "C1", name: "Quiz (5 compulsory × 10)", marks: 50 },
    { code: "C2", name: "Execution & Viva Voce (5 compulsory × 10)", marks: 50 },
  ],
  rules: [
    "Total internal assessment carries 30 marks. A minimum of two different assessment components must be used in every course.",
    "You must score at least 40% in the Internal Assessment (CLA + MSE) **and** at least 40% in the End-Semester Examination, separately. Failing either one fails the course, no matter how good the other is.",
    "Minimum 75% attendance in every subject. Below that you are not permitted to sit the end-semester examination at all.",
    "Lab courses are 100% continuous assessment — there is no written end-semester paper for them.",
    "Any change to the approved assessment plan needs HoD approval and must be communicated to you in advance.",
    "Feedback on assessments is due within 10 working days of submission. To appeal an end-term mark, raise it with your tutor first, then the Controller of Examination within 3 business days of the result.",
  ],
  passingExample: {
    note: "What 40%/40% actually means in marks",
    internal: "CLA (30) + MSE (20) = 50 internal marks. You need 20 of those 50.",
    external: "ESE is marked out of 100 and scaled to 50. You need 40 of the 100 raw marks.",
  },
};

export const exams: SeedExam[] = [
  {
    key: "mse-2026",
    name: "Mid-Semester Examinations",
    kind: "mse",
    subject: null,
    date: "2026-10-05",
    window: "5–11 Oct 2026",
    maxMarks: 20,
    weightage: 20,
    scope:
      "Calculus Units I–III, Programming in C Units 1–4. Other subjects' scope not yet confirmed.",
  },
  {
    key: "mse-calculus",
    name: "Applied Calculus — Mid-Term",
    kind: "mse",
    subject: "applied-calculus",
    date: null,
    window: "5–11 Oct 2026",
    maxMarks: 20,
    weightage: 20,
    scope: "Units I, II & III — conceptual, analytical and application-based questions. CO1, CO2.",
  },
  {
    key: "mse-c",
    name: "Programming in C — Mid-Term",
    kind: "mse",
    subject: "programming-in-c",
    date: null,
    window: "5–11 Oct 2026",
    maxMarks: 20,
    weightage: 20,
    scope: "Units 1, 2, 3 & 4 — conceptual, analytical and application-based questions. CO1, CO2.",
  },
  {
    key: "mse-deco",
    name: "Digital Electronics & Computer Organization — Mid-Term",
    kind: "mse",
    subject: "digital-electronics",
    date: null,
    window: "5–11 Oct 2026",
    maxMarks: 20,
    weightage: 20,
    scope: "Not confirmed — get the course plan.",
  },
  {
    key: "mse-cdt",
    name: "Computational Design Thinking — Mid-Term",
    kind: "mse",
    subject: "computational-design-thinking",
    date: null,
    window: "5–11 Oct 2026",
    maxMarks: 20,
    weightage: 20,
    scope: "Not confirmed — expect Units 1–3.",
  },
  {
    key: "mse-ai",
    name: "Foundation of AI and Automation — Mid-Term",
    kind: "mse",
    subject: "foundation-of-ai",
    date: null,
    window: "5–11 Oct 2026",
    maxMarks: 20,
    weightage: 20,
    scope: "Not confirmed — Unit 1 certain, expect Units 1–3.",
  },
];

export { calculus, programmingC, designThinking, digitalElectronics, aiAutomation, linux };
export * from "./types";
export * from "./timetable";
export * from "./plan";
export * from "./resources";
