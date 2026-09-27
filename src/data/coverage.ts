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
    learnFrom: `${MANO} §1.6, or ${NESO}`,
  },
  "deco-u1-codes": {
    status: "partial",
    sources: [{ file: DE, where: "pp. 10–12", what: "BCD 8421 / 2421, Excess-3, Gray ↔ binary" }],
    missing:
      "Parity and error-detection codes — the actual syllabus topic — are not in the notes at all. Only the BCD, Excess-3 and Gray codes are.",
    learnFrom: `${MANO} §1.7 (error-detecting code), or ${NESO}`,
  },
  "deco-u1-boolean": {
    status: "partial",
    sources: [
      { file: DE, where: "pp. 12–13", what: "idempotent, associative, distributive, commutative, De Morgan, identity, complement, involution" },
      { file: DE, where: "pp. 23–25", what: "complement of a function, duality, self-dual functions" },
    ],
    missing: "The absorption and consensus theorems are missing from the list of laws.",
    learnFrom: `${MANO} §2.4`,
  },
  "deco-u1-implementation": {
    status: "partial",
    sources: [
      { file: DE, where: "p. 19", what: "Boolean expressions, SOP and POS" },
      { file: DE, where: "p. 31", what: "one worked expression → gate circuit" },
    ],
    missing: "Only one worked expression-to-circuit example, and no circuit-to-expression practice.",
    learnFrom: `${MANO} §2.6–2.8`,
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
    learnFrom: `${MANO} §3.6`,
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
    learnFrom: `${MANO} §4.8, or ${NESO}`,
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
    learnFrom: `Floyd, Digital Fundamentals ch. 7, or ${NESO}`,
  },
  "deco-u3-sync-fundamentals": {
    status: "missing",
    sources: [{ file: DE, where: "p. 49", what: "only the block diagram of a sequential circuit" }],
    missing: "Moore vs Mealy machines, state tables and state diagrams are not in the notes.",
    learnFrom: `${MANO} §5.5, or ${NESO}`,
  },
  "deco-u3-clocked": {
    status: "partial",
    sources: [
      { file: DE, where: "pp. 61–67", what: "flip-flop conversions using excitation tables and K-maps" },
      { file: DE, where: "pp. 71–72", what: "steps to design a synchronous circuit, worked with D flip-flops" },
    ],
    missing: "Analysis — taking a given clocked circuit to its state table and state diagram — is not covered; only design is.",
    learnFrom: `${MANO} §5.5`,
  },
  "deco-u3-counters": {
    status: "partial",
    sources: [{ file: DE, where: "pp. 68–72", what: "MOD-N counting, flip-flops needed, sync vs async, up/down, a 2-bit synchronous design" }],
    missing:
      "The 3-bit synchronous up counter with JK or T flip-flops (lab experiment 10) isn't worked, and building a MOD-N by clearing on the count isn't shown.",
    learnFrom: `${MANO} §6.3–6.4`,
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
};

/** Units the notes don't reach at all. Shown once on the subject page. */
export const unitGaps: Record<string, { units: number[]; note: string }> = {
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
