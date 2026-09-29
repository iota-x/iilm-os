/**
 * Where each topic lives in the notes and decks the class has been handed,
 * and what those files leave out.
 *
 * Built by reading every page: DENotes.pdf (76 handwritten pages, DE+CO Units
 * I–III), Unit_2_Two_Variable_Calculus.pptx (82 slides, Calculus Unit 2) and
 * the six Linux handouts. The page and slide images themselves are attached
 * to each topic in the owner's account (scripts/attach-notes.mts), so the
 * numbers here match the "From class" pictures on the topic page.
 *
 * `status` is judged against the topic's outcome line, not its title:
 *   covered  — the notes are enough to answer the exam question
 *   partial  — the notes touch it, but `missing` names what they skip
 *   missing  — nothing in the notes; learn it from `learnFrom`
 */

export type CoverageStatus = "covered" | "partial" | "missing";

export interface CoverageSource {
  /** file name as it sits in ~/Desktop/iilm/<subject>/ */
  file: string;
  /** "pp. 26–29", "slides 20–27" */
  where: string;
  /** what those pages hold, in a few words */
  what?: string;
}

export interface Coverage {
  status: CoverageStatus;
  sources: CoverageSource[];
  /** what the notes leave out — shown as the alert */
  missing?: string;
  /** where to fill the gap instead */
  learnFrom?: string;
}

const DE = "DENotes.pdf";
const CALC = "Unit_2_Two_Variable_Calculus.pptx";
const L_HIST = "Linux_History_BasicCommands.ppt";
const L_ARCH = "LinuxArchitecture_Distributions.pptx";
const L_CMDS = "linux basic commands.docx";
const L_LAB1 = "Lab 1.docx";
const L_VM = "Installing Linux Using a Virtual Machine.pdf";
const L_FMT = "Lab File format.docx";
const CDT1 = "Unit1-Computational Design Thinking.pdf";
const CDT2 = "Unit2CreativeThinkingandDesignIdeation.pdf";

const MANO = "Mano & Ciletti, Digital Design";
const NESO = "the Neso Academy playlist under Resources";

export const coverage: Record<string, Coverage> = {
  /* ── DE+CO · Unit I ─────────────────────────────────────── */
  "deco-u1-number-systems": {
    status: "covered",
    sources: [{ file: DE, where: "pp. 1–3", what: "analog vs digital, bases, MSB/LSB, bit and byte, hex digits" }],
  },
  "deco-u1-conversion": {
    status: "covered",
    sources: [{ file: DE, where: "pp. 5–7", what: "positional weights, conversions with fractions, base 4/8/16 via binary" }],
  },
  "deco-u1-arithmetic": {
    status: "partial",
    sources: [
      { file: DE, where: "pp. 3–4", what: "binary + − × ÷, 1's and 2's complement with the shortcut" },
      { file: DE, where: "pp. 8–10", what: "signed magnitude vs 2's complement, range, subtraction by 2's complement" },
    ],
    missing:
      "Overflow detection — when adding two numbers of the same sign gives a result of the other sign — is not in the notes.",
    learnFrom: `the study note for this topic in Notes (it covers the missing part) — or ${MANO} §1.6, or ${NESO}`,
  },
  "deco-u1-codes": {
    status: "partial",
    sources: [{ file: DE, where: "pp. 10–12", what: "BCD 8421 / 2421, Excess-3, Gray ↔ binary" }],
    missing:
      "Parity and error-detection codes — the actual syllabus topic — are not in the notes at all. Only the BCD, Excess-3 and Gray codes are.",
    learnFrom: `the study note for this topic in Notes (it covers the missing part) — or ${MANO} §1.7 (error-detecting code), or ${NESO}`,
  },
  "deco-u1-boolean": {
    status: "partial",
    sources: [
      { file: DE, where: "pp. 12–13", what: "idempotent, associative, distributive, commutative, De Morgan, identity, complement, involution" },
      { file: DE, where: "pp. 23–25", what: "complement of a function, duality, self-dual functions" },
    ],
    missing: "The absorption and consensus theorems are missing from the list of laws.",
    learnFrom: `the study note for this topic in Notes (it covers the missing part) — or ${MANO} §2.4`,
  },
  "deco-u1-implementation": {
    status: "partial",
    sources: [
      { file: DE, where: "p. 19", what: "Boolean expressions, SOP and POS" },
      { file: DE, where: "p. 31", what: "one worked expression → gate circuit" },
    ],
    missing: "Only one worked expression-to-circuit example, and no circuit-to-expression practice.",
    learnFrom: `the study note for this topic in Notes (it covers the missing part) — or ${MANO} §2.6–2.8`,
  },
  "deco-u1-gates": {
    status: "covered",
    sources: [{ file: DE, where: "pp. 14–18", what: "all seven gates, NAND/NOR as universal, XOR/XNOR from NAND and NOR" }],
  },

  /* ── DE+CO · Unit II ────────────────────────────────────── */
  "deco-u2-intro": {
    status: "covered",
    sources: [{ file: DE, where: "pp. 30–31", what: "combinational circuit, worked design: truth table → K-map → circuit" }],
  },
  "deco-u1-canonical": {
    status: "covered",
    sources: [
      { file: DE, where: "pp. 19–22", what: "minterms, maxterms, Σm / ΠM, canonical SOP and POS" },
      { file: DE, where: "p. 24", what: "converting canonical SOP ↔ POS" },
    ],
  },
  "deco-u1-kmap": {
    status: "covered",
    sources: [{ file: DE, where: "pp. 26–27", what: "2-, 3- and 4-variable maps, Gray-code order, grouping" }],
  },
  "deco-u1-kmap-pos": {
    status: "covered",
    sources: [{ file: DE, where: "p. 29", what: "K-map for POS, grouping the zeros" }],
  },
  "deco-u1-kmap-dontcare": {
    status: "partial",
    sources: [{ file: DE, where: "p. 27", what: "one line on don't-cares" }],
    missing: "Don't-cares get one line and no worked example with + d(…).",
    learnFrom: `the study note for this topic in Notes (it covers the missing part) — or ${MANO} §3.6`,
  },
  "deco-u1-implicants": {
    status: "covered",
    sources: [{ file: DE, where: "pp. 28–29", what: "prime and essential prime implicants, counted on a worked map" }],
  },
  "deco-u1-kmap5": {
    status: "covered",
    sources: [{ file: DE, where: "p. 28", what: "5-variable map as two 4-variable maps" }],
  },
  "deco-u2-adders": {
    status: "covered",
    sources: [{ file: DE, where: "pp. 31–38", what: "half/full adder, full adder from two half adders, half/full subtractor, ripple adder, carry look-ahead" }],
  },
  "deco-u2-mux": {
    status: "covered",
    sources: [
      { file: DE, where: "pp. 39–42", what: "2:1, 4:1, 8:1 MUX, a function on an 8:1 and on a 4:1 MUX" },
      { file: DE, where: "pp. 43–45", what: "1:2 and 1:4 demultiplexer" },
    ],
  },
  "deco-u2-codec": {
    status: "covered",
    sources: [{ file: DE, where: "pp. 46–48", what: "decoder, full adder from a 3:8 decoder, encoders, priority encoder" }],
  },
  "deco-u2-comparators": {
    status: "missing",
    sources: [],
    missing: "Magnitude comparators (A>B, A=B, A<B for 1 and 2 bits) are not in the notes at all.",
    learnFrom: `the study note for this topic in Notes (it covers the missing part) — or ${MANO} §4.8, or ${NESO}`,
  },

  /* ── DE+CO · Unit III ───────────────────────────────────── */
  "deco-u3-latches": {
    status: "covered",
    sources: [{ file: DE, where: "pp. 49–50", what: "sequential = combinational + memory, SR latch in NOR and NAND" }],
  },
  "deco-u3-flipflops": {
    status: "covered",
    sources: [
      { file: DE, where: "pp. 51–55", what: "clocked SR (NAND, NOR), SR excitation table, JK characteristic and excitation" },
      { file: DE, where: "pp. 59–60", what: "T and D flip-flops" },
    ],
  },
  "deco-u3-master-slave": {
    status: "partial",
    sources: [{ file: DE, where: "pp. 56–58", what: "edge vs level triggering, race-around in JK, master–slave JK" }],
    missing:
      "No side-by-side latch vs edge-triggered flip-flop comparison with a timing diagram — Class Test question 5.",
    learnFrom: `the study note for this topic in Notes (it covers the missing part) — or Floyd, Digital Fundamentals ch. 7, or ${NESO}`,
  },
  "deco-u3-sync-fundamentals": {
    status: "missing",
    sources: [{ file: DE, where: "p. 49", what: "only the block diagram of a sequential circuit" }],
    missing: "Moore vs Mealy machines, state tables and state diagrams are not in the notes.",
    learnFrom: `the study note for this topic in Notes (it covers the missing part) — or ${MANO} §5.5, or ${NESO}`,
  },
  "deco-u3-clocked": {
    status: "partial",
    sources: [
      { file: DE, where: "pp. 61–67", what: "flip-flop conversions using excitation tables and K-maps" },
      { file: DE, where: "pp. 71–72", what: "steps to design a synchronous circuit, worked with D flip-flops" },
    ],
    missing: "Analysis — taking a given clocked circuit to its state table and state diagram — is not covered; only design is.",
    learnFrom: `the study note for this topic in Notes (it covers the missing part) — or ${MANO} §5.5`,
  },
  "deco-u3-counters": {
    status: "partial",
    sources: [{ file: DE, where: "pp. 68–72", what: "MOD-N counting, flip-flops needed, sync vs async, up/down, a 2-bit synchronous design" }],
    missing:
      "The 3-bit synchronous up counter with JK or T flip-flops (lab experiment 10) isn't worked, and building a MOD-N by clearing on the count isn't shown.",
    learnFrom: `the study note for this topic in Notes (it covers the missing part) — or ${MANO} §6.3–6.4`,
  },
  "deco-u3-registers": {
    status: "covered",
    sources: [{ file: DE, where: "pp. 73–76", what: "SISO, SIPO, PISO, PIPO with clock counts, ring and Johnson counters" }],
  },

  /* ── Applied Calculus · Unit II (Friday's deck) ─────────── */
  "calc-u2-limits2": {
    status: "covered",
    sources: [
      { file: CALC, where: "slides 4–16", what: "domain, level curves, ε–δ, path test, polar coordinates, decision procedure, Practice A" },
      { file: CALC, where: "slides 17–19", what: "continuity, choosing a value, when none works" },
      { file: CALC, where: "slides 28–36", what: "differentiability, sufficient condition, counterexample, Practice C" },
    ],
  },
  "calc-u2-partial": {
    status: "covered",
    sources: [{ file: CALC, where: "slides 20–27", what: "definition, working rules, solved examples, mixed partials and Clairaut, Practice B" }],
  },
  "calc-u2-total": {
    status: "covered",
    sources: [
      { file: CALC, where: "slides 37–44", what: "gradient and differential, tangent plane, approximation, chain rules, error propagation, Practice D" },
      { file: CALC, where: "slide 79", what: "formula sheet: differentiation" },
    ],
  },
  "calc-u2-euler": {
    status: "covered",
    sources: [{ file: CALC, where: "slides 45–54", what: "homogeneity, Euler's theorem and proof, second-order identity, composite functions, Practice E" }],
  },
  "calc-u2-taylor2": {
    status: "covered",
    sources: [
      { file: CALC, where: "slides 55–73", what: "T₁, T₂, T₃, remainder, working rule, Maclaurin examples, Practice F and G" },
      { file: CALC, where: "slides 74–82", what: "mixed revision, common mistakes, Taylor formula sheet, exit questions" },
    ],
  },

  /* ── Linux · Unit I (theory for the lab quizzes and viva) ─ */
  "linux-u1-os": {
    status: "covered",
    sources: [{ file: L_HIST, where: "“Operating System Concept”", what: "OS as a resource manager, layers, what the kernel provides" }],
  },
  "linux-u1-history": {
    status: "covered",
    sources: [
      { file: L_HIST, where: "“History of UNIX & Linux”", what: "MULTICS → UNIX → SysV/BSD → Linux (1991), POSIX" },
      { file: L_ARCH, where: "slides 1–3", what: "what Linux is, history" },
      { file: L_LAB1, where: "Q1", what: "UNIX vs Linux, answered" },
    ],
  },
  "linux-u1-distros": {
    status: "covered",
    sources: [
      { file: L_ARCH, where: "slides 4–5", what: "what a distribution is, ten examples" },
      { file: L_HIST, where: "“A Linux Distribution”", what: "kernel + utilities + GUI + applications" },
    ],
  },
  "linux-u1-architecture": {
    status: "partial",
    sources: [
      { file: L_ARCH, where: "slides 6–11", what: "hardware, kernel (types and jobs), shell, applications" },
      { file: L_HIST, where: "“Architecture of Linux” ×2", what: "kernel, shells and GUIs, utilities, daemons" },
    ],
    missing:
      "Lab 1 asks you to \"discuss the structure of the Linux OS\" but leaves the answer blank, and slide 6's diagram is only a title. Write the answer yourself from these slides, with the layered diagram drawn.",
  },
  "linux-u1-filesystem": {
    status: "covered",
    sources: [{ file: L_HIST, where: "“Basic Principals” → “Summary: Directory Structure”", what: "basic principles, four file types, hard/soft links, /bin … /usr/lib, directory summary" }],
  },
  "linux-u1-paths": {
    status: "partial",
    sources: [
      { file: L_HIST, where: "“Logging into a Linux System”, “Absolute & Relative Paths”", what: "logging in, absolute vs relative paths" },
      { file: L_LAB1, where: "Q4–Q6", what: "internal vs external commands, paths, metacharacters" },
    ],
    missing:
      "Metacharacters stop at * and ? — [ ], redirection (> >> <), pipe | and ; aren't explained. Lab 1's last question, five differences between Linux and Windows, has no answer in any handout.",
  },
  "linux-u1-commands": {
    status: "covered",
    sources: [
      { file: L_CMDS, where: "all", what: "18 commands with syntax, ls options in detail" },
      { file: L_HIST, where: "“Basic Linux Commands” ×8", what: "ls, cd, su, id, passwd, man, ps, top, free, cal, echo, df, du, uname, cp, mv, mkdir, rm" },
    ],
  },
  "linux-u1-install": {
    status: "partial",
    sources: [{ file: L_VM, where: "pp. 1–8", what: "VirtualBox + Ubuntu 24.04, RAM/disk sizing, Guest Additions" }],
    missing:
      "The guide is for VirtualBox on Windows. On an Apple-silicon Mac use UTM with an ARM64 Ubuntu image. Experiment 1's run levels, boot, reboot and shutdown aren't covered by any handout.",
  },
  "linux-u1-labfile": {
    status: "covered",
    sources: [{ file: L_FMT, where: "all", what: "title page, index, formatting, screenshot rules, SOPs" }],
  },
  /* ── CDT · Unit 1 ───────────────────────────────────────── */
  "cdt-u1-intro": { status: "covered", sources: [{ file: CDT1, where: "slides 4–6", what: "definition, focus, where it's used, why it matters" }] },
  "cdt-u1-elements": { status: "covered", sources: [{ file: CDT1, where: "slide 7", what: "decomposition, pattern recognition, abstraction, algorithm design" }] },
  "cdt-u1-lenses": { status: "covered", sources: [{ file: CDT1, where: "slide 8", what: "design-thinking vs computational-thinking questions" }] },
  "cdt-u1-problems": { status: "covered", sources: [{ file: CDT1, where: "slides 9–14", what: "what a problem is, well- vs ill-structured, the comparison table" }] },
  "cdt-u1-solver": { status: "covered", sources: [{ file: CDT1, where: "slides 15–21", what: "twelve traits in three mindset groups" }] },
  "cdt-u1-models": { status: "covered", sources: [{ file: CDT1, where: "slides 22–34", what: "why models help, IDEAL step by step, Polya step by step" }] },
  "cdt-u1-process": { status: "covered", sources: [{ file: CDT1, where: "slides 35–42", what: "understand → plan → solve → verify → reflect, campus-app example" }] },
  "cdt-u1-hcd": { status: "covered", sources: [{ file: CDT1, where: "slides 43–56", what: "HCD, its principles, clinic case, empathy map, user interviews" }] },
  "cdt-u1-requirements": { status: "covered", sources: [{ file: CDT1, where: "slides 57–63", what: "problem statements, functional vs technical requirements, POV, How Might We" }] },

  /* ── CDT · Unit 2 ───────────────────────────────────────── */
  "cdt-u2-creative": { status: "covered", sources: [{ file: CDT2, where: "slides 1–3", what: "roadmap, creativity = novel + useful + implementable" }] },
  "cdt-u2-divergent": { status: "covered", sources: [{ file: CDT2, where: "slides 4–8", what: "two modes, comparison table, double diamond, 30-uses drill" }] },
  "cdt-u2-brainstorm": { status: "covered", sources: [{ file: CDT2, where: "slides 9–13", what: "Osborn's rules, why groups underperform, 6-3-5, which to use" }] },
  "cdt-u2-scamper": { status: "covered", sources: [{ file: CDT2, where: "slides 14–17", what: "the seven prompts on the attendance register, pair activity" }] },
  "cdt-u2-mindmap": { status: "covered", sources: [{ file: CDT2, where: "slides 18–19", what: "rules, good/weak for, worked campus-app map" }] },
  "cdt-u2-lateral": { status: "covered", sources: [{ file: CDT2, where: "slides 20–22", what: "vertical vs lateral, four tools, random word + reversal" }] },
  "cdt-u2-dt-process": { status: "covered", sources: [{ file: CDT2, where: "slides 23–27", what: "five stages; empathize, define (POV + HMW), ideate" }] },
  "cdt-u2-selecting": { status: "covered", sources: [{ file: CDT2, where: "slides 28–35", what: "shortlisting, dot voting, NUF, impact–effort, weighted matrix, wrap-up, quick check" }] },

  /* ── Foundations of AI · Units I–II ─────────────────────── */
  "ai-u1-defn": {
    status: "covered",
    sources: [{ file: "1-Introduction.pptx.pdf", where: "slides 1–8", what: "what AI is, AI vs human intelligence, scope vs applications, scope and applications of AI" }],
  },
  "ai-u1-turing": {
    status: "partial",
    sources: [
      { file: "2-turing test.pptx.pdf", where: "slides 1–11", what: "Turing Test — the imitation game, how it works, the criterion for AI, and the critics' limited-scope objection" },
      { file: "1-Introduction.pptx.pdf", where: "slide 1", what: "brief historical context / evolution" },
    ],
    missing: "The Chinese Room argument is not in the notes — only the Turing Test and its critiques. Historical evolution is barely touched.",
    learnFrom: "a short video on Searle's Chinese Room argument; a timeline of AI history (GeeksforGeeks)",
  },
  "ai-u1-domains": {
    status: "covered",
    sources: [
      { file: "6-Components of AI.pptx.pdf", where: "slides 1–18", what: "technical and functional components of AI (= the domains/subfields)" },
      { file: "1-Introduction.pptx.pdf", where: "slides 6–7", what: "applications of AI" },
    ],
  },
  "ai-u1-representation": {
    status: "partial",
    sources: [
      { file: "3-Problem representation in AI.pptx.pdf", where: "slides 1–15", what: "problem formulation, state-space representation, problem-solving as search, representation schemes (graph, constraint)" },
      { file: "9-Problem reduction in AI.pptx.pdf", where: "slides 1–14", what: "problem reduction — breaking a problem into AND/OR sub-problems (from the separate deck)" },
    ],
    missing: "Your 8 Unit-1 PDFs cover problem representation but NOT problem reduction / AND-OR graphs — that only comes from the separate Problem Reduction deck (attached here), and it's what AO* in Unit 2 builds on.",
    learnFrom: "the Problem Reduction deck attached to this topic, or a video on AND-OR graphs / problem reduction",
  },
  "ai-u1-statespace": {
    status: "covered",
    sources: [{ file: "5-State Space Search.pptx.pdf", where: "slides 1–11", what: "state space search — key concepts, challenges and applications" }],
  },
  "ai-u1-problemsolving": {
    status: "covered",
    sources: [
      { file: "7 - Problem Solving in AI.pptx.pdf", where: "slides 1–15", what: "problem-solving process — recoverable/irrecoverable problems, steps in designing an AI problem, CSP" },
      { file: "4-Characteristics of AI problem.pptx.pdf", where: "slides 1–23", what: "characteristics of AI problems — decomposability, uncertainty, complexity, heuristic approach" },
    ],
  },
  "ai-u1-search": {
    status: "covered",
    sources: [{ file: "8-AI and Search Process.pdf", where: "slides 1–57", what: "the whole search process — uninformed (BFS/DFS/UCS/DLS/IDS/bidirectional), informed (greedy, A*), local search and adversarial. Very thorough — spills well into Unit 2." }],
  },
  "ai-u2-agents": {
    status: "covered",
    sources: [{ file: "10 Agent & Environment.pptx.pdf", where: "slides 1–58", what: "intelligent agents, PEAS, rationality, agent types (simple reflex → model/goal/utility/learning) and environment types" }],
  },
  "ai-u2-knowledge": {
    status: "covered",
    sources: [{ file: "KR in AI.pdf", where: "pp. 1–34", what: "knowledge representation — logical (propositional/predicate) representation, syntax & semantics, tautology/contradiction, procedural vs declarative, frames, semantic networks" }],
  },
};

/** Units the notes don't reach at all. Shown once on the subject page. */
export const unitGaps: Record<string, { units: number[]; note: string }> = {
  "computational-design-thinking": {
    units: [3, 4, 5],
    note: "Only the Unit 1 and Unit 2 decks have been shared. Units 3–5 (algorithms, critical thinking, applications) have no deck yet. They aren't in the mid-sem.",
  },
  "digital-electronics": {
    units: [4, 5],
    note: "DENotes.pdf stops at Unit III. There is nothing for Units IV–V (structure of computers, processor and memory). They aren't in the mid-sem, but you'll need another source before the end-term.",
  },
};

/**
 * The coverage for a topic, including topics in units the notes never reach
 * (those come back as `missing`). Null when no notes have been mapped for
 * the subject at all — no alert is better than a false one.
 */
/** Just the alert level, for badges in topic lists. */
export function notesGapOf(code: string, subjectSlug: string, unitNumber: number): "partial" | "missing" | undefined {
  const c = coverageOf(code, subjectSlug, unitNumber);
  return c && c.status !== "covered" ? c.status : undefined;
}

export function coverageOf(code: string, subjectSlug?: string, unitNumber?: number): Coverage | null {
  const c = coverage[code];
  if (c) return c;
  const gap = subjectSlug ? unitGaps[subjectSlug] : undefined;
  if (gap && unitNumber !== undefined && gap.units.includes(unitNumber)) {
    return { status: "missing", sources: [], missing: gap.note };
  }
  return null;
}
