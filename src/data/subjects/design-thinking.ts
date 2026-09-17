import type { SeedSubject } from "../types";

export const designThinking: SeedSubject = {
  slug: "computational-design-thinking",
  name: "Computational Design Thinking",
  shortName: "CDT",
  code: "CSE26104",
  credits: 3,
  ltpc: "3-0-0-3",
  color: "emerald",
  status: "partial",
  teacher: "Dr. Ankita",
  hasLab: false,
  overview:
    "Combining computational thinking's logical, systematic reasoning with design thinking's creative, human-centred approach to solve real-world problems. Decomposition, pattern recognition, abstraction and algorithm design, applied through empathy, problem framing and requirements definition.",
  midsemScope:
    "Not confirmed — the course plan isn't in your folder yet. Mid-sems across your other subjects cover roughly the first 60% of the syllabus, so expect Units 1–3.",
  midsemConfirmed: false,
  objectives: [
    "Apply computational thinking — decomposition, pattern recognition, abstraction, algorithm design.",
    "Apply human-centred design methods to frame problems around real users.",
    "Move from an ill-structured real-world situation to a precise, solvable problem statement.",
    "Translate a problem statement into functional and technical requirements.",
  ],
  outcomes: [],
  units: [
    {
      number: 1,
      title: "Foundations of Computational Design Thinking and Problem Solving",
      sessions: 9,
      co: "CO1",
      assessment: "Not confirmed",
      inMidsem: true,
      topics: [
        {
          code: "cdt-u1-intro",
          session: "S1",
          title: "Introduction to Computational Design Thinking",
          weight: 4,
          inMidsem: true,
          outcome:
            "Define CDT as the fusion of computational rigour and human-centred creativity; name where it's used (AI, product design, business strategy, software).",
        },
        {
          code: "cdt-u1-elements",
          session: "S2",
          title:
            "Key elements of computational thinking: decomposition, pattern recognition, abstraction, algorithm design",
          weight: 5,
          inMidsem: true,
          outcome:
            "Define all four and apply each to a worked example. This is the single most examinable idea in the unit.",
        },
        {
          code: "cdt-u1-lenses",
          session: "S3",
          title: "Design thinking lens vs computational thinking lens",
          weight: 4,
          inMidsem: true,
          outcome:
            "Reproduce the comparison table: 'Who is this for / What are the smaller parts', 'What do they feel / What patterns apply', and so on.",
        },
        {
          code: "cdt-u1-problems",
          session: "S4",
          title: "Nature of problems: well-structured vs ill-structured problems",
          weight: 5,
          inMidsem: true,
          outcome:
            "Classify a given problem and justify it by clarity of goal, known constraints, and whether a single correct solution exists.",
        },
        {
          code: "cdt-u1-solver",
          session: "S5",
          title: "Characteristics of an effective problem solver",
          weight: 3,
          inMidsem: true,
          outcome: "List and briefly explain each trait.",
        },
        {
          code: "cdt-u1-models",
          session: "S6",
          title: "Problem-solving models: the IDEAL model and Polya's four-step method",
          weight: 5,
          inMidsem: true,
          outcome:
            "Expand IDEAL (Identify, Define, Explore, Act, Look back) and Polya (Understand, Plan, Carry out, Look back), and compare them.",
        },
        {
          code: "cdt-u1-process",
          session: "S7",
          title:
            "Computational problem-solving process: Understand → Plan → Solve → Verify → Reflect",
          weight: 5,
          inMidsem: true,
          outcome: "Walk a given problem through all five stages.",
        },
        {
          code: "cdt-u1-hcd",
          session: "S8",
          title: "Human-centred design principles; empathy mapping and user interviews",
          weight: 5,
          inMidsem: true,
          outcome:
            "Draw a four-quadrant empathy map (Says / Thinks / Does / Feels) and write good open-ended interview questions.",
        },
        {
          code: "cdt-u1-requirements",
          session: "S9",
          title:
            "Problem definition: user-centred problem statements; identifying functional and technical requirements",
          weight: 5,
          inMidsem: true,
          outcome:
            "Write a POV statement ([user] needs [need] because [insight]) and split requirements into functional vs technical.",
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
      scope: "Class test / assignment / quiz / project / innovative practices",
      timing: "Throughout the semester",
      co: "Not confirmed",
      track: "theory",
    },
    {
      name: "Mid-Term Examination",
      marks: 20,
      weightage: 20,
      scope: "Not confirmed — expect Units 1–3",
      timing: "5–11 Oct",
      co: "Not confirmed",
      track: "theory",
    },
    {
      name: "End-Term Examination",
      marks: 100,
      weightage: 50,
      scope: "Entire syllabus",
      timing: "End-Term",
      co: "Not confirmed",
      track: "theory",
    },
  ],
  strategies: [
    {
      title: "This is a writing subject, not a doing subject",
      body: `Nothing here is hard. Every concept is one paragraph you could understand in two minutes. The marks come entirely from whether you can *write it back* in the exam's shape: definition, then structure, then an example.

So your notes for CDT should look completely different from your Calculus notes. For every concept, store exactly three things:
1. A one-line definition in exam language.
2. The structure — the four elements, the five IDEAL steps, the four empathy quadrants.
3. One concrete example you invent yourself and reuse everywhere.

Pick one running example now — say, "an app that helps hostel students find who's going home this weekend" — and apply every framework in the syllabus to it. Decompose it, abstract it, empathy-map it, write its POV statement, list its functional and technical requirements. One example, every framework. That's your whole revision strategy for this subject and it takes an evening.`,
    },
    {
      title: "You have a real advantage here — use your own projects",
      body: `You've built FreelancerRadar, client sites, a couples app. This subject is asking you to describe, formally, the thing you already do informally.

When they ask for a user-centred problem statement, you have actual users. When they ask for functional vs technical requirements, you've actually made those calls. When they ask about ill-structured problems, "which freelance job posts are worth showing this user" is a genuinely ill-structured problem with no single right answer.

Writing about work you actually did produces much better answers than writing about a hypothetical, and it's faster because you're not inventing details.`,
    },
    {
      title: "Three lectures a week, all in the morning",
      body: `As Group 2: Monday 12:20–13:20 (Room 205), Tuesday 10:00–11:00 (Room 94), Wednesday 10:00–11:00 (Room 94). Dr. Ankita.

Since the content is light and verbal, this is the subject where attending actually substitutes for studying. Take notes in the lecture, transcribe them into this app the same evening in 15 minutes, and you may not need a dedicated CDT study block at all before mid-sems.

That's deliberate: it frees your evening hours for Calculus and C, which need them.`,
    },
  ],
  textbooks: [],
  references: [],
  localFiles: ["computational_design_thinking/Unit1-Computational Design Thinking.pptx.pdf"],
  gaps: [
    "Course plan missing — no course outcomes, no session counts, no confirmed mid-sem scope, no marking scheme, no reading list.",
    "Units 2 onwards missing. Only the Unit 1 deck is in your folder.",
    "The marking scheme shown is the IILM standard (CLA 30 + MSE 20 + ESE 50) taken from your Calculus and C course plans. Confirm it.",
  ],
};
