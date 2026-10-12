import type { SeedSubject } from "../types";

// Added with the 12-10-2026 timetable (w.e.f. 07-09-2026). No course plan yet,
// so everything beyond the name, teacher and slots is unknown.
export const entrepreneurMindset: SeedSubject = {
  slug: "entrepreneur-mindset",
  name: "Entrepreneur Mindset",
  shortName: "EM",
  code: null,
  credits: 0,
  ltpc: "",
  color: "slate",
  status: "empty",
  teacher: "Dr. Sangeeta",
  hasLab: false,
  overview:
    "New on the timetable from October 2026: two lectures a week on Fridays with Dr. Sangeeta. Add the course plan when it's shared to fill in units, outcomes and assessment.",
  midsemScope: "Not part of the October mid-sems (the course started after them).",
  midsemConfirmed: false,
  objectives: [],
  outcomes: [],
  units: [],
  experiments: [],
  components: [],
  strategies: [],
  textbooks: [],
  references: [],
  localFiles: [],
  gaps: [
    "No course plan yet: ask Dr. Sangeeta for the course code, credits, units and how it's assessed.",
  ],
};
