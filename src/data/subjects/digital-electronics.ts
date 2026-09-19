import type { SeedSubject } from "../types";

// Source: "Course Plan — Digital Electronics and Computer Organization,
// CSE26102, Session 2026-27, Batch 2026-30" (Dr. Sambhavi Shukla, coordinator)
// and the CSE26102 syllabus sheet. Both PDFs are in digital_electronics/.
//
// Topic codes: the eight `deco-u1-*` codes from before the plan arrived are
// kept on purpose — the user's board photos, checkpoints and statuses hang
// off them. They now sit under the units the plan puts them in.
export const digitalElectronics: SeedSubject = {
  slug: "digital-electronics",
  name: "Digital Electronics and Computer Organization",
  shortName: "DE+CO",
  code: "CSE26102",
  credits: 3,
  ltpc: "3-0-0-3",
  color: "orange",
  status: "complete",
  teacher: "Dr. Puja Acharya (course coordinator: Dr. Sambhavi Shukla)",
  labTeacher: "Dr. Sambhavi Shukla",
  hasLab: true,
  labTitle: "Digital Electronics and Computer Organization Lab",
  labCode: null,
  labLtpc: "0-0-2-1",
  overview:
    "Two halves. The first is digital logic: number systems and codes, Boolean algebra and gates, then combinational design (SOP/POS, K-maps, adders, multiplexers, encoders, decoders) and sequential design (latches, flip-flops, counters, shift registers). The second is how a computer is put together: functional units, buses and the Von Neumann model, then registers, memory hierarchy and the fetch–decode–execute cycle. 45 sessions of 60 minutes. Mid-sem covers Units I–III; the whole syllabus comes back in the end-term.",
  midsemScope:
    "Units I, II and III — number systems and Boolean algebra, combinational logic design, synchronous sequential circuits. Conceptual, analytical and application-based questions. CO1, CO2, CO3.",
  midsemConfirmed: true,
  objectives: [
    "Understand and apply number systems and Boolean algebra in digital circuit design.",
    "Design and implement combinational and sequential logic circuits.",
    "Analyse synchronous sequential circuits including counters and registers.",
    "Understand the internal organisation of a computer system including CPU, memory and buses.",
  ],
  outcomes: [
    {
      code: "CO1",
      text: "Convert and analyse different number systems, binary arithmetic and Boolean expressions, and implement them using logic gates.",
      bloom: "K4 — Analysing",
    },
    {
      code: "CO2",
      text: "Implement combinational logic circuits using SOP/POS forms and minimisation techniques, including multiplexers, encoders and decoders.",
      bloom: "K6 — Creating",
    },
    {
      code: "CO3",
      text: "Analyse synchronous sequential circuits using flip-flops, counters and shift registers.",
      bloom: "K6 — Creating",
    },
    {
      code: "CO4",
      text: "Analyse the functional units (control unit, ALU, registers, buses) and bus structures of a Von Neumann computer, evaluate system performance, and differentiate multiprocessor from multicomputer architectures.",
      bloom: "K4 — Analysing",
    },
  ],
  units: [
    {
      number: 1,
      title: "Number Systems and Codes",
      sessions: 10,
      co: "CO1",
      assessment: "Quiz 1 (5 marks) after Unit I",
      inMidsem: true,
      topics: [
        {
          code: "deco-u1-number-systems",
          session: "S1",
          title: "Digital systems and number systems: binary, decimal, octal, hexadecimal",
          weight: 3,
          inMidsem: true,
          outcome:
            "Explain why digital systems use binary, and write any value in all four bases with positional weights.",
        },
        {
          code: "deco-u1-conversion",
          session: "S2",
          title: "Interconversion among number systems",
          weight: 4,
          inMidsem: true,
          outcome:
            "Convert between any two of binary, octal, decimal and hex — including fractions — quickly and without a calculator.",
          subtopics: [
            "Decimal → binary by repeated division; fractions by repeated multiplication",
            "Binary ↔ octal and hex by grouping 3 or 4 bits",
            "Octal ↔ hex via binary",
          ],
        },
        {
          code: "deco-u1-arithmetic",
          session: "S3",
          title: "Binary arithmetic and signed binary numbers",
          weight: 4,
          inMidsem: true,
          outcome:
            "Add, subtract, multiply and divide in binary; represent negatives in sign-magnitude, 1's and 2's complement, and subtract using complements with the correct overflow rule.",
          subtopics: [
            "Binary addition and subtraction with borrow",
            "1's complement and 2's complement of an n-bit number",
            "Subtraction by 2's complement: discard the end carry",
            "Range of an n-bit signed number and overflow detection",
          ],
        },
        {
          code: "deco-u1-codes",
          session: "S4",
          title: "Error-detection codes and parity",
          weight: 2,
          inMidsem: true,
          outcome:
            "Add even or odd parity to a word, detect a single-bit error, and explain why parity cannot correct one.",
        },
        {
          code: "deco-u1-boolean",
          session: "S5-S7",
          title: "Boolean algebra: laws, theorems and De Morgan",
          weight: 4,
          inMidsem: true,
          outcome:
            "Simplify a Boolean expression by hand using the identities, and apply De Morgan's theorems in both directions.",
          subtopics: [
            "Postulates, identity/null/idempotent/complement laws",
            "Absorption and consensus theorems",
            "De Morgan's theorems and complementing a whole function",
            "Duality principle",
          ],
        },
        {
          code: "deco-u1-implementation",
          session: "S8",
          title: "Implementation of Boolean expressions with gates",
          weight: 3,
          inMidsem: true,
          outcome:
            "Draw the gate-level circuit for a given expression, and write the expression for a given circuit.",
        },
        {
          code: "deco-u1-gates",
          session: "S9",
          title: "Logic gates: AND, OR, NOT, NAND, NOR, XOR, XNOR — NAND and NOR as universal gates",
          weight: 3,
          inMidsem: true,
          outcome: "Write the truth table for any gate and build any gate from NAND alone (and from NOR alone).",
        },
      ],
    },
    {
      number: 2,
      title: "Combinational Logic Design",
      sessions: 8,
      co: "CO2",
      assessment: "Class Test 1 (10 marks) — Unit II and half of Unit III",
      inMidsem: true,
      topics: [
        {
          code: "deco-u2-intro",
          session: "S1",
          title: "Combinational circuits: design procedure from a word problem to a circuit",
          weight: 2,
          inMidsem: true,
          outcome:
            "State the design steps — specification, truth table, simplification, circuit — and apply them to a small problem.",
        },
        {
          code: "deco-u1-canonical",
          session: "S2",
          title: "SOP and POS forms: minterms, maxterms and canonical expressions",
          weight: 4,
          inMidsem: true,
          outcome:
            "Convert between a truth table, Σm(...) / ΠM(...) notation, and a canonical expression without error.",
        },
        {
          code: "deco-u1-kmap",
          session: "S3",
          title: "Karnaugh maps: 2, 3 and 4 variables",
          weight: 5,
          inMidsem: true,
          outcome:
            "Lay out the Gray-code ordered map, plot the minterms, group in powers of two including wrap-around, and read off the minimal SOP.",
        },
        {
          code: "deco-u1-kmap-pos",
          session: "S3",
          title: "POS minimisation with K-maps (grouping the zeros)",
          weight: 4,
          inMidsem: true,
          outcome: "Produce the minimal POS from the same map, and know when it beats the SOP.",
        },
        {
          code: "deco-u1-kmap-dontcare",
          session: "S3",
          title: "Don't-care conditions",
          weight: 4,
          inMidsem: true,
          outcome: "Use X cells to enlarge a group only when it shortens the result.",
        },
        {
          code: "deco-u1-implicants",
          session: "S3",
          title: "Prime implicants, essential prime implicants and redundant groups",
          weight: 4,
          inMidsem: true,
          outcome:
            "Identify every essential prime implicant first, then cover what remains with the fewest extra groups — and explain why a group is redundant.",
        },
        {
          code: "deco-u1-kmap5",
          session: "S3",
          title: "5-variable K-maps (two 4-variable maps)",
          weight: 1,
          inMidsem: true,
          outcome: "Extend the method to five variables using two stacked maps.",
        },
        {
          code: "deco-u2-adders",
          session: "S3-S4",
          title: "Adders and subtractors: half and full adder, ripple-carry adder, half and full subtractor",
          weight: 4,
          inMidsem: true,
          outcome:
            "Derive the sum and carry (difference and borrow) expressions from the truth table and draw the gate circuit; chain full adders into an n-bit adder.",
        },
        {
          code: "deco-u2-mux",
          session: "S4",
          title: "Multiplexers and demultiplexers; realising a function with a MUX",
          weight: 5,
          inMidsem: true,
          outcome:
            "Explain a 2:1, 4:1 and 8:1 MUX, and implement F(A,B,C) = Σm(...) on an 8:1 MUX by setting each input line from the minterm list — the class-test question.",
          subtopics: [
            "Select lines choose one of 2ⁿ inputs; MUX as a universal logic block",
            "Function on 8:1 MUX: I_k = 1 if minterm k is present, else 0",
            "Function on 4:1 MUX with one variable on the inputs (implementation table)",
            "Demultiplexer = decoder with an enable",
          ],
        },
        {
          code: "deco-u2-codec",
          session: "S5",
          title: "Encoders and decoders",
          weight: 4,
          inMidsem: true,
          outcome:
            "Draw a 2:4 / 3:8 decoder and a 4:2 / 8:3 encoder, explain priority encoding, and implement a function using a decoder plus OR gates.",
        },
        {
          code: "deco-u2-comparators",
          session: "S6",
          title: "Magnitude comparators and combinational design examples",
          weight: 3,
          inMidsem: true,
          outcome:
            "Derive the equations for a 1-bit and 2-bit comparator (A>B, A=B, A<B) and design small combinational circuits from a specification.",
        },
      ],
    },
    {
      number: 3,
      title: "Synchronous Sequential Circuits",
      sessions: 8,
      co: "CO3",
      assessment: "Class Test 1 (half of this unit), then Mid-Term Examination (20 marks) after Unit III",
      inMidsem: true,
      topics: [
        {
          code: "deco-u3-latches",
          session: "S1",
          title: "Sequential logic: why memory is needed, the binary cell, SR latch",
          weight: 5,
          inMidsem: true,
          outcome:
            "Explain set, reset and hold for an SR latch (NOR and NAND forms) and why S = R = 1 is the forbidden state — a class-test question.",
        },
        {
          code: "deco-u3-flipflops",
          session: "S2",
          title: "Flip-flops: SR, JK, D and T — truth tables, characteristic and excitation tables",
          weight: 5,
          inMidsem: true,
          outcome:
            "Write the characteristic table and equation for each flip-flop, and the excitation table you need for counter design.",
        },
        {
          code: "deco-u3-master-slave",
          session: "S3",
          title: "Master–slave and edge-triggered flip-flops; race-around in JK",
          weight: 5,
          inMidsem: true,
          outcome:
            "Explain the race-around condition (J = K = 1 with a clock pulse wider than the gate delay) and how the master–slave JK removes it; list the differences between a latch and an edge-triggered flip-flop with a timing diagram — two class-test questions.",
        },
        {
          code: "deco-u3-sync-fundamentals",
          session: "S4",
          title: "Fundamentals of synchronous sequential circuits: state, clock, Moore and Mealy",
          weight: 3,
          inMidsem: true,
          outcome:
            "Draw the block model (combinational logic + memory), and read a state table and state diagram.",
        },
        {
          code: "deco-u3-clocked",
          session: "S5",
          title: "Clocked sequential circuit analysis and design",
          weight: 4,
          inMidsem: true,
          outcome:
            "Analyse a given circuit into its state table; design a circuit from a state diagram using excitation tables and K-maps.",
        },
        {
          code: "deco-u3-counters",
          session: "S6",
          title: "Synchronous and asynchronous (ripple) counters; MOD-N counters",
          weight: 5,
          inMidsem: true,
          outcome:
            "Design a 3-bit synchronous up counter with JK or T flip-flops, draw a ripple counter, and build a MOD-N counter by clearing on the count.",
        },
        {
          code: "deco-u3-registers",
          session: "S7",
          title: "Shift registers (SISO, SIPO, PISO, PIPO) and ring / Johnson counters",
          weight: 4,
          inMidsem: true,
          outcome:
            "Draw a 4-bit shift register in each mode and trace a ring counter and a twisted-ring (Johnson) counter through their sequences.",
        },
      ],
    },
    {
      number: 4,
      title: "Structure of Computers",
      sessions: 8,
      co: "CO4",
      assessment: "Assignment (10 marks) after Unit IV",
      inMidsem: false,
      topics: [
        {
          code: "deco-u4-functional-units",
          session: "S1",
          title: "Computer types and the functional units of a computer",
          weight: 3,
          inMidsem: false,
          outcome:
            "Name and describe input, output, memory, ALU and control units, and classify computers by size and use.",
        },
        {
          code: "deco-u4-cu-alu",
          session: "S2",
          title: "Control unit, ALU and registers",
          weight: 4,
          inMidsem: false,
          outcome:
            "Explain what the control unit sequences, what the ALU computes, and the roles of PC, IR, MAR, MDR and general-purpose registers.",
        },
        {
          code: "deco-u4-buses",
          session: "S3",
          title: "Bus structures and data transfer",
          weight: 4,
          inMidsem: false,
          outcome:
            "Distinguish address, data and control buses; compare single-bus and multi-bus organisation and their effect on transfer speed.",
        },
        {
          code: "deco-u4-operational",
          session: "S4",
          title: "Basic operational concepts: how an instruction moves through the machine",
          weight: 4,
          inMidsem: false,
          outcome:
            "Trace Add LOC, R0 through the processor — fetch, decode, operand read, execute, write-back — naming the register involved at each step.",
        },
        {
          code: "deco-u4-von-neumann",
          session: "S5",
          title: "Von Neumann architecture and the stored-program concept",
          weight: 4,
          inMidsem: false,
          outcome:
            "Draw the Von Neumann model, state the stored-program idea, and explain the Von Neumann bottleneck (contrast with Harvard).",
        },
        {
          code: "deco-u4-performance",
          session: "S6",
          title: "Software, performance and computer organisation",
          weight: 3,
          inMidsem: false,
          outcome:
            "Use the basic performance equation T = (N × S) / R and explain how clock rate, instruction count and CPI trade off.",
        },
        {
          code: "deco-u4-multiprocessors",
          session: "S7",
          title: "Multiprocessors and multicomputers",
          weight: 3,
          inMidsem: false,
          outcome:
            "Differentiate shared-memory multiprocessors from message-passing multicomputers, with one example of each.",
        },
      ],
    },
    {
      number: 5,
      title: "Processor and Memory",
      sessions: 11,
      co: "CO4",
      assessment: "Quiz 2 (5 marks) after Unit V",
      inMidsem: false,
      topics: [
        {
          code: "deco-u5-registers",
          session: "S1",
          title: "CPU registers and register organisation",
          weight: 3,
          inMidsem: false,
          outcome:
            "List the special-purpose registers and their jobs, and explain why more registers can mean fewer memory accesses.",
        },
        {
          code: "deco-u5-address-space",
          session: "S2",
          title: "Address space, memory locations and memory operations",
          weight: 4,
          inMidsem: false,
          outcome:
            "Compute address space from address width (n bits → 2ⁿ locations), explain byte vs word addressing and big/little endian, and describe Read and Write operations.",
        },
        {
          code: "deco-u5-cache",
          session: "S3",
          title: "Memory hierarchy: cache memory",
          weight: 5,
          inMidsem: false,
          outcome:
            "Explain locality of reference, hit/miss, and mapping (direct, associative, set-associative); compute average access time from hit ratio.",
        },
        {
          code: "deco-u5-main-memory",
          session: "S4",
          title: "Main memory and secondary storage",
          weight: 3,
          inMidsem: false,
          outcome:
            "Compare SRAM and DRAM, ROM types, and magnetic/solid-state secondary storage on speed, cost and volatility.",
        },
        {
          code: "deco-u5-cpu-org",
          session: "S5",
          title: "CPU organisation: single-accumulator, general-register and stack organisation",
          weight: 3,
          inMidsem: false,
          outcome:
            "Describe the three CPU organisations and how instruction formats differ between them.",
        },
        {
          code: "deco-u5-instruction-cycle",
          session: "S6-S7",
          title: "Instruction cycle: fetch–decode–execute",
          weight: 5,
          inMidsem: false,
          outcome:
            "Walk through the fetch, decode, execute (and interrupt-check) phases naming each register transfer — PC → MAR, memory → MDR → IR, PC + 1.",
        },
        {
          code: "deco-u5-proc-mem",
          session: "S8",
          title: "Processor–memory interaction",
          weight: 3,
          inMidsem: false,
          outcome:
            "Describe a memory read and write cycle on the bus, and where wait states and the cache fit in.",
        },
        {
          code: "deco-u5-numericals",
          session: "S9",
          title: "Numerical problems and case studies",
          weight: 4,
          inMidsem: false,
          outcome:
            "Solve the standard numericals: address bits for a given memory size, cache average access time, performance-equation comparisons.",
        },
      ],
    },
  ],
  experiments: [],
  components: [
    {
      name: "Quiz 1",
      marks: 5,
      weightage: 5,
      scope: "Unit I — objective and application-based",
      timing: "After Unit I",
      co: "CO1",
      track: "theory",
    },
    {
      name: "Class Test 1",
      marks: 10,
      weightage: 10,
      scope: "Unit II and half of Unit III — K-map, MUX, SR latch, race-around, latch vs flip-flop (the five questions are printed in the course plan)",
      timing: "Unit II & half of Unit III",
      co: "CO1, CO2",
      track: "theory",
    },
    {
      name: "Mid-Term Examination",
      marks: 20,
      weightage: 20,
      scope: "Units I, II & III — conceptual, analytical and application-based",
      timing: "After Unit III — 5–11 Oct",
      co: "CO1, CO2, CO3",
      track: "theory",
    },
    {
      name: "Assignment",
      marks: 10,
      weightage: 10,
      scope: "Unit IV — computer types, functional units, operational concepts, Von Neumann, bus structures",
      timing: "After Unit IV",
      co: "CO4",
      track: "theory",
    },
    {
      name: "Quiz 2",
      marks: 5,
      weightage: 5,
      scope: "Unit V — objective and application-based",
      timing: "After Unit V",
      co: "CO4",
      track: "theory",
    },
    {
      name: "End-Term Examination",
      marks: 100,
      weightage: 50,
      scope: "Entire syllabus, Units I–V — conceptual, analytical, circuit design and application-based",
      timing: "End-Term",
      co: "CO1–CO4",
      track: "theory",
    },
    {
      name: "Lab — Quizzes + Execution & Viva",
      marks: 100,
      weightage: 100,
      scope: "Not in this course plan (the theory course is 3-0-0-3). The Thursday lab with Dr. Sambhavi is marked separately — scheme unknown",
      timing: "Continuous",
      co: "Unknown",
      track: "lab",
    },
  ],
  strategies: [
    {
      title: "Class Test 1 — the five questions are printed in the course plan",
      body: `Section F of the course plan is the rubric for **Class Test 1 (10 marks, Unit II and half of Unit III)**, and it lists the questions themselves. Whether the paper on the day is exactly these or the same five shapes with different numbers, this is what to be able to do cold:

1. **K-map, 4 variables, with gate realisation** — e.g. F(A,B,C,D) = Σm(0,1,2,5,6,7,8,9,10,14). Plot, group, minimal SOP, then draw it with basic gates. (2 marks)
2. **Function on an 8:1 MUX** — F(A,B,C) = Σm(1,3,5,6) with A,B,C as select lines. Give I₀–I₇ and justify each: the input line I_k is 1 exactly when minterm k is in the list. (2 marks)
3. **SR latch** — set, reset, hold, and why S = R = 1 is forbidden (both outputs driven to the same value; unpredictable on release). (2 marks)
4. **Race-around in JK** — J = K = 1 with a clock pulse wider than the propagation delay makes the output toggle repeatedly; the fix is the **master–slave JK**, drawn and explained. (2 marks)
5. **Latch vs edge-triggered flip-flop** — level-triggered vs edge-triggered, transparency, timing control — with a labelled timing diagram. (2 marks)

Full marks on each needs the *complete* method (all minterms placed, optimal groups, correct expression, correct circuit). "Mostly right" is 1 mark, not 2. Questions 3–5 are Unit III — if the class hasn't reached flip-flops by the test, learn them from the Neso lectures anyway; they are half the paper.`,
    },
    {
      title: "How a K-map question is marked",
      body: `A K-map question almost always comes as **F(A,B,C,D) = Σm(0, 2, 5, 7, 8, 10, 13, 15)**, sometimes with **+ d(...)** for don't-cares, and asks for the minimal SOP (or POS). The marks are for the *method*, so show all of it:

1. Draw the 4×4 map with **Gray code** ordering on both axes (00, 01, 11, 10 — never 00, 01, 10, 11). Getting this wrong loses every mark after it.
2. Plot 1s at the minterms, X at the don't-cares, 0 elsewhere.
3. Group in powers of two — 1, 2, 4, 8, 16 — as large as possible, edges wrap around, corners are a group of four.
4. Mark the **essential** prime implicants first (a 1 covered by exactly one group), then cover the leftovers with the fewest groups.
5. Write each group as a product term: variables that don't change across the group survive, the rest drop.

Practise until step 1 is automatic. Then do ten timed ones; the solver link under Resources checks your answers.`,
    },
    {
      title: "Mid-sem is Units I–III: what to weight",
      body: `The mid-term is 20 marks on Units I, II and III, "conceptual, analytical and application-based". Given the rubric style above, expect: one number-system / complement arithmetic question, one Boolean simplification, one K-map with a circuit, one combinational block (MUX / decoder / adder), and one or two sequential questions (flip-flop tables, a counter design, latch vs flip-flop).

Order of return on time: **K-maps and MUX/decoder implementation** (they appear in both the class test and the mid-term), then **flip-flops and counters** (the whole of Unit III is fresh and examinable), then **2's complement arithmetic** (quick marks, easy to drop through carelessness), then everything else.

Units IV and V are not in the mid-sem. Don't touch them until October.`,
    },
    {
      title: "The 40% rule applies here too",
      body: `Internals are 5 + 10 + 20 + 10 + 5 = 50 marks (CLA 30 + MSE 20). You need **20 of 50** to be allowed to pass, separately from the end-term. Quiz 1 and Class Test 1 are 15 of those before the mid-sem even happens — treat the Monday test as marks you keep, not a practice run.`,
    },
  ],
  textbooks: [
    {
      title: "Digital Design (5th ed.)",
      author: "M. Morris Mano and Michael D. Ciletti",
      note: "The text for Units I–III. Chapters 1–6: number systems, Boolean algebra, gate-level minimisation, combinational logic, synchronous sequential logic, registers and counters.",
    },
    {
      title: "Computer Organization and Embedded Systems (6th ed.)",
      author: "Carl Hamacher, Zvonko Vranesic, Safwat Zaky",
      note: "The text for Units IV–V. Chapter 1 (basic structure) and the memory chapter cover almost everything examinable.",
    },
    {
      title: "Digital Logic and Computer Design",
      author: "M. Morris Mano",
      note: "Older Mano; same material, and the one most Indian question banks are written from.",
    },
  ],
  references: [
    {
      title: "Computer Organization and Architecture: Designing for Performance (11th ed.)",
      author: "William Stallings",
    },
    { title: "Digital Fundamentals (11th ed.)", author: "Thomas L. Floyd", note: "Gentlest explanations of flip-flops and counters with timing diagrams." },
    { title: "Computer Architecture and Organization (3rd ed.)", author: "John P. Hayes" },
    {
      title: "Microprocessor Architecture, Programming and Applications with the 8085 (6th ed.)",
      author: "Ramesh S. Gaonkar",
    },
    { title: "Computer Systems: A Programmer's Perspective", author: "Randal E. Bryant and David R. O'Hallaron" },
    { title: "Structured Computer Organization", author: "Andrew S. Tanenbaum" },
    { title: "Logic and Computer Design Fundamentals", author: "M. Morris Mano and Charles R. Kime" },
    {
      title: "Computer Organization and Design: The Hardware/Software Interface",
      author: "David A. Patterson and John L. Hennessy",
    },
  ],
  localFiles: [
    "digital_electronics/299204_Course Plan_DECO_updatedpolicy.pdf",
    "digital_electronics/299206_DE syllabus 26102.pdf",
  ],
  gaps: [
    "The lab is not in this course plan (the theory course is 3-0-0-3). The Thursday 14:00–16:10 lab with Dr. Sambhavi has its own experiment list and marking scheme — still needed.",
    "Exact dates for Quiz 1 and Class Test 1 are 'after Unit I' / 'Unit II & half of Unit III' — the Monday 21 Sept test is assumed to be Class Test 1.",
  ],
};
