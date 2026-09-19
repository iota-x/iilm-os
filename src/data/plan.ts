/**
 * The 18-day run-up to mid-sems.
 * Budget: ~2.5 h on weekdays (after classes), ~5.5 h Sat/Sun. Roughly 63 hours total.
 *
 * Group 2 free windows, from the timetable:
 *   Mon  after 13:20  — longest weekday window
 *   Tue  after 15:00
 *   Wed  after 16:10  — shortest
 *   Thu  after 16:10  — shortest
 *   Fri  after 13:20  — longest weekday window
 *   Sat / Sun — free all day
 */

export interface PlanBlock {
  subject: string;
  minutes: number;
  label: string;
  topics: string[];
  kind: "learn" | "drill" | "revise" | "admin" | "lab" | "mock";
}

export interface PlanDay {
  date: string;
  weekday: string;
  phase: string;
  /** free study time available after classes */
  budget: number;
  headline: string;
  blocks: PlanBlock[];
  note?: string;
}

export const PHASES = [
  {
    key: "triage",
    name: "Phase 0 — Triage",
    range: "17–18 Sep",
    goal:
      "Stop the bleeding. Find out exactly how far behind you are in each subject, and close the DE+CO material gap. Almost no studying — this phase is messages, downloads and setup.",
  },
  {
    key: "first-pass",
    name: "Phase 1 — First pass",
    range: "19–27 Sep",
    goal:
      "Cover every mid-sem topic once. Not deeply — the goal is that nothing on the paper is a total stranger. Method sheets for Calculus, list-pages for AI/CDT, output-prediction drills for C.",
  },
  {
    key: "drill",
    name: "Phase 2 — Drill",
    range: "28 Sep – 2 Oct",
    goal:
      "Problems, not reading. Work through the assignment in your Calculus course plan, drill C output prediction, hand-trace recursion, draw state space trees. This is where marks are actually made.",
  },
  {
    key: "revise",
    name: "Phase 3 — Revision & mock",
    range: "3–4 Oct",
    goal:
      "Two full days. One timed mock per major subject, then fix only what the mock exposed. No new material.",
  },
  {
    key: "exams",
    name: "Exam week",
    range: "5–11 Oct",
    goal:
      "Targeted revision for tomorrow's paper only. Method sheets and lists, nothing new.",
  },
] as const;

export const planDays: PlanDay[] = [
  {
    date: "2026-09-17",
    weekday: "Thu",
    phase: "triage",
    budget: 150,
    headline: "Find out what you don't know",
    blocks: [
      {
        subject: "digital-electronics",
        minutes: 30,
        label: "Chase the DE+CO course plan",
        topics: [
          "Message Dr Puja Acharya or check the LMS for the Digital Electronics & Computer Organization course plan",
          "Message Dr. Sambhavi for the lab experiment list",
          "Ask a classmate how many lectures and labs have happened so far",
        ],
        kind: "admin",
      },
      {
        subject: "computational-design-thinking",
        minutes: 20,
        label: "Chase CDT and AI course plans",
        topics: [
          "Get the CDT course plan and Units 2+ decks from the LMS",
          "Get the Foundation of AI course plan and any Unit 2 material",
          "Confirm mid-sem dates and scope for all six subjects",
        ],
        kind: "admin",
      },
      {
        subject: "applied-calculus",
        minutes: 60,
        label: "Unit 1 — limits, continuity, differentiability",
        topics: ["calc-u1-limits"],
        kind: "learn",
      },
      {
        subject: "programming-in-c",
        minutes: 40,
        label: "Unit 1 — the whole thing, it's short",
        topics: ["c-u1-anatomy", "c-u1-langs"],
        kind: "learn",
      },
    ],
    note: "You had AI at 8:50, Calculus at 10:00, C at 11:10, DE+CO at 12:20, then DE+CO lab until 16:10. Start easy — the admin blocks are the important part today.",
  },
  {
    date: "2026-09-18",
    weekday: "Fri",
    phase: "triage",
    budget: 210,
    headline: "Long afternoon — set up your Linux VM and finish Calculus U1 basics",
    blocks: [
      {
        subject: "linux-administration",
        minutes: 60,
        label: "Install the VM",
        topics: [
          "Follow 'Installing Linux Using a Virtual Machine.pdf'",
          "UTM (Apple Silicon native) or VirtualBox; Ubuntu Server, no desktop",
          "Snapshot it once it boots",
        ],
        kind: "lab",
      },
      {
        subject: "applied-calculus",
        minutes: 75,
        label: "Unit 1 — successive differentiation + start Rolle's",
        topics: ["calc-u1-successive", "calc-u1-rolle"],
        kind: "learn",
      },
      {
        subject: "programming-in-c",
        minutes: 45,
        label: "Unit 1 — algorithms, flowcharts, structured programming",
        topics: ["c-u1-algorithms", "c-u1-structured"],
        kind: "learn",
      },
      {
        subject: "digital-electronics",
        minutes: 30,
        label: "Number systems — safe ground while you wait for the plan",
        topics: [
          "Binary / octal / decimal / hex conversion both ways",
          "1's and 2's complement, signed representation",
        ],
        kind: "learn",
      },
    ],
    note: "Classes end at 13:20 today (Calculus 10:00, Linux lab 11:10–13:20). Biggest weekday window you get — use it.",
  },
  {
    date: "2026-09-19",
    weekday: "Sat",
    phase: "first-pass",
    budget: 330,
    headline: "Calculus Unit 1 finished, end to end",
    blocks: [
      {
        subject: "applied-calculus",
        minutes: 120,
        label: "Rolle's theorem + Lagrange's MVT",
        topics: ["calc-u1-rolle", "calc-u1-lmvt"],
        kind: "learn",
      },
      {
        subject: "applied-calculus",
        minutes: 90,
        label: "Taylor's theorem for one variable",
        topics: ["calc-u1-taylor1"],
        kind: "learn",
      },
      {
        subject: "applied-calculus",
        minutes: 60,
        label: "Unit 1 method sheets",
        topics: [
          "One page per topic: setup, steps, worked example, the trap",
          "Include the |x| on [-1,1] Rolle counterexample",
        ],
        kind: "drill",
      },
      {
        subject: "programming-in-c",
        minutes: 60,
        label: "Unit 2 — tokens, data types, operators",
        topics: ["c-u2-overview", "c-u2-tokens", "c-u2-datatypes"],
        kind: "learn",
      },
    ],
  },
  {
    date: "2026-09-20",
    weekday: "Sun",
    phase: "first-pass",
    budget: 330,
    headline: "C Unit 2 nailed, Calculus Unit 2 started",
    blocks: [
      {
        subject: "programming-in-c",
        minutes: 90,
        label: "Precedence, associativity, type conversion — the high-yield hour",
        topics: ["c-u2-precedence"],
        kind: "drill",
      },
      {
        subject: "applied-calculus",
        minutes: 120,
        label: "Unit 2 — limits and continuity of two variables",
        topics: ["calc-u2-limits2"],
        kind: "learn",
      },
      {
        subject: "applied-calculus",
        minutes: 60,
        label: "The three counterexamples",
        topics: [
          "xy/(x²+y²): partials exist, not differentiable",
          "x²y/(x⁴+y²): limit along y=mx vs y=x²",
          "Write both out fully, from memory, twice",
        ],
        kind: "drill",
      },
      {
        subject: "applied-calculus",
        minutes: 60,
        label: "Lab prep for tomorrow morning",
        topics: ["Experiments 1–3 in Python: sympy + matplotlib"],
        kind: "lab",
      },
    ],
    note: "You have Applied Calculus Lab tomorrow 8:50–11:00. Walk in with the code already written.",
  },
  {
    date: "2026-09-21",
    weekday: "Mon",
    phase: "first-pass",
    budget: 150,
    headline: "Partial derivatives and total derivative",
    blocks: [
      {
        subject: "applied-calculus",
        minutes: 90,
        label: "Unit 2 — partial derivatives, total derivative",
        topics: ["calc-u2-partial", "calc-u2-total"],
        kind: "learn",
      },
      {
        subject: "programming-in-c",
        minutes: 60,
        label: "Unit 3 — I/O functions and format specifiers",
        topics: ["c-u3-io"],
        kind: "learn",
      },
    ],
    note: "Classes end 13:20 — you have the whole afternoon and evening.",
  },
  {
    date: "2026-09-22",
    weekday: "Tue",
    phase: "first-pass",
    budget: 150,
    headline: "Euler's theorem",
    blocks: [
      {
        subject: "applied-calculus",
        minutes: 90,
        label: "Unit 2 — Euler's theorem for homogeneous functions",
        topics: ["calc-u2-euler"],
        kind: "learn",
      },
      {
        subject: "programming-in-c",
        minutes: 60,
        label: "Unit 3 — if, if-else, nested, conditional operator",
        topics: ["c-u3-if", "c-u3-nested"],
        kind: "learn",
      },
    ],
  },
  {
    date: "2026-09-23",
    weekday: "Wed",
    phase: "first-pass",
    budget: 120,
    headline: "Short day — AI Unit 1 lists",
    blocks: [
      {
        subject: "foundation-of-ai",
        minutes: 60,
        label: "Decks 1, 2, 6 — definition, Turing test, components",
        topics: ["ai-u1-defn", "ai-u1-vshuman", "ai-u1-turing", "ai-u1-components"],
        kind: "learn",
      },
      {
        subject: "programming-in-c",
        minutes: 60,
        label: "Unit 3 — switch, while, do-while",
        topics: ["c-u3-switch", "c-u3-while"],
        kind: "learn",
      },
    ],
    note: "Classes run to 16:10 today (C lab 14:00–16:10). Keep it light.",
  },
  {
    date: "2026-09-24",
    weekday: "Thu",
    phase: "first-pass",
    budget: 120,
    headline: "Short day — Taylor for two variables + C loops",
    blocks: [
      {
        subject: "applied-calculus",
        minutes: 60,
        label: "Unit 2 — Taylor and Maclaurin for two variables",
        topics: ["calc-u2-taylor2"],
        kind: "learn",
      },
      {
        subject: "programming-in-c",
        minutes: 60,
        label: "Unit 3 — for, break, continue, goto; loop tracing",
        topics: ["c-u3-for"],
        kind: "drill",
      },
    ],
    note: "DE+CO lab 14:00–16:10. By now you should have the DE+CO course plan — if not, chase it again today.",
  },
  {
    date: "2026-09-25",
    weekday: "Fri",
    phase: "first-pass",
    budget: 210,
    headline: "Calculus Unit 3 opens — maxima, minima, saddle points",
    blocks: [
      {
        subject: "applied-calculus",
        minutes: 120,
        label: "Unit 3 — maxima and minima of two variables, the rt−s² test",
        topics: ["calc-u3-maxmin"],
        kind: "learn",
      },
      {
        subject: "linux-administration",
        minutes: 45,
        label: "Experiments 4–5 write-up",
        topics: ["File and directory commands", "Permissions: chmod numeric and named"],
        kind: "lab",
      },
      {
        subject: "digital-electronics",
        minutes: 45,
        label: "Boolean algebra and De Morgan's theorems",
        topics: ["Boolean identities", "De Morgan's laws", "SOP and POS forms"],
        kind: "learn",
      },
    ],
    note: "Linux lab was 11:10–13:20 today. Write it up while it's fresh.",
  },
  {
    date: "2026-09-26",
    weekday: "Sat",
    phase: "first-pass",
    budget: 330,
    headline: "Lagrange multipliers + C functions and recursion",
    blocks: [
      {
        subject: "applied-calculus",
        minutes: 90,
        label: "Unit 3 — Lagrange's method of multipliers",
        topics: ["calc-u3-lagrange"],
        kind: "learn",
      },
      {
        subject: "applied-calculus",
        minutes: 60,
        label: "Unit 3 — gradient vector and Hessian",
        topics: ["calc-u3-hessian"],
        kind: "learn",
      },
      {
        subject: "programming-in-c",
        minutes: 90,
        label: "Unit 4 — functions, call by value, recursion",
        topics: ["c-u4-intro", "c-u4-recursion"],
        kind: "learn",
      },
      {
        subject: "programming-in-c",
        minutes: 60,
        label: "Hand-trace three recursions with stack diagrams",
        topics: ["factorial(4)", "fib(5)", "Hanoi with 3 discs", "printf-after-call variant"],
        kind: "drill",
      },
      {
        subject: "digital-electronics",
        minutes: 30,
        label: "Combinational blocks — MUX, decoder, adder",
        topics: ["deco-u2-mux", "deco-u2-codec", "deco-u2-adders"],
        kind: "learn",
      },
    ],
  },
  {
    date: "2026-09-27",
    weekday: "Sun",
    phase: "first-pass",
    budget: 330,
    headline: "First pass closes — everything seen once",
    blocks: [
      {
        subject: "applied-calculus",
        minutes: 90,
        label: "Unit 3 — gradient descent and Newton's method",
        topics: ["calc-u3-gd"],
        kind: "learn",
      },
      {
        subject: "applied-calculus",
        minutes: 60,
        label: "Unit 3 — linear regression through optimisation",
        topics: ["calc-u3-regression"],
        kind: "learn",
      },
      {
        subject: "programming-in-c",
        minutes: 60,
        label: "Unit 4 — storage classes, as a 4×4 table",
        topics: ["c-u4-storage"],
        kind: "drill",
      },
      {
        subject: "computational-design-thinking",
        minutes: 75,
        label: "CDT Unit 1 — the whole unit in one sitting",
        topics: [
          "cdt-u1-intro",
          "cdt-u1-elements",
          "cdt-u1-lenses",
          "cdt-u1-problems",
          "cdt-u1-solver",
          "cdt-u1-models",
          "cdt-u1-process",
          "cdt-u1-hcd",
          "cdt-u1-requirements",
        ],
        kind: "learn",
      },
      {
        subject: "applied-calculus",
        minutes: 45,
        label: "Lab prep — experiments 6–7",
        topics: ["Euler's theorem + Jacobians", "Maxima/minima with surface and contour plots"],
        kind: "lab",
      },
    ],
    note: "Milestone: by tonight every mid-sem topic in Calculus U1–3, C U1–4, CDT U1 and AI U1 has been seen at least once.",
  },
  {
    date: "2026-09-28",
    weekday: "Mon",
    phase: "drill",
    budget: 150,
    headline: "Drill phase opens — the course-plan assignment",
    blocks: [
      {
        subject: "applied-calculus",
        minutes: 90,
        label: "Solve all 5 questions of the Assignment in your course plan",
        topics: [
          "Q1 limits along paths",
          "Q2 partial derivatives at a point",
          "Q3 gradient + directional derivative",
          "Q4 definition of differentiability",
          "Q5 partials exist but not differentiable",
        ],
        kind: "drill",
      },
      {
        subject: "applied-calculus",
        minutes: 30,
        label: "Grade yourself against the published rubric",
        topics: ["The full rubric is on the Calculus → Marks tab"],
        kind: "drill",
      },
      {
        subject: "foundation-of-ai",
        minutes: 30,
        label: "Decks 3, 4, 7 — representation, characteristics, problem types",
        topics: ["ai-u1-representation", "ai-u1-characteristics", "ai-u1-problemsolving"],
        kind: "learn",
      },
    ],
  },
  {
    date: "2026-09-29",
    weekday: "Tue",
    phase: "drill",
    budget: 150,
    headline: "C output prediction",
    blocks: [
      {
        subject: "programming-in-c",
        minutes: 90,
        label: "20 output-prediction questions, on paper, then run them",
        topics: [
          "i++ + ++i style expressions",
          "integer division and promotion",
          "switch fall-through",
          "nested loop with break/continue",
          "static variable across calls",
        ],
        kind: "drill",
      },
      {
        subject: "foundation-of-ai",
        minutes: 60,
        label: "State space search — draw the trees",
        topics: ["ai-u1-statespace", "ai-u1-search", "Water jug", "8-puzzle", "Missionaries and cannibals"],
        kind: "drill",
      },
    ],
  },
  {
    date: "2026-09-30",
    weekday: "Wed",
    phase: "drill",
    budget: 120,
    headline: "Calculus problem sets",
    blocks: [
      {
        subject: "applied-calculus",
        minutes: 120,
        label: "Unit 1 + 2 mixed problem set, timed",
        topics: [
          "5 Rolle/LMVT verifications",
          "5 Euler's theorem problems",
          "5 two-variable limits",
        ],
        kind: "drill",
      },
    ],
    note: "Classes to 16:10. One focused block is better than two tired ones.",
  },
  {
    date: "2026-10-01",
    weekday: "Thu",
    phase: "drill",
    budget: 120,
    headline: "Unit 3 problems + CDT running example",
    blocks: [
      {
        subject: "applied-calculus",
        minutes: 75,
        label: "Unit 3 problem set",
        topics: ["8 maxima/minima classifications", "4 Lagrange multiplier problems"],
        kind: "drill",
      },
      {
        subject: "computational-design-thinking",
        minutes: 45,
        label: "Apply every CDT framework to one invented example",
        topics: [
          "Pick one product idea",
          "Decompose / abstract / pattern-find it",
          "Empathy map it, write its POV statement, split its requirements",
        ],
        kind: "drill",
      },
    ],
  },
  {
    date: "2026-10-02",
    weekday: "Fri",
    phase: "drill",
    budget: 210,
    headline: "Long window — C paper practice and DE+CO catch-up",
    blocks: [
      {
        subject: "programming-in-c",
        minutes: 90,
        label: "Write 6 programs on paper, no compiler",
        topics: [
          "Menu-driven calculator with switch",
          "Recursive fibonacci",
          "Prime check with a function",
          "Pattern printing with nested loops",
          "Swap using call by value vs pointers",
          "Sum of digits",
        ],
        kind: "drill",
      },
      {
        subject: "digital-electronics",
        minutes: 90,
        label: "Unit III — flip-flops, counters, shift registers",
        topics: ["deco-u3-flipflops", "deco-u3-master-slave", "deco-u3-counters", "deco-u3-registers"],
        kind: "learn",
      },
      {
        subject: "linux-administration",
        minutes: 30,
        label: "Lab file catch-up",
        topics: ["Experiments 6–8: filters, pipes and redirection, users and groups"],
        kind: "lab",
      },
    ],
  },
  {
    date: "2026-10-03",
    weekday: "Sat",
    phase: "revise",
    budget: 330,
    headline: "Mock day — Calculus and C",
    blocks: [
      {
        subject: "applied-calculus",
        minutes: 90,
        label: "Timed mock: Units 1–3, 90 minutes, no notes",
        topics: ["Write it like the real paper — no pausing, no lookups"],
        kind: "mock",
      },
      {
        subject: "applied-calculus",
        minutes: 60,
        label: "Mark it honestly, then fix only what it exposed",
        topics: [],
        kind: "revise",
      },
      {
        subject: "programming-in-c",
        minutes: 90,
        label: "Timed mock: Units 1–4, 90 minutes, on paper",
        topics: [],
        kind: "mock",
      },
      {
        subject: "programming-in-c",
        minutes: 60,
        label: "Mark and fix",
        topics: [],
        kind: "revise",
      },
      {
        subject: "digital-electronics",
        minutes: 30,
        label: "DE+CO quick pass",
        topics: [],
        kind: "revise",
      },
    ],
  },
  {
    date: "2026-10-04",
    weekday: "Sun",
    phase: "revise",
    budget: 330,
    headline: "Final consolidation — method sheets and lists only",
    blocks: [
      {
        subject: "applied-calculus",
        minutes: 90,
        label: "Read every method sheet, redo the three counterexamples from memory",
        topics: [],
        kind: "revise",
      },
      {
        subject: "programming-in-c",
        minutes: 60,
        label: "Storage class table from blank paper; 10 more output predictions",
        topics: [],
        kind: "revise",
      },
      {
        subject: "foundation-of-ai",
        minutes: 60,
        label: "Every list, written from a blank page",
        topics: [],
        kind: "revise",
      },
      {
        subject: "computational-design-thinking",
        minutes: 45,
        label: "Every framework, written from a blank page",
        topics: [],
        kind: "revise",
      },
      {
        subject: "digital-electronics",
        minutes: 60,
        label: "Units I–III method sheet: complements, K-map, MUX, flip-flop tables, counter design",
        topics: [],
        kind: "revise",
      },
      {
        subject: "linux-administration",
        minutes: 15,
        label: "The six viva questions",
        topics: [],
        kind: "revise",
      },
    ],
    note: "Sleep properly tonight. Mid-sems start tomorrow.",
  },
];

export const MIDSEM_START = "2026-10-05";
export const MIDSEM_END = "2026-10-11";
export const MIDSEM_CONFIRMED = false;
