import type { SeedSubject } from "../types";

// Source: "Course Plan — Digital Electronics and Computer Organization,
// CSE26102", the CSE26102 syllabus sheet, and "Lab Course Plan — Digital
// Electronics Lab, CSE26102P" (all Dr. Sambhavi Shukla, coordinator; Session
// 2026-27, Batch 2026-30). All three PDFs are in digital_electronics/.
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
  labTitle: "Digital Electronics Lab",
  labCode: "CSE26102P",
  labLtpc: "0-0-2-1",
  overview:
    "Two halves. The first is digital logic: number systems and codes, Boolean algebra and gates, then combinational design (SOP/POS, K-maps, adders, multiplexers, encoders, decoders) and sequential design (latches, flip-flops, counters, shift registers). The second is how a computer is put together: functional units, buses and the Von Neumann model, then registers, memory hierarchy and the fetch–decode–execute cycle. 45 sessions of 60 minutes. Mid-sem covers Units I–III; the whole syllabus comes back in the end-term. The lab (CSE26102P, 1 credit, 15 two-hour sessions) is twelve experiments on the digital trainer kits — gates through flip-flops, counters, a simple ALU and register transfer — marked entirely by five quizzes and five execution-and-viva sittings.",
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
  experiments: [
    // Titles and CO mapping are from the lab course plan; the tasks are the
    // standard trainer-kit procedure for each, since the plan lists titles only.
    {
      number: 1,
      title: "Implementation of basic logic gates",
      co: "CO1",
      objective: "Verify the truth tables of AND, OR, NOT, NAND, NOR, XOR and XNOR on the trainer kit.",
      tasks: [
        "Identify the ICs: 7408 (AND), 7432 (OR), 7404 (NOT), 7400 (NAND), 7402 (NOR), 7486 (XOR) — pin 14 Vcc, pin 7 GND.",
        "Wire one gate of each IC to the input switches and an output LED.",
        "Record the output for every input combination and compare with the theoretical truth table.",
        "Lab file: aim, apparatus, IC pin diagrams, truth tables (theoretical vs observed), result.",
      ],
      inMidsem: true,
    },
    {
      number: 2,
      title: "Designing basic gates with the universal gates NAND and NOR",
      co: "CO1",
      objective: "Build NOT, AND, OR, XOR from NAND gates only, then from NOR gates only, and verify each.",
      tasks: [
        "Derive each construction on paper first using De Morgan — NOT = NAND with inputs tied; AND = NAND → NAND-NOT; OR = NAND of the two inverted inputs.",
        "Implement on a 7400 (quad NAND), then repeat on a 7402 (quad NOR).",
        "Count the gates used for each — the viva asks why NAND/NOR are called universal.",
        "Record truth tables for every derived gate.",
      ],
      inMidsem: true,
    },
    {
      number: 3,
      title: "Half adder and full adder using basic logic gates",
      co: "CO1",
      objective: "Implement a half adder (Sum = A⊕B, Carry = AB) and a full adder, and verify all input combinations.",
      tasks: [
        "Write the truth tables and derive Sum and Carry expressions — full adder: Sum = A⊕B⊕Cin, Cout = AB + Cin(A⊕B).",
        "Wire the half adder with one XOR and one AND; the full adder with two XORs, two ANDs and one OR (or from two half adders).",
        "Verify all 4 (half) and 8 (full) input combinations on LEDs.",
        "Viva: how many full adders make a 4-bit ripple-carry adder, and where the delay comes from.",
      ],
      inMidsem: true,
    },
    {
      number: 4,
      title: "Half subtractor and full subtractor",
      co: "CO1",
      objective: "Implement a half subtractor (Diff = A⊕B, Borrow = A'B) and a full subtractor, and verify them.",
      tasks: [
        "Derive Difference and Borrow from the truth tables — full subtractor: D = A⊕B⊕Bin, Bout = A'B + Bin(A⊕B)'.",
        "Note the single difference from the adder circuit: the inverter on A in the borrow term.",
        "Wire, verify all combinations, record observed vs theoretical.",
        "Viva: how subtraction is actually done in an ALU (2's complement addition) and why a dedicated subtractor is rarely built.",
      ],
      inMidsem: true,
    },
    {
      number: 5,
      title: "4×1 and 8×1 multiplexers and a multiplexer tree",
      co: "CO1, CO3",
      objective: "Build a 4:1 MUX from gates, use the 74153 / 74151 ICs, and combine two 4:1 MUXes into an 8:1 tree.",
      tasks: [
        "Write the 4:1 MUX expression Y = S1'S0'I0 + S1'S0 I1 + S1 S0'I2 + S1 S0 I3 and wire it with AND-OR gates.",
        "Verify the 74151 (8:1) by walking every select combination.",
        "Build the 8:1 tree: two 4:1 MUXes selected by S1,S0, their outputs fed to a 2:1 stage selected by S2.",
        "Implement F(A,B,C) = Σm(1,3,5,6) on the 8:1 MUX — the same question as Class Test 1.",
      ],
      inMidsem: true,
    },
    {
      number: 6,
      title: "3-to-8-line decoder",
      co: "CO1, CO3",
      objective: "Implement a 3:8 decoder with gates and verify the 74138, including the enable input.",
      tasks: [
        "Write all eight minterm outputs D0–D7 and wire three inverters plus eight 3-input ANDs (or use the 74138, active-low outputs).",
        "Verify each input combination lights exactly one output.",
        "Use the decoder plus OR gates to realise a given function from its minterm list.",
        "Viva: decoder vs demultiplexer; why the 74138 outputs are active-low.",
      ],
      inMidsem: true,
    },
    {
      number: 7,
      title: "4-to-10-line decoder (BCD to decimal)",
      co: "CO1, CO3",
      objective: "Implement a BCD-to-decimal decoder (7442) and verify that the invalid codes 1010–1111 produce no output.",
      tasks: [
        "Write the ten output expressions from the BCD truth table; note the six don't-care codes.",
        "Wire the 7442 and verify all sixteen input combinations.",
        "Record which inputs give no active output and explain why.",
        "Viva: how the don't-cares simplify the decoder logic.",
      ],
      inMidsem: true,
    },
    {
      number: 8,
      title: "SR, JK, D and T flip-flops",
      co: "CO2, CO3",
      objective: "Implement each flip-flop (SR from NAND latch with clock; JK, D, T from the 7476 / 7474) and verify the characteristic tables.",
      tasks: [
        "Build the clocked SR from four NAND gates; show the forbidden S = R = 1 case.",
        "Verify the 7476 JK: hold, set, reset, toggle. Wire D and T from JK (D: K = J'; T: J = K).",
        "Record characteristic tables and observe the output only changing on the clock edge.",
        "Viva: race-around condition — reproduce it with a slow clock if the kit allows.",
      ],
      inMidsem: false,
    },
    {
      number: 9,
      title: "Master–slave flip-flop",
      co: "CO2, CO3",
      objective: "Build a master–slave JK from two flip-flops with complemented clocks and show that it removes race-around.",
      tasks: [
        "Wire the master (clocked by CLK) and slave (clocked by CLK') and connect the slave outputs back to the master's J and K.",
        "Apply J = K = 1 and a clock pulse; observe exactly one toggle per pulse.",
        "Draw the timing diagram: master captures on the high level, slave transfers on the falling edge.",
        "Viva: master–slave vs edge-triggered; where the 7476 is master–slave internally.",
      ],
      inMidsem: false,
    },
    {
      number: 10,
      title: "Synchronous counter",
      co: "CO3",
      objective: "Design and build a 3-bit synchronous up counter with JK flip-flops and verify the count sequence 000 → 111.",
      tasks: [
        "Write the state table, use the JK excitation table to get J/K for each flip-flop, and simplify with K-maps (J0 = K0 = 1; J1 = K1 = Q0; J2 = K2 = Q0Q1).",
        "Wire three 7476 flip-flops on a common clock and pulse it manually.",
        "Record the LED sequence; extend to a MOD-6 counter by clearing on 110.",
        "Viva: synchronous vs ripple counter; why the ripple one is slower.",
      ],
      inMidsem: false,
    },
    {
      number: 11,
      title: "Simple ALU operations: addition, subtraction, AND, OR",
      co: "CO1, CO3",
      objective: "Simulate a 1-bit (or 4-bit) ALU that selects between ADD, SUB, AND, OR using a function-select input.",
      tasks: [
        "Build the four operation blocks: full adder, adder with B complemented and Cin = 1 for subtraction, AND, OR.",
        "Feed the four results into a 4:1 MUX; the two select lines are the opcode.",
        "Verify each opcode with several operand pairs, including a subtraction that produces a borrow.",
        "Viva: how a real ALU shares the adder between ADD and SUB using 2's complement.",
      ],
      inMidsem: false,
    },
    {
      number: 12,
      title: "Register transfer logic (RTL) for basic operations",
      co: "CO2, CO3",
      objective: "Implement a register transfer R2 ← R1 on a control signal, and a simple load/increment register, using D flip-flops and gates.",
      tasks: [
        "Build two 2-bit registers from 7474 D flip-flops on a common clock.",
        "Gate the transfer with a control signal P: R2 loads R1 only on a clock edge when P = 1.",
        "Extend to a register with load / increment / clear selected by control lines and a MUX at each D input.",
        "Viva: RTL notation (P: R2 ← R1), what a micro-operation is, and how this scales into a CPU datapath.",
      ],
      inMidsem: false,
    },
  ],
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
      name: "Lab Quizzes (5 compulsory × 10)",
      marks: 50,
      weightage: 50,
      scope: "Concepts, logic building, implementation, debugging — conducted during lab sessions",
      timing: "Continuous, five across the semester",
      co: "CO1–CO3",
      track: "lab",
    },
    {
      name: "Execution & Viva Voce (5 compulsory × 10)",
      marks: 50,
      weightage: 50,
      scope: "Problem solving + implementation + output accuracy on the trainer kit; previous experiment's lab file checked at the end of every lab",
      timing: "Continuous, five sittings",
      co: "CO1–CO3",
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
      title: "The lab is 100 marks with no exam — and the file is checked every week",
      body: `CSE26102P is marked entirely in the lab: **five quizzes (10 each) + five execution-and-viva sittings (10 each) = 100**, 40% to pass, 75% attendance or you fail the lab outright. "Lab files of the previous experiment need to be checked at the end of every lab" — so a missing write-up costs marks the following Thursday, not at the end of the semester.

The twelve experiments track the theory almost one-to-one: gates (1–2) → adders and subtractors (3–4) → MUX and decoders (5–7) → flip-flops and master–slave (8–9) → counter (10) → ALU and register transfer (11–12). The viva questions are the theory questions: why NAND is universal, the full-adder carry expression, decoder vs demultiplexer, race-around. Doing the write-up properly *is* mid-sem revision for Units I–III.

For each experiment the file needs: aim, apparatus with IC numbers, pin diagram, theory with the expression, circuit diagram, truth table (theoretical and observed), result. Keep a template and fill it in the same night.`,
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
    "digital_electronics/299203_Lab_Course Plan_DECO_NEWPOLICY.pdf",
  ],
  gaps: [
    "Exact dates for Quiz 1 and Class Test 1 are 'after Unit I' / 'Unit II & half of Unit III' — the Monday 21 Sept test is assumed to be Class Test 1.",
    "The lab plan gives experiment titles only; the procedures listed are the standard trainer-kit versions. Which experiment number the class is on, and when the five quiz/viva sittings fall, is not in the plan.",
  ],
};
