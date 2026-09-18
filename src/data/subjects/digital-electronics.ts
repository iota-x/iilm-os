import type { SeedSubject } from "../types";

export const digitalElectronics: SeedSubject = {
  slug: "digital-electronics",
  name: "Digital Electronics and Computer Organization",
  shortName: "DE+CO",
  code: null,
  credits: 3,
  ltpc: "3-0-2-4",
  color: "orange",
  status: "partial",
  teacher: "Dr Puja Acharya",
  labTeacher: "Dr. Sambhavi",
  hasLab: true,
  labTitle: "Digital Electronics and Computer Organization Lab",
  labCode: null,
  labLtpc: "0-0-2-1",
  overview:
    "Still no course plan. What is known: the class is on Karnaugh maps right now, and there is a class test on them on Monday 21 September. Unit 1 below is reconstructed backwards from that — Boolean algebra is what K-maps minimise, canonical forms are what you draw them from — and is the only part of this subject with any structure yet. Three lectures and a two-hour lab a week.",
  midsemScope: "Unknown until the course plan arrives. Unit 1 as listed will be in it whatever the plan says.",
  midsemConfirmed: false,
  objectives: [],
  outcomes: [],
  units: [
    {
      // Reconstructed, not from a course plan: the class test on Monday 21 Sept
      // is on K-maps, so this unit is the material a K-map test requires,
      // in the order it has to be learned. Replace when the plan arrives.
      number: 1,
      title: "Boolean Algebra and Logic Minimisation (reconstructed)",
      sessions: 0,
      co: "Unknown",
      assessment: "Class test on K-maps — Mon 21 Sept",
      inMidsem: true,
      topics: [
        {
          code: "deco-u1-boolean",
          session: "—",
          title: "Boolean algebra: laws, theorems and De Morgan",
          weight: 4,
          inMidsem: true,
          outcome:
            "Simplify a Boolean expression by hand using the identities, and apply De Morgan's theorems in both directions.",
        },
        {
          code: "deco-u1-gates",
          session: "—",
          title: "Logic gates and truth tables; NAND and NOR as universal gates",
          weight: 3,
          inMidsem: true,
          outcome: "Write the truth table for any gate and build any gate from NAND alone.",
        },
        {
          code: "deco-u1-canonical",
          session: "—",
          title: "Minterms, maxterms, and canonical SOP and POS forms",
          weight: 4,
          inMidsem: true,
          outcome:
            "Convert between a truth table, Σm(...) / ΠM(...) notation, and a canonical expression without error.",
        },
        {
          code: "deco-u1-kmap",
          session: "—",
          title: "Karnaugh maps: 2, 3 and 4 variables",
          weight: 5,
          inMidsem: true,
          outcome:
            "Lay out the Gray-code ordered map, plot the minterms, group in powers of two including wrap-around, and read off the minimal SOP.",
        },
        {
          code: "deco-u1-kmap-pos",
          session: "—",
          title: "POS minimisation with K-maps (grouping the zeros)",
          weight: 4,
          inMidsem: true,
          outcome: "Produce the minimal POS from the same map, and know when it beats the SOP.",
        },
        {
          code: "deco-u1-kmap-dontcare",
          session: "—",
          title: "Don't-care conditions",
          weight: 4,
          inMidsem: true,
          outcome: "Use X cells to enlarge a group only when it shortens the result.",
        },
        {
          code: "deco-u1-implicants",
          session: "—",
          title: "Prime implicants, essential prime implicants and redundant groups",
          weight: 4,
          inMidsem: true,
          outcome:
            "Identify every essential prime implicant first, then cover what remains with the fewest extra groups — and explain why a group is redundant.",
        },
        {
          code: "deco-u1-kmap5",
          session: "—",
          title: "5-variable K-maps (two 4-variable maps)",
          weight: 2,
          inMidsem: true,
          outcome: "Extend the method to five variables using two stacked maps.",
        },
      ],
    },
  ],
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
      title: "Monday's test — what a K-map question actually asks",
      body: `A K-map question almost always comes as **F(A,B,C,D) = Σm(0, 2, 5, 7, 8, 10, 13, 15)**, sometimes with **+ d(...)** for don't-cares, and asks for the minimal SOP (or POS). The marks are for the *method*, so show all of it:

1. Draw the 4×4 map with **Gray code** ordering on both axes (00, 01, 11, 10 — never 00, 01, 10, 11). Getting this wrong loses every mark after it.
2. Plot 1s at the minterms, X at the don't-cares, 0 elsewhere.
3. Group in powers of two — 1, 2, 4, 8, 16 — as large as possible, edges wrap around, corners are a group of four.
4. Mark the **essential** prime implicants first (a 1 covered by exactly one group), then cover the leftovers with the fewest groups.
5. Write each group as a product term: variables that don't change across the group survive, the rest drop.

Practise until step 1 is automatic. Then do ten timed ones; the solver link under Resources checks your answers.`,
    },
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
    "The course plan. Unit 1 above is reconstructed from the fact that the class is on K-maps — the real unit list, session plan, mid-sem scope, marking scheme and course code are all still unknown.",
    "There is a lab (Thursday 14:00–16:10, Lab 7-B2-104, Dr. Sambhavi) with a lab file you have no record of.",
    "You started a month late — find out how many lectures and lab sessions have already happened.",
  ],
};
