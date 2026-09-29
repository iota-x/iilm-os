/**
 * Exam "sprints" — a strict, ordered video checklist per subject for the
 * mid-sem. Rendered natively at /sprint with per-step progress kept in the
 * browser (localStorage). Content mirrors the standalone sprint sheets.
 */

export interface SprintVideo {
  title: string;
  url: string;
  dur?: string;
}
export interface SprintStep {
  id: string;
  kind: "watch" | "do" | "gap" | "core";
  title: string;
  note?: string;
  videos?: SprintVideo[];
  /** short mono cheat-sheet lines shown under the step */
  facts?: string[];
  milestone?: boolean;
}
export interface SprintGroup {
  heading: string;
  tag?: string;
  steps: SprintStep[];
}
export interface Sprint {
  /** subject slug */
  subject: string;
  title: string;
  examLine: string;
  scopeLine: string;
  intro?: string;
  groups: SprintGroup[];
}

const calculus: Sprint = {
  subject: "applied-calculus",
  title: "Calculus Sprint",
  examLine: "Theory: Tue 6 Oct · 2–3 PM · Lab viva 12:15 PM",
  scopeLine: "Units 1 & 2 only — Unit 3 isn't on the paper.",
  intro:
    "Starting from zero → exam-ready. Steps 1–5 are the foundations (trig, limits, how to take a derivative) and can't be skipped. Watch with paper next to you and re-do every worked example by hand.",
  groups: [
    {
      heading: "Foundations",
      tag: "from zero · steps 1–5",
      steps: [
        {
          id: "c1", kind: "watch", title: "Trigonometry — the basics",
          note: "SOH-CAH-TOA, the six ratios, degrees vs radians. Skim what you remember.",
          videos: [{ title: "Trigonometry — Basic Introduction", url: "https://www.youtube.com/watch?v=g8VCHoSk5_o", dur: "~50m, skim" }],
        },
        {
          id: "c2", kind: "watch", title: "What a limit is & how to evaluate one",
          note: "Unit 1 starts with limits, and derivatives are defined by a limit. Direct substitution, factoring, the 0/0 case.",
          videos: [{ title: "Introduction to Limits", url: "https://www.youtube.com/watch?v=YNstP0ESndU", dur: "~40m" }],
        },
        {
          id: "c3", kind: "core", title: "Derivatives from scratch — first principles + all the rules",
          note: "The most important step. Shows WHY (e.g. why d/dx of 10x is 10) from the limit definition, then power / product / quotient / chain and the derivatives of trig, log, exp.",
          videos: [{ title: "Derivatives for Beginners — Basic Introduction", url: "https://www.youtube.com/watch?v=FLAm7Hqm-58", dur: "~58m" }],
        },
        {
          id: "c4", kind: "watch", title: "Trig limits — the sin x / x result",
          note: "lim(x→0) sinx/x = 1 turns up in loads of Unit 1 limit problems.",
          videos: [{ title: "Limits of Trigonometric Functions", url: "https://www.youtube.com/watch?v=HbtuSC_WOW0", dur: "~20m" }],
        },
        {
          id: "c5", kind: "do", title: "Write the cheat sheet out by hand → Foundations done", milestone: true,
          facts: [
            "sin 0,30,45,60,90 = 0, 1/2, 1/√2, √3/2, 1   (cos is the reverse)",
            "sin²x+cos²x=1 · 1+tan²x=sec²x · lim(x→0) sinx/x = 1",
            "(xⁿ)′=n·xⁿ⁻¹ · (c)′=0 · (uv)′=u′v+uv′ · (u/v)′=(u′v−uv′)/v²",
            "chain: (f(g))′=f′(g)·g′ · (eˣ)′=eˣ · (ln x)′=1/x · (sinx)′=cosx",
          ],
        },
      ],
    },
    {
      heading: "Unit 1 · One-Variable",
      tag: "steps 6–11 · ~3 hr",
      steps: [
        { id: "c6", kind: "watch", title: "Limit, continuity & differentiability (one variable)", note: "Differentiable ⇒ continuous, but not the reverse. Know the |x|-at-0 counterexample.", videos: [{ title: "Limit & Continuity (Engineering Maths)", url: "https://www.youtube.com/watch?v=28QlCKm61aE", dur: "~30m" }] },
        { id: "c7", kind: "watch", title: "Successive differentiation & Leibnitz — Part I", note: "nth derivative of standard functions.", videos: [{ title: "Leibnitz Theorem — Part I (GP Sir)", url: "https://www.youtube.com/watch?v=EGnI8WyYb3o", dur: "~25m" }] },
        { id: "c8", kind: "watch", title: "Successive differentiation & Leibnitz — Part II", note: "Leibnitz's rule for the nth derivative of a product.", videos: [{ title: "Leibnitz Theorem — Part II (GP Sir)", url: "https://www.youtube.com/watch?v=-6RerbAHWDw", dur: "~25m" }] },
        { id: "c9", kind: "watch", title: "Rolle's theorem + Lagrange's MVT", note: "One video, both theorems. The three hypotheses + the |x| on [−1,1] Rolle counterexample.", videos: [{ title: "Rolle's & Mean Value Theorem", url: "https://www.youtube.com/watch?v=kiE4qCOj3P4", dur: "~20m" }] },
        { id: "c10", kind: "watch", title: "Taylor's & Maclaurin's theorem (one variable)", note: "Expansion + remainder term; Maclaurin = a=0 case. Memorise eˣ, sinx, cosx, log(1+x).", videos: [{ title: "Taylor's Theorem (GP Sir)", url: "https://www.youtube.com/watch?v=bSKio7jxYc4", dur: "~30m" }] },
        { id: "c11", kind: "do", title: "5 problems → Unit 1 done", milestone: true, note: "2 Rolle/LMVT verifications, 1 successive-differentiation nth derivative, 2 Taylor/Maclaurin expansions." },
      ],
    },
    {
      heading: "Unit 2 · Two-Variable",
      tag: "steps 12–17 · ~4 hr",
      steps: [
        { id: "c12", kind: "watch", title: "Limit & continuity of a function of two variables", note: "Approach along different paths (y=mx vs y=x²): if the value changes, the limit doesn't exist.", videos: [{ title: "Two-Variable Limit & Continuity — one-shot (GP Sir)", url: "https://www.youtube.com/watch?v=ZaJhfsTXzXY", dur: "~40m" }] },
        { id: "c13", kind: "watch", title: "Partial derivatives", note: "∂/∂x holds y constant. Second-order + mixed partials (f_xy = f_yx).", videos: [{ title: "Partial Derivatives (Engineering Maths)", url: "https://www.youtube.com/watch?v=uvvE4TDYCVw", dur: "~25m" }] },
        { id: "c14", kind: "watch", title: "Total derivative & chain rule", note: "df/dt = f_x·(dx/dt) + f_y·(dy/dt) — along a curve / composite functions.", videos: [{ title: "Total Differentiation — Example & Question (GP Sir)", url: "https://www.youtube.com/watch?v=9GKfvknvTQk", dur: "~20m" }] },
        { id: "c15", kind: "watch", title: "Euler's theorem for homogeneous functions", note: "u homogeneous of degree n ⟹ x·u_x + y·u_y = n·u. Statement, proof, second-order form.", videos: [{ title: "Euler's Theorem (Homogeneous Function)", url: "https://www.youtube.com/watch?v=bTs7ncA_AtY", dur: "~25m" }] },
        { id: "c16", kind: "watch", title: "Taylor & Maclaurin for two variables", note: "Expand f(x,y) about a point up to 2nd/3rd order using the (h∂ₓ + k∂ᵧ) form.", videos: [{ title: "Taylor Series for f(x,y) (GP Sir)", url: "https://www.youtube.com/watch?v=qLqbltyOV6Q", dur: "~25m" }] },
        { id: "c17", kind: "do", title: "5 problems → Unit 2 done", milestone: true, note: "2 two-path limit counterexamples, 1 Euler, 1 total derivative, 1 Taylor-2var expansion." },
      ],
    },
    {
      heading: "Then — revise",
      steps: [
        { id: "c18", kind: "do", title: "Timed mixed problem set (U1 + U2)", note: "90 minutes, no notes — matches your plan's mock day." },
        { id: "c19", kind: "do", title: "Method sheets + the counterexamples from memory", note: "One page per topic. Rewrite the two-path counterexamples from blank paper." },
      ],
    },
  ],
};

const deco: Sprint = {
  subject: "digital-electronics",
  title: "DE+CO Sprint",
  examLine: "Theory: Thu 8 Oct · 2–3 PM · Lab 4:00 PM",
  scopeLine: "Units 1 & 2 only — Unit 3 (flip-flops, counters, registers) is not on the paper.",
  intro:
    "You already have the main Unit 1 video, so Part A only fills the gaps your notes skip. Part B teaches Unit 2 end to end. All videos are Neso Academy — the standard for this subject.",
  groups: [
    {
      heading: "Unit 1 · fill the gaps",
      tag: "steps 1–4",
      steps: [
        { id: "d1", kind: "gap", title: "Overflow detection in binary addition", note: "Same-sign inputs adding to an opposite-sign result. Your notes cover 1's/2's complement but skip overflow.", videos: [{ title: "2's Complement Addition & Overflow (Neso)", url: "https://www.youtube.com/watch?v=vl1LYH26RCM", dur: "~9m" }] },
        { id: "d2", kind: "gap", title: "Parity & error-detection codes", note: "The actual syllabus topic. Your notes have BCD / Excess-3 / Gray but not parity.", videos: [{ title: "Error Detecting Code — Parity (odd/even)", url: "https://www.youtube.com/watch?v=Bwih7_AT1oI", dur: "~12m" }] },
        { id: "d3", kind: "gap", title: "Absorption & consensus (redundancy) theorems", note: "The two Boolean laws missing from your notes. Consensus = redundancy law.", videos: [{ title: "Absorption & Redundancy (Consensus) Law", url: "https://www.youtube.com/watch?v=kcekwNJRAHM", dur: "~10m" }] },
        {
          id: "d4", kind: "do", title: "Add these into your notes → Unit 1 gaps closed", milestone: true,
          facts: [
            "Overflow: same-sign inputs → result of opposite sign.",
            "Absorption: A + AB = A · A(A+B) = A",
            "Consensus: AB + A′C + BC = AB + A′C  (drop BC)",
            "Then: one circuit → expression, one expression → circuit.",
          ],
        },
      ],
    },
    {
      heading: "Unit 2 · Combinational Logic",
      tag: "steps 5–10 · learn it all",
      steps: [
        { id: "d5", kind: "watch", title: "SOP & POS, minterms/maxterms, K-map minimisation", note: "The backbone of Unit 2. Do SOP (group 1s) AND POS (group 0s), plus don't-cares with +d(…). 2-, 3- and 4-variable maps.", videos: [{ title: "Minterm/Maxterm, SOP/POS & K-map", url: "https://www.youtube.com/watch?v=zAI7u1Oz3KQ", dur: "~30m" }] },
        { id: "d6", kind: "watch", title: "Adders & subtractors", note: "Half adder → full adder (= two half adders); Sum = A⊕B⊕C. Half/full subtractor the same way.", videos: [{ title: "Half Adder (Neso)", url: "https://www.youtube.com/watch?v=aLUY-s7LSns", dur: "~7m" }, { title: "Full Adder (Neso)", url: "https://www.youtube.com/watch?v=RK3P9L2ZXk4", dur: "~9m" }] },
        { id: "d7", kind: "watch", title: "Multiplexers & realising a function on a MUX", note: "F(A,B,C)=Σm(…) on an 8:1 MUX (and a 4:1 with one variable at the inputs) is a near-guaranteed question.", videos: [{ title: "Introduction to Multiplexers (Neso)", url: "https://www.youtube.com/watch?v=FKvnmxte98A", dur: "~10m" }, { title: "Boolean Function using a MUX", url: "https://www.youtube.com/watch?v=vOFeSu6Zr94", dur: "~12m" }] },
        { id: "d8", kind: "watch", title: "Encoders & decoders", note: "Decoder basics, a full adder from a 3:8 decoder, and the priority encoder.", videos: [{ title: "Introduction to Encoders & Decoders (Neso)", url: "https://www.youtube.com/watch?v=feBvhLFQEDk", dur: "~11m" }] },
        { id: "d9", kind: "watch", title: "Magnitude comparator", note: "A>B, A=B, A<B for 1-bit and 2-bit. Missing from your notes entirely.", videos: [{ title: "2-Bit Comparator (Neso)", url: "https://www.youtube.com/watch?v=BhUUmbz76P0", dur: "~13m" }] },
        { id: "d10", kind: "do", title: "5 problems → Unit 2 done", milestone: true, note: "1 K-map SOP+POS, 1 don't-care, F on an 8:1 MUX, a 2-bit comparator, a full adder from a 3:8 decoder." },
      ],
    },
    {
      heading: "Then — revise",
      steps: [
        { id: "d11", kind: "do", title: "Timed mixed problem set (U1 + U2)", note: "Conversions, complements & overflow, Boolean simplification, K-map, one MUX/decoder/comparator design." },
        { id: "d12", kind: "do", title: "Method sheets from memory", note: "One page each: conversion + 2's-complement subtraction, K-map (SOP & POS), full adder, function-on-a-MUX, decoder/comparator." },
      ],
    },
  ],
};

const AI_PL = "https://www.youtube.com/playlist?list=PLNxx5gyq8aLB-RAQxfyScQLV6wHue-Gj6";

const ai: Sprint = {
  subject: "foundation-of-ai",
  title: "AI Sprint",
  examLine: "Theory: Wed 7 Oct · 2–3 PM",
  scopeLine: "Units 1 & 2. You attended Unit 1 — the focus here is Unit 2 (agents & search), which you missed.",
  intro:
    "All from Gate Smashers' Artificial Intelligence playlist (numbered lectures, one topic each). Where I have the exact lecture it's linked directly; otherwise open the playlist and pick the titled lecture. Your Agent & Environment and KR decks are now on the matching topic pages in Notes.",
  groups: [
    {
      heading: "Unit 1 · quick revise + 2 gaps",
      tag: "you studied this from 8 PDFs",
      steps: [
        {
          id: "a1", kind: "watch", title: "State space & the problem-solving process",
          note: "The bridge into Unit 2 — how a problem becomes a graph of states. Your 8 Unit 1 decks are on their topic pages in Notes; skim them, this ties the search part together.",
          videos: [{ title: "What is State Space Search (Gate Smashers)", url: "https://www.youtube.com/watch?v=E5jVBqe59EE", dur: "~10m" }],
        },
        {
          id: "a1b", kind: "gap", title: "Chinese Room argument — gap in your notes",
          note: "Your Turing-test deck covers the Turing Test but not Searle's Chinese Room, and the syllabus names both. Point: syntax isn't enough for semantics.",
          videos: [{ title: "The Chinese Room thought experiment (Searle)", url: "https://www.youtube.com/watch?v=tBE06SdgzwM", dur: "~6m" }],
        },
        {
          id: "a1c", kind: "gap", title: "Problem reduction & AND-OR graphs — gap in your notes",
          note: "Your 8 decks cover problem representation but not reduction. AND-OR graphs decompose a problem into AND/OR sub-problems — and it's what AO* (Unit 2) runs on.",
          videos: [{ title: "AO* Search — problem reduction with AND-OR graphs", url: "https://www.youtube.com/watch?v=NiY32wS2UVw", dur: "~12m" }],
        },
      ],
    },
    {
      heading: "Unit 2 · Agents & Search",
      tag: "you missed these · learn from scratch",
      steps: [
        {
          id: "a2", kind: "watch", title: "Intelligent agents, PEAS & agent types",
          note: "Watch the agent run: simple reflex → model-based → goal-based → utility. PEAS = Performance, Environment, Actuators, Sensors. Your 58-slide Agent & Environment deck is the same material.",
          videos: [
            { title: "Goal-Based Agents (Gate Smashers)", url: "https://www.youtube.com/watch?v=HsdiMkKnNLk", dur: "~8m" },
            { title: "Agents & their types — full run", url: AI_PL, dur: "in playlist" },
          ],
        },
        {
          id: "a3", kind: "watch", title: "Uninformed (blind) search — the problem-solving agent",
          note: "Brute-force search: expanding nodes with no heuristic. Sets up BFS/DFS.",
          videos: [{ title: "Uninformed / Blind Search (Gate Smashers)", url: AI_PL, dur: "in playlist" }],
        },
        {
          id: "a4", kind: "watch", title: "Breadth-first & depth-first search",
          note: "Queue (FIFO) vs stack (LIFO); complete? optimal? memory? Draw the trees as you watch.",
          videos: [
            { title: "Lec-7: Breadth First Search (Gate Smashers)", url: "https://www.youtube.com/watch?v=qul0f79gxGs", dur: "~12m" },
            { title: "Lec-8: Depth First Search (Gate Smashers)", url: "https://www.youtube.com/watch?v=f8luGFRtshY", dur: "~12m" },
          ],
        },
        {
          id: "a5", kind: "watch", title: "Heuristic search & Hill Climbing",
          note: "Heuristic h(n); hill climbing and its local-maxima / plateau / ridge problems.",
          videos: [
            { title: "8-Puzzle with Heuristic / Informed Search (Gate Smashers)", url: "https://www.youtube.com/watch?v=nmWGhb9E4es", dur: "~12m" },
            { title: "Hill Climbing Algorithm", url: AI_PL, dur: "in playlist" },
          ],
        },
        {
          id: "a6", kind: "watch", title: "Best First Search",
          note: "Greedy: expand the node with the best (lowest) h(n). Not optimal.",
          videos: [{ title: "Best First Search (Gate Smashers)", url: AI_PL, dur: "in playlist" }],
        },
        {
          id: "a7", kind: "watch", title: "A* and AO* algorithms",
          note: "A*: f(n) = g(n) + h(n) — the one to know cold. AO*: AND-OR graphs (ties back to problem reduction from Unit 1).",
          videos: [
            { title: "A* Algorithm with example", url: AI_PL, dur: "in playlist" },
            { title: "AO* Algorithm with example", url: AI_PL, dur: "in playlist" },
          ],
        },
        {
          id: "a8", kind: "watch", title: "Knowledge representation",
          note: "Logical (propositional / predicate) representation, semantic networks, frames. Your 34-page KR deck is on this topic in Notes.",
          videos: [{ title: "Knowledge Representation — Semantic Nets & Frames", url: AI_PL, dur: "in playlist" }],
        },
        {
          id: "a9", kind: "do", title: "5 problems → Unit 2 done", milestone: true,
          note: "Draw BFS, DFS and A* trees for water jug, 8-puzzle and missionaries & cannibals; write the PEAS / agent-types table.",
        },
      ],
    },
    {
      heading: "Then — revise",
      steps: [
        { id: "a10", kind: "do", title: "Trees + tables from memory", note: "Redraw the three search trees and the agent-types table on blank paper. Skim the Agent & KR decks in Notes." },
      ],
    },
  ],
};

export const sprints: Sprint[] = [calculus, deco, ai];
export const sprintFor = (slug: string) => sprints.find((s) => s.subject === slug) ?? null;
