import type { SeedSubject } from "../types";

export const aiAutomation: SeedSubject = {
  slug: "foundation-of-ai",
  name: "Foundation of AI and Automation",
  shortName: "AI",
  code: null,
  credits: 3,
  ltpc: "3-0-0-3",
  color: "rose",
  status: "partial",
  teacher: "Dr. Sonam Lata",
  hasLab: false,
  overview:
    "Foundations of artificial intelligence — what AI is and how it differs from human intelligence, the Turing Test, how problems are represented and what makes a problem an AI problem, the components of an AI system, state space search, and the search techniques used to solve problems.",
  midsemScope:
    "Not confirmed — the course plan isn't in your folder yet. All eight decks you have are Unit 1, so Unit 1 is certainly in scope; expect Units 1–3.",
  midsemConfirmed: false,
  objectives: [
    "Define AI, its scope, and its historical evolution.",
    "Represent a problem in a form an AI system can search over.",
    "Identify the characteristics that make a problem suitable for AI techniques.",
    "Apply state space search and the standard search strategies.",
  ],
  outcomes: [],
  units: [
    {
      number: 1,
      title: "Introduction to AI, Problem Representation and Search",
      sessions: 9,
      co: "CO1",
      assessment: "Not confirmed",
      inMidsem: true,
      topics: [
        {
          code: "ai-u1-defn",
          session: "S1",
          title: "Definition and scope of Artificial Intelligence; historical context and evolution",
          weight: 5,
          inMidsem: true,
          outcome:
            "Define AI and list its five task areas: learning, reasoning, problem-solving, decision-making, self-correction.",
        },
        {
          code: "ai-u1-vshuman",
          session: "S2",
          title: "Differences between AI and human intelligence",
          weight: 4,
          inMidsem: true,
          outcome:
            "Compare on five axes: information processing, learning efficiency, adaptability, emotional understanding, ethical reasoning.",
        },
        {
          code: "ai-u1-turing",
          session: "S3",
          title: "The Turing Test",
          weight: 5,
          inMidsem: true,
          outcome:
            "Describe the three participants and the setup, cite Turing's 1950 paper 'Computing Machinery and Intelligence', and state the standard objections.",
        },
        {
          code: "ai-u1-representation",
          session: "S4",
          title: "Problem representation in AI",
          weight: 5,
          inMidsem: true,
          outcome:
            "Explain why representation matters — efficiency, comprehensiveness, simplicity — and model a problem's environment, constraints, states and actions.",
        },
        {
          code: "ai-u1-characteristics",
          session: "S5",
          title: "Characteristics of an AI problem",
          weight: 5,
          inMidsem: true,
          outcome:
            "List and explain: non-deterministic, complex, uncertain, search/optimisation-based, knowledge representation, learning and adaptation, autonomy, real-time decision making, goal-oriented.",
        },
        {
          code: "ai-u1-components",
          session: "S6",
          title: "Components of AI — technical and functional",
          weight: 5,
          inMidsem: true,
          outcome:
            "Technical: data, algorithms, model, compute, feedback, evaluation metrics, UI, ethics & governance. Plus the functional view.",
        },
        {
          code: "ai-u1-problemsolving",
          session: "S7",
          title: "Problem solving in AI; types of problems",
          weight: 5,
          inMidsem: true,
          outcome:
            "Classify problems as ignorable, recoverable or irrecoverable, with an example and handling strategy for each.",
        },
        {
          code: "ai-u1-statespace",
          session: "S8",
          title: "State space search",
          weight: 5,
          inMidsem: true,
          outcome:
            "Define state, initial state, goal state, operators, state space; draw the state space for a small problem (water jug, 8-puzzle).",
        },
        {
          code: "ai-u1-search",
          session: "S9",
          title: "AI and the search process — search techniques",
          weight: 5,
          inMidsem: true,
          outcome:
            "Classify and compare uninformed (blind), informed (heuristic), adversarial, and local search algorithms.",
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
      title: "Ignore everything you know about modern AI while writing this paper",
      body: `You use LLMs daily. That knowledge will actively cost you marks here.

This syllabus is classical, pre-deep-learning AI: Turing Test, state space search, BFS/DFS, heuristics, A*, minimax. When the paper asks "what are the components of AI", the expected answer is the eight-item list from your deck — data, algorithms, model, compute power, feedback mechanisms, evaluation metrics, user interface, ethics and governance. Not "transformers and attention."

Answer from the slides. Your real-world knowledge is a bonus you can add in the last line of a long answer, never a replacement for the taught list.`,
    },
    {
      title: "This subject is 90% lists. Learn the lists.",
      body: `Go through your eight decks and you'll notice nearly every slide is an enumerated list: five differences between AI and human intelligence, nine characteristics of an AI problem, eight technical components, three types of problems, four categories of search.

That is exactly how it'll be examined — "List and explain the characteristics of an AI problem (10 marks)" means write nine bullets, each with a sentence.

So build one page per list, with a mnemonic. Then test yourself by writing the list from a blank page. Recognition ("yeah I've seen that") is not recall, and only recall scores.`,
    },
    {
      title: "State space search is the one place you'll actually solve something",
      body: `Everything else in Unit 1 is descriptive. State space search is procedural, so it's where numerical/diagram questions come from.

Drill these three by hand: the **water jug problem** (4L and 3L, measure 2L), the **8-puzzle** (draw two levels of the tree), and the **missionaries and cannibals** problem. For each, write the state representation as a tuple, list the operators, and draw the tree.

If you can draw a state space tree cleanly you can answer any question in this area. If you can't, you'll lose the whole question.`,
    },
    {
      title: "Only two lectures a week — the thinnest contact time you have",
      body: `Wednesday 12:20–13:20 and Thursday 8:50–9:50, both Room 94, Dr. Sonam Lata.

Two hours a week means the syllabus moves slowly but also that missing one lecture costs you half a week. Given you started a month late, this is the subject where you're most likely to have a silent gap you don't notice until the paper.

Concretely: your eight decks all say "Unit 1". Find out in the next lecture how far the class has actually got, because if they're into Unit 2 and you have no Unit 2 material, that's a bigger problem than anything in Calculus.`,
    },
  ],
  textbooks: [],
  references: [],
  localFiles: [
    "AI_automation/1-Introduction.pptx.pdf",
    "AI_automation/2-turing test.pptx.pdf",
    "AI_automation/3-Problem representation in AI.pptx.pdf",
    "AI_automation/4-Characteristics of AI problem.pptx.pdf",
    "AI_automation/5-State Space Search.pptx.pdf",
    "AI_automation/6-Components of AI.pptx.pdf",
    "AI_automation/7 - Problem Solving in AI.pptx.pdf",
    "AI_automation/8-AI and Search Process.pdf",
  ],
  gaps: [
    "Course plan missing — no course code, no course outcomes, no confirmed mid-sem scope, no marking scheme, no reading list.",
    "Units 2 onwards missing. All eight decks in your folder are Unit 1.",
    "Two screenshots in the AI_automation folder couldn't be read — rename them to simple filenames and they'll be picked up.",
  ],
};
