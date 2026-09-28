/**
 * My plain-language takeaways for each fetched note page, shown beside the
 * image in the reader. Keyed by the reader page key (the image file's base
 * name, e.g. "DENotes-p26"). The user's own notes are stored separately, in
 * vault storage, so these stay editable-by-me and theirs stay editable-by-them.
 *
 * Written from reading every DENotes page. Other decks (typed, already clear,
 * and covered by the per-topic study notes) don't have entries yet — the panel
 * still shows the "your notes" box for them.
 */

export interface PageNote {
  /** what this page is about, in a few words */
  title: string;
  /** the takeaways worth carrying into the exam */
  points: string[];
  /** an easy-to-miss gotcha, when there is one */
  watch?: string;
}

export const pageNotes: Record<string, PageNote> = {
  "DENotes-p01": {
    title: "Analog vs digital — the big picture",
    points: [
      "Digital Electronics = the branch; a digital signal takes only discrete values (0 and 1).",
      "Analog: continuous, sine wave, built from resistors/capacitors/inductors. Digital: discrete [0 & 1], square wave, built from transistors/logic gates/ICs.",
      "ADC turns analog → digital; DAC turns digital → analog. That's the bridge between the two worlds.",
    ],
    watch: "Exam line: 'why digital?' → noise-immune, easy to store, exact reproduction.",
  },
  "DENotes-p02": {
    title: "Number systems and the idea of a base",
    points: [
      "A number system does two jobs: count and represent. Four systems: Binary(2), Octal(8), Decimal(10), Hex(16).",
      "Base = the number of distinct symbols. Base tells you the weight of each position.",
      "MSB = leftmost (most valuable) bit, LSB = rightmost. 8 bits = 1 byte.",
    ],
  },
  "DENotes-p03": {
    title: "Hex digits and binary arithmetic rules",
    points: [
      "Hex needs 16 symbols: 0–9 then A,B,C,D,E,F = 10,11,12,13,14,15.",
      "Binary add: 0+0=0, 0+1=1, 1+1=0 carry 1. Binary sub: 0−1=1 borrow 1.",
      "Multiply is like decimal (only 0 and 1, so trivial); division too.",
    ],
  },
  "DENotes-p04": {
    title: "Complements — the key trick for negatives",
    points: [
      "1's complement = flip every bit (1↔0).",
      "2's complement = 1's complement + 1. This is how computers store negative numbers.",
      "Shortcut for 2's complement: from the LSB, copy bits up to and INCLUDING the first 1, then flip everything after.",
    ],
    watch: "You'll use 2's complement constantly for subtraction — learn the shortcut cold.",
  },
  "DENotes-p05": {
    title: "Positional value (how any number = a sum)",
    points: [
      "Every digit is worth digit × base^position. Left of the point: 0,1,2… ; right of the point: −1,−2…",
      "Binary (101.01)₂ = 4+0+1+0+0.25 = 21.25. Octal (525.5)₈ = 341.625.",
      "This one rule converts ANY base → decimal. Just multiply and add.",
    ],
  },
  "DENotes-p06": {
    title: "Worked conversion: binary → decimal → octal",
    points: [
      "(10101)₂ = 16+0+4+0+1 = 21₁₀.",
      "Decimal → octal: divide by 8 repeatedly, read remainders bottom-up → 21 = (25)₈.",
      "Always verify by converting back: 2×8 + 5 = 21. ✓",
    ],
  },
  "DENotes-p07": {
    title: "Fast conversions via grouping",
    points: [
      "(101010.10)₂ groups directly into base 4 (2 bits), base 8 (3 bits), base 16 (4 bits).",
      "Group FROM the binary point outward. Integer side: leftward. Fraction side: rightward (pad zeros on the right).",
      "Trick: to go octal→hex, don't do it directly — go through binary first.",
    ],
    watch: "The commonest mistake is grouping the fraction the wrong way. Always start at the point.",
  },
  "DENotes-p08": {
    title: "Signed vs unsigned numbers",
    points: [
      "Unsigned = magnitude only (0…2ⁿ−1). Signed = a sign bit + magnitude.",
      "Sign bit: 0 = positive, 1 = negative. Signed-magnitude range: −(2ⁿ⁻¹−1) to +(2ⁿ⁻¹−1).",
      "Signed-magnitude has TWO zeros (+0 and −0) — that's its weakness.",
    ],
  },
  "DENotes-p09": {
    title: "Reading a 2's-complement number & subtraction",
    points: [
      "Given 10110: MSB=1 so it's negative. Value = −16+4+2 = −10 (the MSB carries weight −2ⁿ⁻¹).",
      "Subtraction by addition: A − B = A + (2's complement of B).",
      "10 − 5 → 01010 + 11011 = result; discard the end carry to get +5.",
    ],
    watch: "'Discard the end carry' only when there IS one. No carry + MSB=1 means the answer is negative.",
  },
  "DENotes-p10": {
    title: "Worked subtraction & BCD code",
    points: [
      "10 − 11 in 2's complement: no end carry, MSB=1 → answer is negative → −1.",
      "BCD (8421): write each decimal digit as its own 4 bits. 59 = 0101 1001.",
      "BCD is a WEIGHTED code (weights 8,4,2,1). 2421 is another weighted code.",
    ],
    watch: "BCD 1010–1111 are INVALID codes — they never appear.",
  },
  "DENotes-p11": {
    title: "Excess-3 and Gray code",
    points: [
      "Excess-3 = BCD + 0011. It's self-complementing (9's complement = flip the bits).",
      "Gray code: successive numbers differ in exactly ONE bit — great for reducing errors.",
      "Binary → Gray: keep the MSB, then XOR each pair of adjacent binary bits.",
    ],
  },
  "DENotes-p12": {
    title: "Gray↔binary + Boolean algebra begins",
    points: [
      "Gray → binary: copy the MSB, then each binary bit = previous binary bit XOR next Gray bit.",
      "Boolean algebra = the algebra of True/False (1/0).",
      "First laws: Idempotent (x·x=x, x+x=x), Associative, Distributive.",
    ],
  },
  "DENotes-p13": {
    title: "The Boolean laws you must memorise",
    points: [
      "Commutative: xy=yx. Identity: x+0=x, x·1=x. Complement: x·x̄=0, x+x̄=1. Involution: (x̄)̄=x.",
      "DE MORGAN (the star): (x+y)̄ = x̄·ȳ and (x·y)̄ = x̄+ȳ.",
      "De Morgan = 'break the bar, change the sign'. It appears in almost every simplification.",
    ],
    watch: "Missing from these notes: Absorption (x+xy=x) and Consensus — learn them from the study note.",
  },
  "DENotes-p14": {
    title: "Logic gates — the three families",
    points: [
      "A gate takes 1+ inputs, gives exactly 1 output.",
      "Basic: AND, OR, NOT. Universal: NAND, NOR. Special: XOR, XNOR.",
      "AND = output 1 only if ALL inputs 1. OR = output 1 if ANY input 1.",
    ],
  },
  "DENotes-p15": {
    title: "NOT, NAND, NOR",
    points: [
      "NOT inverts: 0→1, 1→0.",
      "NAND = NOT(AND): output 0 only when all inputs 1. NOR = NOT(OR): output 1 only when all inputs 0.",
      "NAND and NOR are 'universal' — any circuit can be built from just one of them.",
    ],
  },
  "DENotes-p16": {
    title: "XOR and building gates from NAND",
    points: [
      "XOR = 1 when inputs DIFFER. XOR = x̄y + xȳ.",
      "From NAND: NOT = NAND with inputs tied; AND = NAND then invert; OR = invert inputs then NAND.",
      "This 'build everything from NAND' is a classic viva/lab question.",
    ],
  },
  "DENotes-p17": {
    title: "XOR from NAND; gates from NOR",
    points: [
      "XOR takes 4 NAND gates.",
      "From NOR: NOT = NOR tied; OR = NOR then invert; AND = invert inputs then NOR.",
      "Notice the symmetry: NAND naturally makes AND-like things, NOR makes OR-like things.",
    ],
  },
  "DENotes-p18": {
    title: "XNOR from NAND, XOR from NOR",
    points: [
      "XNOR = 1 when inputs are EQUAL = xy + x̄ȳ (the complement of XOR).",
      "These constructions prove NAND and NOR are functionally complete.",
      "In the lab, count your gates — examiners ask 'how many gates?'",
    ],
  },
  "DENotes-p19": {
    title: "Boolean expressions: SOP and POS",
    points: [
      "SOP (Sum of Products) collects the rows where output = 1.",
      "POS (Product of Sums) collects the rows where output = 0.",
      "Rule of thumb: few 1s → use SOP; few 0s → use POS.",
    ],
  },
  "DENotes-p20": {
    title: "Minterms",
    points: [
      "A minterm is a product (AND) term containing EVERY variable, true in exactly one row.",
      "In a minterm: variable=1 → written plain (x); variable=0 → complemented (x̄).",
      "3 variables → minterms m0…m7. f = Σm(list of rows where f=1).",
    ],
  },
  "DENotes-p21": {
    title: "Canonical SOP & POS; maxterms",
    points: [
      "Canonical SOP = OR of all its minterms. Canonical POS = AND of all its maxterms.",
      "A maxterm is a SUM term true in all rows but one. For POS: variable=0 → plain, variable=1 → complemented (opposite of minterms).",
      "The maxterm list is the COMPLEMENT of the minterm list.",
    ],
  },
  "DENotes-p22": {
    title: "POS examples & counting functions",
    points: [
      "n variables → 2ⁿ input combinations (rows in the truth table).",
      "Total possible Boolean functions of n variables = 2^(2ⁿ). (n=2 → 16, n=3 → 256.)",
      "This counting shows up as a short 2-mark question.",
    ],
  },
  "DENotes-p23": {
    title: "Complement of a function & duality",
    points: [
      "To complement a function: complement every literal AND swap · ↔ +, 0 ↔ 1.",
      "Duality: swap · ↔ + and 0 ↔ 1 (but do NOT complement the variables).",
      "Every valid Boolean identity stays valid when you take its dual.",
    ],
  },
  "DENotes-p24": {
    title: "Self-dual functions",
    points: [
      "A function is self-dual if its dual equals the original function.",
      "Example: AB + BC + CA is self-dual.",
      "Check by taking the dual and simplifying — if you get back the same expression, it's self-dual.",
    ],
  },
  "DENotes-p25": {
    title: "Counting self-dual functions",
    points: [
      "Total self-dual functions of n variables = 2^(2^(n−1)).",
      "For n=2 that's 4 self-dual functions.",
      "Pure formula question — memorise the exponent pattern.",
    ],
  },
  "DENotes-p26": {
    title: "K-map: the minimisation tool",
    points: [
      "Two ways to minimise: Boolean laws (algebra) or the Karnaugh map (visual).",
      "A K-map is the truth table redrawn so neighbours differ by one bit.",
      "Adjacent 1s combine: whatever variable CHANGES across the group drops out.",
    ],
  },
  "DENotes-p27": {
    title: "3- and 4-variable K-maps",
    points: [
      "Rows/columns go in GRAY-CODE order: 00, 01, 11, 10 (never 00,01,10,11).",
      "Group in powers of two (1,2,4,8), as large and as few as possible; edges wrap; four corners = one group.",
      "Worked: Σm(0,2,5,7,8,10,13,15) → BD + B̄D̄.",
    ],
    watch: "Getting the Gray-code order wrong loses every mark after it. Draw it carefully.",
  },
  "DENotes-p28": {
    title: "5-variable K-maps",
    points: [
      "Split into TWO 4-variable maps: one for A=0, one for A=1.",
      "Cells in the SAME position on both maps are adjacent — a group spanning both drops the A variable.",
      "Rarely more than one 5-variable question; know the two-map layout.",
    ],
  },
  "DENotes-p29": {
    title: "POS on a K-map + prime implicants",
    points: [
      "For POS: plot and group the 0s instead of the 1s; each group is a SUM term.",
      "Prime implicant = a group that can't be made bigger.",
      "Essential prime implicant = the only group covering some particular 1 — you MUST include it.",
    ],
  },
  "DENotes-p30": {
    title: "Combinational circuits",
    points: [
      "Output depends only on the CURRENT inputs — no memory.",
      "Design flow: word problem → truth table → simplify (K-map) → circuit.",
      "n inputs, m outputs, O = F(I).",
    ],
  },
  "DENotes-p31": {
    title: "Worked combinational design + adders intro",
    points: [
      "Example result simplifies to R = AC + B (from its K-map).",
      "An adder is a combinational circuit that adds numbers.",
      "Half adder: 2 bits. Full adder: 3 bits (includes a carry-in).",
    ],
  },
  "DENotes-p32": {
    title: "Half adder",
    points: [
      "Inputs A, B → outputs Sum and Carry.",
      "Sum = A ⊕ B (XOR). Carry = A·B (AND).",
      "Just one XOR + one AND gate.",
    ],
  },
  "DENotes-p33": {
    title: "Full adder",
    points: [
      "Inputs A, B, Cin → Sum and Cout.",
      "Sum = A ⊕ B ⊕ Cin. Cout = AB + BCin + ACin = AB + Cin(A⊕B).",
      "Derive both from the 3-variable truth table / K-map.",
    ],
  },
  "DENotes-p34": {
    title: "Full adder = two half adders",
    points: [
      "Full adder circuit: two XORs for the sum, ANDs + OR for the carry.",
      "You can build a full adder from TWO half adders plus one OR gate.",
      "Cout carry = AB + BC + AC.",
    ],
  },
  "DENotes-p35": {
    title: "Half subtractor",
    points: [
      "Inputs A, B → Difference and Borrow.",
      "Difference = A ⊕ B. Borrow = Ā·B (note the inverter on A — that's the only difference from the adder).",
      "That single inverter is the thing to remember.",
    ],
  },
  "DENotes-p36": {
    title: "Full subtractor",
    points: [
      "Inputs A, B, Bin → Difference and Borrow-out.",
      "Diff = A ⊕ B ⊕ Bin. Bout = ĀB + Bin·(A⊕B)̄.",
      "In real hardware subtraction is done by 2's-complement addition, not a dedicated subtractor.",
    ],
  },
  "DENotes-p37": {
    title: "Ripple-carry adder & its problem",
    points: [
      "Chain n full adders; each carry feeds the next stage.",
      "Problem: carry propagation delay — each stage waits for the previous carry, so it's SLOW.",
      "Fix = look-ahead carry adder: compute the carries directly from C0.",
    ],
  },
  "DENotes-p38": {
    title: "Carry look-ahead equations",
    points: [
      "Pi = Ai ⊕ Bi (propagate). Gi = Ai·Bi (generate).",
      "Ci+1 = Gi + Pi·Ci. Expanded, every carry comes straight from C0 in just two gate levels.",
      "e.g. C2 = G1 + P1G0 + P1P0C0.",
    ],
    watch: "Look-ahead trades more gates for far less delay — that's the whole point.",
  },
  "DENotes-p39": {
    title: "Multiplexer (MUX)",
    points: [
      "A MUX has many inputs, ONE output, and select lines that choose which input passes.",
      "'Multiple options, select one.' It's a data selector.",
      "n select lines → 2ⁿ inputs.",
    ],
  },
  "DENotes-p40": {
    title: "2:1 MUX",
    points: [
      "2ᵐ inputs need m select lines.",
      "2:1 MUX: Y = S̄·I0 + S·I1.",
      "The select value literally points at the input line it lets through.",
    ],
  },
  "DENotes-p41": {
    title: "4:1 MUX",
    points: [
      "4 inputs, 2 select lines (S1 S0).",
      "Y = S̄1S̄0·I0 + S̄1S0·I1 + S1S̄0·I2 + S1S0·I3.",
      "Wire it with AND gates (one per input) feeding one OR gate.",
    ],
  },
  "DENotes-p42": {
    title: "8:1 MUX & implementing functions",
    points: [
      "8 inputs, 3 select lines.",
      "To realise F = Σm(...) on an 8:1 MUX: set input line Iₖ = 1 if minterm k is in the list, else 0.",
      "Same function fits a 4:1 MUX too, putting one variable on the input lines.",
    ],
    watch: "The 'function on an 8:1 MUX' is a printed Class-Test question — practise it.",
  },
  "DENotes-p43": {
    title: "Demultiplexer (DEMUX)",
    points: [
      "Opposite of a MUX: ONE input, many outputs — a data distributor.",
      "Select lines choose which output the input is routed to.",
      "1 input → 2ⁿ outputs with n select lines.",
    ],
  },
  "DENotes-p44": {
    title: "1:2 and 1:4 DEMUX",
    points: [
      "1:2 DEMUX: Y0 = S̄0·I, Y1 = S0·I.",
      "Extend the same idea to 1:4 with two select lines.",
      "A DEMUX is basically a decoder whose enable line is the data input.",
    ],
  },
  "DENotes-p45": {
    title: "DEMUX truth table & MUX–DEMUX link",
    points: [
      "Each select combination activates exactly one output line, carrying the input value.",
      "MUX (many→one) and DEMUX (one→many) are used together to send data over a shared line.",
      "SL = select lines on both ends must match.",
    ],
  },
  "DENotes-p46": {
    title: "Decoder",
    points: [
      "n inputs → 2ⁿ outputs; exactly ONE output is active for each input code.",
      "Each output line equals one minterm. It has an enable line.",
      "Decoder vs DEMUX: a DEMUX is a decoder with its enable used as the data input.",
    ],
  },
  "DENotes-p47": {
    title: "Decoder builds a full adder; 1:2 decoder",
    points: [
      "Feed the decoder's minterm outputs into OR gates to realise any function.",
      "Full adder from a 3:8 decoder: Sum = OR of minterms(1,2,4,7), Carry = OR of minterms(3,5,6,7).",
      "This 'function using a decoder + OR gates' is a standard question.",
    ],
  },
  "DENotes-p48": {
    title: "Encoder & priority encoder",
    points: [
      "Encoder = reverse of a decoder: one active input → its binary code. 2ⁿ inputs → n outputs.",
      "Problem: if two inputs are active at once, a plain encoder gives a wrong code.",
      "Priority encoder fixes this — the highest-priority active input wins.",
    ],
  },
  "DENotes-p49": {
    title: "Sequential circuits & the latch",
    points: [
      "Sequential circuit = combinational logic + MEMORY. Output depends on inputs AND past state.",
      "A latch stores one bit; latches are the building block of flip-flops.",
      "SR latch = two cross-coupled NOR (or NAND) gates.",
    ],
  },
  "DENotes-p50": {
    title: "SR latch truth table",
    points: [
      "S=0,R=0 → hold (no change). S=0,R=1 → reset (Q=0). S=1,R=0 → set (Q=1).",
      "S=1,R=1 → INVALID/forbidden.",
      "NAND latch is the same idea with active-low inputs.",
    ],
  },
  "DENotes-p51": {
    title: "Clocked SR flip-flop (NAND)",
    points: [
      "Add a clock so the latch only responds when CLK is active.",
      "Q changes to set/reset/hold based on S,R only at the clock.",
      "This is the step from a latch (level) toward a controlled flip-flop.",
    ],
  },
  "DENotes-p52": {
    title: "SR flip-flop (NOR form)",
    points: [
      "Same SR behaviour built from NOR gates, gated by the clock.",
      "Truth table matches the NOR latch: hold / reset / set / invalid.",
      "S=R=1 is still the forbidden state.",
    ],
  },
  "DENotes-p53": {
    title: "SR excitation table & characteristic equation",
    points: [
      "Characteristic equation: Q(next) = S + R̄·Q. (Describes what the output BECOMES.)",
      "Excitation table (what S,R you NEED for a given Q→Q transition) is what counter design uses.",
      "0→1 needs S=1,R=0; 1→0 needs S=0,R=1; etc.",
    ],
  },
  "DENotes-p54": {
    title: "JK flip-flop",
    points: [
      "JK removes SR's forbidden state: when J=K=1 the output TOGGLES.",
      "J=K=0 hold; J=1,K=0 set; J=0,K=1 reset; J=K=1 toggle.",
      "The most versatile flip-flop.",
    ],
  },
  "DENotes-p55": {
    title: "JK characteristic & excitation tables",
    points: [
      "Characteristic equation: Q(next) = J·Q̄ + K̄·Q.",
      "Excitation: 0→0 needs J=0,K=X; 0→1 J=1,K=X; 1→0 J=X,K=1; 1→1 J=X,K=0.",
      "The X (don't-care) entries make JK the easiest to design counters with.",
    ],
  },
  "DENotes-p56": {
    title: "Triggering: edge vs level",
    points: [
      "Level-triggered: responds the whole time the clock is high (or low).",
      "Edge-triggered: responds only at the rising ↑ or falling ↓ edge.",
      "Edge triggering gives precise, glitch-free timing.",
    ],
  },
  "DENotes-p57": {
    title: "Race-around condition in JK",
    points: [
      "Happens when J=K=1 AND the circuit is level-triggered AND the pulse width Tw > gate delay Td.",
      "The output toggles again and again during one clock pulse → unpredictable final state.",
      "Fixes: edge-triggering, or a master–slave flip-flop.",
    ],
    watch: "This is a printed Class-Test question. Learn the three conditions (J=K=1, level, Td<Tw).",
  },
  "DENotes-p58": {
    title: "Master–slave JK flip-flop",
    points: [
      "Two flip-flops in series: master clocked on CLK, slave on CLK̄.",
      "Master captures on the high level; slave transfers on the falling edge → exactly one toggle per clock.",
      "This is how the race-around problem is solved.",
    ],
  },
  "DENotes-p59": {
    title: "T flip-flop",
    points: [
      "T = toggle. Q(next) = T ⊕ Q.",
      "T=0 → hold; T=1 → toggle.",
      "Made from a JK with J and K tied together.",
    ],
  },
  "DENotes-p60": {
    title: "D flip-flop",
    points: [
      "D = data/delay. Q(next) = D — the output simply copies the input at the clock.",
      "No forbidden state, no toggle — the simplest to use.",
      "Used as the storage cell in registers.",
    ],
  },
  "DENotes-p61": {
    title: "Flip-flop conversion: SR → D",
    points: [
      "Method: write the TARGET (D) characteristic table, then use the SOURCE (SR) excitation table, then K-map.",
      "Output flip-flop = D; input logic built from SR's excitation needs.",
      "This same 3-step method does every conversion.",
    ],
  },
  "DENotes-p62": {
    title: "D→SR result & T→JK",
    points: [
      "For SR→D: S = D, R = D̄.",
      "T→JK conversion uses T's excitation vs JK's characteristic table.",
      "Always: target characteristic table + source excitation table → K-map → input equations.",
    ],
  },
  "DENotes-p63": {
    title: "JK → T conversion",
    points: [
      "T input in terms of J,K and Q via the tables.",
      "Result: T = J·Q̄ + K·Q.",
      "Draw the K-map for T over the JK rows to confirm.",
    ],
  },
  "DENotes-p64": {
    title: "SR → T conversion",
    points: [
      "S = T·Q̄, R = T·Q.",
      "Meaning: to toggle, set when currently 0 and reset when currently 1.",
      "Follows straight from the excitation-table method.",
    ],
  },
  "DENotes-p65": {
    title: "JK → D conversion",
    points: [
      "J = D, K = D̄.",
      "So a D flip-flop is a JK with K forced to the complement of J.",
      "Simplest of all the conversions.",
    ],
  },
  "DENotes-p66": {
    title: "SR → JK conversion",
    points: [
      "S = J·Q̄n, R = K·Qn.",
      "This is what lets you replace an SR with a JK.",
      "Confirm with K-maps over the JK characteristic rows.",
    ],
  },
  "DENotes-p67": {
    title: "JK → SR conversion",
    points: [
      "J = S, K = R (with the SR excitation feeding in).",
      "The pairing is almost direct because SR and JK differ only in the 1,1 case.",
      "Know both directions (SR→JK and JK→SR).",
    ],
  },
  "DENotes-p68": {
    title: "Counters",
    points: [
      "A counter counts clock pulses (frequency / occurrence).",
      "An n-bit counter has n flip-flops and counts 0 → 2ⁿ−1.",
      "Two types: Synchronous (parallel, one clock) and Asynchronous/ripple.",
    ],
  },
  "DENotes-p69": {
    title: "MOD-N counters",
    points: [
      "A MOD-N counter has N unique states; after N pulses it returns to 0.",
      "State after m pulses = m mod N. (12 mod 6 = 0, 13 mod 6 = 1…)",
      "Flip-flops needed: smallest k with 2^k ≥ N (MOD-6 → 3 flip-flops).",
    ],
  },
  "DENotes-p70": {
    title: "Synchronous vs asynchronous",
    points: [
      "Synchronous: all flip-flops share one clock → fast, but more complex/costly. Parallel.",
      "Asynchronous (ripple): each flip-flop clocked by the previous → simple/cheap but slow (delays add up).",
      "Ring and Johnson counters are synchronous; the basic ripple counter is async.",
    ],
  },
  "DENotes-p71": {
    title: "Up/down counters & design steps",
    points: [
      "Up: 0→1→2→3. Down: 3→2→1→0. Direction set by whether you clock from Q or Q̄.",
      "Design steps: (1) sequence → (2) number of flip-flops → (3) pick a flip-flop → (4) excitation table → K-maps → circuit.",
      "This 5-step recipe is the whole of sequential design.",
    ],
  },
  "DENotes-p72": {
    title: "Worked synchronous design (present→next state)",
    points: [
      "Build a present-state / next-state table, then find each flip-flop's input.",
      "With D flip-flops, D = the next-state value directly.",
      "Example gives D1 = Q1'Q0' + Q1Q0 (an XNOR) and D0 = Q0'.",
    ],
  },
  "DENotes-p73": {
    title: "Registers & shift-register modes",
    points: [
      "A register stores multiple bits (one D flip-flop per bit); it's the CPU's fast storage.",
      "Four shift modes: SISO, SIPO, PISO, PIPO (Serial/Parallel In, Serial/Parallel Out).",
      "A D flip-flop here acts as buffer memory.",
    ],
  },
  "DENotes-p74": {
    title: "Clock counts for shift registers",
    points: [
      "SISO: n clocks to write + (n−1) to read = 2n−1 total.",
      "SIPO: n in, 0 out (parallel read) → n.  PISO: 1 in (parallel), n−1 out → n.",
      "Count = however many bits must move serially.",
    ],
  },
  "DENotes-p75": {
    title: "PIPO & the ring counter",
    points: [
      "PIPO: parallel in, parallel out → just 1 clock (fastest).",
      "Ring counter = a shift register with the last output fed back to the first input (circular shift).",
      "For n flip-flops a ring counter has only n states (not 2ⁿ) — the rest are unused.",
    ],
  },
  "DENotes-p76": {
    title: "Johnson counter",
    points: [
      "Johnson (twisted-ring): feed the COMPLEMENT of the last output back to the first.",
      "This doubles the states: n flip-flops → 2n states (6 for 3 flip-flops).",
      "Summary for n bits: ideal counter 2ⁿ states, ring n, Johnson 2n.",
    ],
  },
};

export function pageNoteOf(key: string): PageNote | null {
  return pageNotes[key] ?? null;
}