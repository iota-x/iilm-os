import type { SeedSubject } from "../types";

export const designThinking: SeedSubject = {
  slug: "computational-design-thinking",
  name: "Computational Design Thinking",
  shortName: "CDT",
  code: "CSE26104",
  credits: 3,
  ltpc: "2-1-0-3",
  color: "emerald",
  status: "complete",
  teacher: "Dr. Ankita",
  hasLab: false,
  // Source: "Syllabus — Computational Design Thinking, CSE26104" (B.Tech 2026–30),
  // the Unit 1 deck (64 slides) and the Unit 2 deck (35 slides), all in
  // computational_design_thinking/. Mid-sem scope confirmed in class: Units 1–2.
  overview:
    "Structured problem solving (well- vs ill-structured problems, IDEAL, Polya, understand → plan → solve → verify → reflect), human-centred design (empathy maps, interviews, POV and How Might We), then creative ideation (divergent/convergent, brainstorming, brainwriting, SCAMPER, mind maps, lateral thinking, selecting ideas). Later units: algorithms and flowcharts, critical thinking and fallacies, and applications. 2-1-0: two lectures and a tutorial a week.",
  midsemScope: "Units 1 and 2 — foundations and problem solving, and creative thinking and design ideation.",
  midsemConfirmed: true,
  objectives: [
    "Build a foundational understanding of structured and analytical thinking.",
    "Apply problem-solving strategies to real-world and abstract problems.",
    "Develop logical reasoning, decision-making and algorithmic thinking.",
    "Enhance critical and creative thinking through exercises, case studies and collaborative activities.",
  ],
  outcomes: [
    {
      code: "CO1",
      text: "Apply structured problem-solving models such as Polya's method and the IDEAL framework to analyse and solve both well-structured and ill-structured problems.",
      bloom: "K3 — Applying",
    },
    {
      code: "CO2",
      text: "Analyse logical structures, reasoning patterns and common fallacies to enhance decision-making and argument evaluation.",
      bloom: "K4 — Analysing",
    },
    {
      code: "CO3",
      text: "Develop basic algorithms, pseudocode and flowcharts to model everyday processes using principles of computational thinking.",
      bloom: "K6 — Creating",
    },
    {
      code: "CO4",
      text: "Design creative, ethical and collaborative solutions to real-world problems using critical thinking, design thinking and team-based strategies.",
      bloom: "K6 — Creating",
    },
  ],
  units: [
    {
      number: 1,
      title: "Foundations of Computational Design Thinking and Problem Solving",
      sessions: 9,
      co: "CO1",
      assessment: "Mid-term (Units 1–2)",
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
          subtopics: [
            "Definition: computational thinking's logic + design thinking's human-centred creativity (slide 4)",
            "Focuses on decomposition, patterns, user-centric solutions; used in AI, product design, business strategy, software (slide 5)",
          ],
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
          subtopics: [
            "A problem = a gap between current state and goal state with no obvious path (slide 9)",
            "Well-structured: clear statement, all info, one correct answer, rules/formulas — 2x + 5 = 15, shortest route (slides 10–11)",
            "Ill-structured: unclear, missing info, many solutions, needs creativity — career path, city traffic (slides 12–13)",
            "The five-row comparison table: goal clarity, solution path, correct answer, information, example (slide 14)",
          ],
        },
        {
          code: "cdt-u1-solver",
          session: "S5",
          title: "Characteristics of an effective problem solver",
          weight: 3,
          inMidsem: true,
          outcome: "List and briefly explain each trait.",
          subtopics: [
            "Cognitive: curiosity, analytical thinking, flexibility, attention to detail (slides 15–16)",
            "Behavioural: persistence, patience, initiative, risk tolerance (slides 17–18)",
            "Collaborative: clear communication, empathy, openness to feedback, teamwork (slides 19–20)",
          ],
        },
        {
          code: "cdt-u1-models",
          session: "S6",
          title: "Problem-solving models: the IDEAL model and Polya's four-step method",
          weight: 5,
          inMidsem: true,
          outcome:
            "Expand IDEAL (Identify, Define, Explore, Act, Look back) and Polya (Understand, Plan, Carry out, Look back), and compare them.",
          subtopics: [
            "Why models: consistency, reflection built in (slide 22)",
            "IDEAL: Identify the problem, Define goals, Explore strategies, Act, Look back — core idea + key points each (slides 23–28)",
            "Polya: Understand, Devise a plan, Carry it out, Look back (slides 29–33)",
            "Compare: IDEAL adds an explicit goal-setting step; both end by looking back",
          ],
        },
        {
          code: "cdt-u1-process",
          session: "S7",
          title:
            "Computational problem-solving process: Understand → Plan → Solve → Verify → Reflect",
          weight: 5,
          inMidsem: true,
          outcome: "Walk a given problem through all five stages.",
          subtopics: [
            "Understand: inputs, outputs, constraints, plain-language statement (slide 36)",
            "Plan: sketch logic, sub-tasks, edge cases (slide 37)",
            "Solve: one step at a time, document decisions (slide 38)",
            "Verify: realistic cases and edge cases against success criteria (slide 39)",
            "Reflect: what worked, what next time (slide 40); the campus-app worked example (slide 42)",
          ],
        },
        {
          code: "cdt-u1-hcd",
          session: "S8",
          title: "Human-centred design principles; empathy mapping and user interviews",
          weight: 5,
          inMidsem: true,
          outcome:
            "Draw a four-quadrant empathy map (Says / Thinks / Does / Feels) and write good open-ended interview questions.",
          subtopics: [
            "HCD definition and its five stages: Empathize, Define, Ideate, Prototype, Test (slides 43–44)",
            "Four principles: people-centred, radically collaborative, iterative and experimental, optimistic and creative (slides 45–48)",
            "Clinic waiting-room case (slide 49)",
            "Empathy map: Says, Thinks, Does, Feels + Pain points and Needs; why it matters (slides 50–53)",
            "User interviews: open vs closed questions, best practices (slides 54–56)",
          ],
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
          subtopics: [
            "Problem statement format: User + Need + Reason (slide 57)",
            "Functional = what the system does (log in, track tasks, notify) (slide 58)",
            "Technical = how it works (database, platform, security, integration) (slide 59)",
            "Why problem definition matters; POV anatomy: user, need, insight (slides 60–61)",
            "How Might We: not too narrow, not too broad (slides 62–63)",
          ],
        },
      ],
    },
    {
      number: 2,
      title: "Creative Thinking and Design Ideation",
      sessions: 9,
      co: "CO1, CO2",
      assessment: "Mid-term (Units 1–2)",
      inMidsem: true,
      topics: [
        {
          code: "cdt-u2-creative",
          session: "S1",
          title: "Creative thinking in computational design",
          weight: 3,
          inMidsem: true,
          outcome: "Define creativity as novel + useful (+ implementable, for computational design) and explain why constraints help.",
          subtopics: [
            "Creativity = novel AND useful; novelty alone is noise (slide 3)",
            "Every design decision has alternatives: data structure, interface, workflow, business model",
            "Constraints narrow the search space usefully; computational design adds 'must be implementable'",
          ],
        },
        {
          code: "cdt-u2-divergent",
          session: "S2",
          title: "Divergent and convergent thinking",
          weight: 5,
          inMidsem: true,
          outcome: "Contrast the two modes on purpose, mindset, core rule, output, measure and failure mode, and draw the double diamond.",
          subtopics: [
            "Divergent: expand options — defer judgement, quantity, wild ideas, build on others (slide 5)",
            "Convergent: reduce to a defensible few — explicit criteria, evidence, record why (slide 5)",
            "The side-by-side table: no criticism while generating / no new ideas while evaluating (slide 6)",
            "Double diamond: problem space then solution space, diverge-converge twice (slide 7)",
            "The 30-uses drill (slide 8)",
          ],
        },
        {
          code: "cdt-u2-brainstorm",
          session: "S3",
          title: "Brainstorming and brainwriting techniques",
          weight: 5,
          inMidsem: true,
          outcome: "State Osborn's four rules, the four reasons group brainstorming underperforms, and run 6-3-5 brainwriting.",
          subtopics: [
            "Osborn's four rules: defer judgement, go for quantity, welcome wild ideas, combine and improve (slide 10)",
            "Why groups underperform: production blocking, evaluation apprehension, anchoring/conformity, social loafing (slide 11)",
            "6-3-5 brainwriting: 6 people, 3 ideas, 5 minutes, pass it on (slide 12)",
            "Brainstorming vs brainwriting table; combine them in practice (slide 13)",
          ],
        },
        {
          code: "cdt-u2-scamper",
          session: "S4",
          title: "SCAMPER technique",
          weight: 5,
          inMidsem: true,
          outcome: "Expand all seven letters and apply each to a given product or service.",
          subtopics: [
            "Checklist technique by Bob Eberle, from Osborn's questions; works on something that exists (slide 14)",
            "Substitute, Combine, Adapt, Modify/Magnify (slide 15)",
            "Put to another use, Eliminate, Reverse/Rearrange (slide 16)",
            "Worked example: the college attendance register (slides 15–17)",
          ],
        },
        {
          code: "cdt-u2-mindmap",
          session: "S5",
          title: "Mind mapping for idea generation",
          weight: 3,
          inMidsem: true,
          outcome: "Draw a mind map with the rules (one keyword per branch, thick to thin, colour) and say what it's good and bad for.",
          subtopics: [
            "Central idea, radial branches, one keyword per branch, never erase while mapping (slide 18)",
            "Good for unpacking broad problems; weak for sequences — use a flowchart (slide 18)",
            "Worked 'campus app' map: themes, then features, then the backlog (slide 19)",
          ],
        },
        {
          code: "cdt-u2-lateral",
          session: "S6",
          title: "Lateral thinking strategies",
          weight: 4,
          inMidsem: true,
          outcome: "Contrast lateral with vertical thinking (de Bono) and apply the four tools.",
          subtopics: [
            "Vertical = logical, digs the same hole deeper; lateral = sideways, provocative (slide 20)",
            "Random entry, provocation (PO), challenge assumptions, reversal (slide 21)",
            "Random word + reversal activity (slide 22)",
          ],
        },
        {
          code: "cdt-u2-dt-process",
          session: "S7",
          title: "Design thinking process: empathize, define, ideate",
          weight: 5,
          inMidsem: true,
          outcome: "Describe the first three stages with their methods and outputs, and write a POV and an HMW for a given user.",
          subtopics: [
            "Five stages, human-centred and non-linear; this unit does the first three (slide 24)",
            "Empathize: interviews, shadowing, observation; ask about the last time; watch for workarounds (slide 25)",
            "Define: POV = [user] needs [need] because [insight]; then How Might We (slide 26)",
            "Ideate: set up, generate, unstick, cluster — no evaluation inside the time box (slide 27)",
          ],
        },
        {
          code: "cdt-u2-selecting",
          session: "S8",
          title: "Selecting and prioritizing ideas",
          weight: 5,
          inMidsem: true,
          outcome: "Take an idea pool to a shortlist with desirable/feasible/viable, dot voting, NUF, the impact–effort matrix and a weighted matrix.",
          subtopics: [
            "Cluster first; criteria agreed before looking; desirable / feasible / viable; record rejections (slide 29)",
            "Dot voting and the NUF test (New, Useful, Feasible) and how to read the scores (slide 30)",
            "Impact–effort matrix: quick wins, big bets, fill-ins, money pits (slide 31)",
            "Weighted matrix: score × weight, summed; close totals mean weak criteria (slide 32)",
            "Wrap-up and quick-check questions (slides 33–34)",
          ],
        },
      ],
    },
    {
      number: 3,
      title: "Computational Problem-Solving using Algorithms",
      sessions: 9,
      co: "CO3",
      assessment: "Not in the mid-sem",
      inMidsem: false,
      topics: [
        {
          code: "cdt-u3-algorithmic",
          session: "",
          title: "Algorithmic thinking and characteristics of good algorithms",
          weight: 4,
          inMidsem: false,
        },
        {
          code: "cdt-u3-pseudocode",
          session: "",
          title: "Pseudocode writing and flowcharts",
          weight: 5,
          inMidsem: false,
        },
        {
          code: "cdt-u3-decomposition",
          session: "",
          title: "Problem decomposition and pattern recognition",
          weight: 4,
          inMidsem: false,
        },
        {
          code: "cdt-u3-control",
          session: "",
          title: "Conditional logic (if–else) and iterative processes (loops)",
          weight: 4,
          inMidsem: false,
        },
        {
          code: "cdt-u3-datastructures",
          session: "",
          title: "Basic data structures for problem solving",
          weight: 3,
          inMidsem: false,
        },
        {
          code: "cdt-u3-efficiency",
          session: "",
          title: "Introduction to algorithm efficiency and time complexity",
          weight: 3,
          inMidsem: false,
        },
      ],
    },
    {
      number: 4,
      title: "Critical Thinking and Computational Decision Making",
      sessions: 9,
      co: "CO1, CO2",
      assessment: "Not in the mid-sem",
      inMidsem: false,
      topics: [
        {
          code: "cdt-u4-critical",
          session: "",
          title: "Critical thinking fundamentals: components and stages",
          weight: 4,
          inMidsem: false,
        },
        {
          code: "cdt-u4-reasoning",
          session: "",
          title: "Deductive and inductive reasoning; syllogisms",
          weight: 5,
          inMidsem: false,
        },
        {
          code: "cdt-u4-logic",
          session: "",
          title: "Digital logic fundamentals; analogies and logical relationships",
          weight: 3,
          inMidsem: false,
        },
        {
          code: "cdt-u4-cause",
          session: "",
          title: "Cause-and-effect analysis",
          weight: 3,
          inMidsem: false,
        },
        {
          code: "cdt-u4-fallacies",
          session: "",
          title: "Logical fallacies and cognitive biases",
          weight: 5,
          inMidsem: false,
        },
        {
          code: "cdt-u4-evidence",
          session: "",
          title: "Evaluating data, evidence and arguments; decision making under uncertainty",
          weight: 4,
          inMidsem: false,
        },
      ],
    },
    {
      number: 5,
      title: "Applications of Computational Design Thinking",
      sessions: 9,
      co: "CO4",
      assessment: "Not in the mid-sem",
      inMidsem: false,
      topics: [
        {
          code: "cdt-u5-realworld",
          session: "",
          title: "Computational thinking in real-world systems: abstraction, decomposition, patterns, algorithms",
          weight: 4,
          inMidsem: false,
        },
        {
          code: "cdt-u5-prototyping",
          session: "",
          title: "Rapid prototyping and iterative testing",
          weight: 4,
          inMidsem: false,
        },
        {
          code: "cdt-u5-ethics",
          session: "",
          title: "Ethical and sustainable computational design",
          weight: 3,
          inMidsem: false,
        },
        {
          code: "cdt-u5-innovation",
          session: "",
          title: "Design thinking for innovation and entrepreneurship",
          weight: 3,
          inMidsem: false,
        },
        {
          code: "cdt-u5-sdg",
          session: "",
          title: "Computational design thinking and the Sustainable Development Goals",
          weight: 3,
          inMidsem: false,
        },
      ],
    },
  ],
  experiments: [],
  components: [
    {
      name: "Presentation / Assignment etc.",
      marks: 30,
      weightage: 30,
      scope: "Quiz, assignment, presentation, extempore — continuous",
      timing: "Throughout the semester",
      co: "CO1–CO4",
      track: "theory",
    },
    {
      name: "Mid-Term Examination",
      marks: 20,
      weightage: 20,
      scope: "Units 1–2",
      timing: "5–11 Oct",
      co: "CO1, CO2",
      track: "theory",
    },
    {
      name: "End-Term Examination",
      marks: 100,
      weightage: 50,
      scope: "Entire syllabus, Units 1–5",
      timing: "End-Term",
      co: "CO1–CO4",
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
      personal: true,
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
  textbooks: [
    { title: "Change by Design", author: "Tim Brown (Harper Business, 2009)" },
    { title: "Thinkertoys: A Handbook of Creative-Thinking Techniques", author: "Michael Michalko (Ten Speed Press, 2010)", note: "Source of SCAMPER-style checklists for Unit 2." },
    { title: "Lateral Thinking: A Textbook of Creativity", author: "Edward de Bono (Penguin, 2009)", note: "Unit 2's lateral thinking tools come from here." },
    { title: "Starting Out with Programming Logic and Design", author: "Tony Gaddis (Addison-Wesley, 2007)", note: "Unit 3: pseudocode and flowcharts." },
    { title: "Grokking Algorithms", author: "Aditya Bhargava (2024)" },
    { title: "The biases of thinking fast and thinking slow", author: "Streeb, Chen and Keim (Springer, 2018)", note: "Unit 4: cognitive biases." },
  ],
  references: [
    { title: "Creative Confidence", author: "Tom Kelley and David Kelley (Crown Business, 2013)" },
    { title: "The C Programming Language", author: "Brian W. Kernighan and Dennis M. Ritchie" },
    { title: "The Miniature Guide to Critical Thinking Concepts and Tools", author: "Richard Paul and Linda Elder" },
    { title: "Designing for Growth: A Design Thinking Tool Kit for Managers", author: "Jeanne Liedtka and Tim Ogilvie" },
  ],
  localFiles: [
    "computational_design_thinking/Syllabus-Computational design thinking.pdf",
    "computational_design_thinking/Unit1-Computational Design Thinking.pdf",
    "computational_design_thinking/Unit2CreativeThinkingandDesignIdeation.pdf",
  ],
  gaps: [
    "No lecture-by-lecture course plan yet, so there are no session dates, and nothing says how the 30% continuous marks split between quiz, assignment and presentation.",
  ],
};
