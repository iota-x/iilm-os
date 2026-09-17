import type { SeedSubject } from "../types";

export const digitalElectronics: SeedSubject = {
  slug: "digital-electronics",
  name: "Digital Electronics and Computer Organization",
  shortName: "DE+CO",
  code: null,
  credits: 3,
  ltpc: "3-0-2-4",
  color: "orange",
  status: "empty",
  teacher: "Dr Puja Acharya",
  labTeacher: "Dr. Sambhavi",
  hasLab: true,
  labTitle: "Digital Electronics and Computer Organization Lab",
  labCode: null,
  labLtpc: "0-0-2-1",
  overview:
    "No material yet. You have three lectures and one lab a week for this subject and nothing in your folder — this is the biggest gap in your semester, not the smallest.",
  midsemScope: "Unknown. Get the course plan.",
  midsemConfirmed: false,
  objectives: [],
  outcomes: [],
  units: [],
  experiments: [],
  components: [
    {
      name: "Continuous Learning Assessment",
      marks: 30,
      weightage: 30,
      scope: "Unknown",
      timing: "Throughout the semester",
      co: "Unknown",
      track: "theory",
    },
    {
      name: "Mid-Term Examination",
      marks: 20,
      weightage: 20,
      scope: "Unknown",
      timing: "5–11 Oct",
      co: "Unknown",
      track: "theory",
    },
    {
      name: "End-Term Examination",
      marks: 100,
      weightage: 50,
      scope: "Unknown",
      timing: "End-Term",
      co: "Unknown",
      track: "theory",
    },
    {
      name: "Lab — Quizzes + Execution & Viva",
      marks: 100,
      weightage: 100,
      scope: "Unknown",
      timing: "Continuous",
      co: "Unknown",
      track: "lab",
    },
  ],
  strategies: [
    {
      title: "Read this one first — this is your actual emergency",
      body: `You told me to leave this blank because you have no resources for it. Here's why that's the wrong call.

Look at your week as Group 2:
• **Tuesday 14:00–15:00** — DE+CO lecture, Room 301
• **Wednesday 11:10–12:10** — DE+CO lecture, Room 94
• **Thursday 12:20–13:20** — DE+CO lecture, Room 94
• **Thursday 14:00–16:10** — DE+CO Lab, Lab 7-B2-104, Dr. Sambhavi

That's three lectures plus a two-hour lab — more weekly contact time than Foundation of AI, and the same as Calculus. It carries the same 100 marks as everything else, it almost certainly has a mid-sem on 5–11 Oct like the others, and there's a lab file being checked that you have no experiment list for.

Having no material doesn't make it low priority. It makes it the one subject where you currently cannot even measure how far behind you are.`,
    },
    {
      title: "The three things to do this week, in order",
      body: `**1. Get the course plan.** Same place you got the Calculus and C ones — LMS, or ask a classmate for the PDF, or email Dr Puja Acharya directly. One message. Every other subject's plan gave the exact unit list, session topics, mid-sem scope and marking scheme, and this one will too.

**2. Find out what the lab expects.** Ask Dr. Sambhavi for the experiment list, and ask a classmate how many experiments the class has already done. You're a month late — there is a lab file backlog here and you need its size.

**3. Photograph someone's notes for the four weeks you missed.** Not for understanding — for scope. You need to know whether the class is on number systems or already on flip-flops.

All three are messages, not study. Total cost maybe 20 minutes. Do them before you open another textbook.`,
    },
    {
      title: "What this subject almost certainly contains",
      body: `Until the real plan arrives, a first-semester "Digital Electronics and Computer Organization" course at an Indian engineering school is reliably built from:

**Digital electronics half** — number systems and base conversion, binary arithmetic, 1's and 2's complement, BCD/Gray/ASCII codes, Boolean algebra and De Morgan's theorems, logic gates, SOP/POS forms, K-map simplification, combinational circuits (adders, subtractors, multiplexers, decoders, encoders, comparators), then sequential circuits (flip-flops, registers, counters).

**Computer organization half** — von Neumann architecture, instruction formats and addressing modes, the instruction cycle, CPU datapath and control unit, memory hierarchy, cache mapping, and I/O organisation.

Use that as a scaffold to start on number systems and Boolean algebra *now* — those are foundational, they're in every version of this course, and they're where the first unit always starts. Replace this guess with the real plan the moment you have it.

Don't build notes deep on this guess. Build on number systems, K-maps and Boolean algebra only; those are safe.`,
    },
  ],
  textbooks: [],
  references: [],
  localFiles: [],
  gaps: [
    "Everything. No course plan, no syllabus, no units, no slides, no lab experiment list, no course code.",
    "There is a lab (Thursday 14:00–16:10, Lab 7-B2-104, Dr. Sambhavi) with a lab file you have no record of.",
    "You started a month late — find out how many lectures and lab sessions have already happened.",
  ],
};
