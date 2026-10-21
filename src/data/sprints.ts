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
  title: "Calculus — from class 8 to the end-sem",
  examLine: "End-sem: Mon 7 Dec · 10:00 AM–1:00 PM · Section A 5×4 · B 4×10 · C 2×20",
  scopeLine: "Whole syllabus — Units I–V, starting from school algebra",
  intro:
    "Built for starting from class-8 maths. Stage 0–1 rebuild only the school maths the course leans on; Units I–V follow the syllabus. Watch at 1.25×, pause on every example and write it out yourself before the teacher does. If a video assumes something you don't know, go back one step. Each step is also a block in your Sprint plan, in this order.",
  groups: [
    {
      heading: "Stage 0 · School algebra (class 8–10)",
      tag: "Only the algebra calculus leans on. Skip a step if it already feels easy.",
      steps: [
        { id: "calc-s0-identities", kind: "watch", title: "Algebraic identities", note: "Expand (a+b)², (a−b)², (a+b)(a−b), (a+b)³ and factorise with them without looking.", videos: [{ title: "Exploring Algebraic Identities — one shot — Magnet Brains", url: "https://www.youtube.com/watch?v=xpsTvoFNFnM", dur: "45m" }] },
        { id: "calc-s0-exponents", kind: "watch", title: "Exponents and linear equations", note: "Use aᵐ·aⁿ = aᵐ⁺ⁿ, (aᵐ)ⁿ, a⁰ = 1, a⁻ⁿ = 1/aⁿ; solve any one-variable linear equation.", videos: [{ title: "Exponents and Powers — one shot — PW Class 8", url: "https://www.youtube.com/watch?v=nAGe4c4ifp4", dur: "33m" }, { title: "Linear Equations in One Variable — one shot — PW Class 8", url: "https://www.youtube.com/watch?v=3zBMvBfsbKo", dur: "24m" }] },
        { id: "calc-s0-quadratic", kind: "watch", title: "Quadratic equations", note: "Solve ax²+bx+c = 0 by factorising and by the formula; know what the discriminant tells you.", videos: [{ title: "Quadratic Equations — one shot — Ushank Sir (Science and Fun)", url: "https://www.youtube.com/watch?v=zNOKESrtK_M", dur: "53m" }] },
      ],
    },
    {
      heading: "Stage 1 · The class 11–12 maths the course assumes",
      tag: "This is what the teacher expects you to already know. Each step builds on the one before.",
      steps: [
        { id: "calc-s1-functions", kind: "watch", title: "Functions, graphs and slope", note: "Read f(x), domain and range; sketch x², x³, 1/x, √x, |x|, eˣ, ln x; slope and y = mx + c.", videos: [{ title: "Relations and Functions — rapid revision — Next Toppers", url: "https://www.youtube.com/watch?v=aFtU7DFffNI", dur: "24m" }, { title: "Graphs of functions — LearnoHub", url: "https://www.youtube.com/watch?v=r34TZ5DUbBs", dur: "14m" }, { title: "Slope-intercept form of a line (Hindi) — Hamari Mathshala", url: "https://www.youtube.com/watch?v=YeJXJ9GcNsI", dur: "8m" }] },
        { id: "calc-s1-toolkit", kind: "watch", title: "The calculus toolkit in one go (trig, differentiation, integration)", note: "Sin/cos/tan of standard angles; what a derivative and an integral mean; the basic rules for both.", videos: [{ title: "Basic Mathematics — trigonometry, differentiation and integration — Physics Wallah — Alakh Pandey", url: "https://www.youtube.com/watch?v=zY38SV2BW7k", dur: "1h 28m" }] },
        { id: "calc-s1-logs-trig", kind: "watch", title: "Logarithms and trig identities", note: "Log laws, e and ln; sin²+cos² = 1, compound and double-angle formulas.", videos: [{ title: "Complete Logarithm in 10 minutes — Ronak Shah (Unacademy)", url: "https://www.youtube.com/watch?v=-Rvg7Gin80E", dur: "16m" }, { title: "Trigonometric Functions — rapid revision — Next Toppers", url: "https://www.youtube.com/watch?v=E2XJlUrx52s", dur: "23m" }] },
        { id: "calc-s1-limits", kind: "watch", title: "Limits", note: "Evaluate limits by substitution, factorising and the standard results (sin x / x → 1).", videos: [{ title: "Limits and Derivatives — one shot — Ushank Sir (Science and Fun)", url: "https://www.youtube.com/watch?v=7cCYGq8Hz74", dur: "58m" }] },
        { id: "calc-s1-differentiation", kind: "watch", title: "Differentiation rules, chain rule, continuity", note: "Product, quotient and chain rules; derivatives of all standard functions; what continuity means.", videos: [{ title: "Continuity and Differentiability — one shot — Ushank Sir (Science and Fun)", url: "https://www.youtube.com/watch?v=cnpv-t2DGiw", dur: "1h 30m" }] },
        { id: "calc-s1-diff-drill", kind: "core", title: "25 derivatives by hand + maxima/minima in one variable", note: "Any chain/product/quotient derivative in under a minute; find a max or min with f′ = 0 and f″.", videos: [{ title: "Maxima & Minima in 15 minutes — Pradeep Giri Academy", url: "https://www.youtube.com/watch?v=GSyrWWmEOkI", dur: "23m" }] },
        { id: "calc-s1-integration", kind: "watch", title: "Integration from basics", note: "Standard integrals table, substitution, integration by parts.", videos: [{ title: "Integration beginner's course, from basics — Neha Agrawal — Mathematically Inclined", url: "https://www.youtube.com/watch?v=C3DS0tqK2TY", dur: "1h 26m" }] },
        { id: "calc-s1-definite", kind: "watch", title: "Definite integrals and area under a curve", note: "Evaluate ∫ₐᵇ with limits; find the area between a curve and the x-axis.", videos: [{ title: "Definite Integrals — one shot — A4S Hub (Ashish Sir)", url: "https://www.youtube.com/watch?v=T5oOcAhWOZ0", dur: "1h 14m" }, { title: "Application of Integrals in 25 minutes — Next Toppers", url: "https://www.youtube.com/watch?v=Hc0yyWZsAPs", dur: "25m" }] },
        { id: "calc-s1-vectors", kind: "watch", title: "Vectors", note: "i, j, k components, magnitude, unit vector, dot and cross product and what each means.", videos: [{ title: "Vector — super one shot — Ushank Sir (Science and Fun)", url: "https://www.youtube.com/watch?v=U7nSbEZyYnA", dur: "2h 23m" }] },
        { id: "calc-s1-matrices", kind: "watch", title: "Matrices and determinants", note: "Matrix multiplication; 2×2 and 3×3 determinants (you need these for the Hessian and the Jacobian).", videos: [{ title: "Matrices — detailed explanation — Ushank Sir (Science and Fun)", url: "https://www.youtube.com/watch?v=MYF034ZUKxo", dur: "46m" }, { title: "Determinants — one shot — Ushank Sir (Science and Fun)", url: "https://www.youtube.com/watch?v=2NncYZhn6FI", dur: "1h 12m" }] },
      ],
    },
    {
      heading: "Unit I · One-variable calculus",
      tag: "From here it's engineering maths — GP Sir's short lectures, one idea each.",
      steps: [
        { id: "calc-u1-lcd", kind: "watch", title: "Limits, continuity, differentiability", note: "Left/right-hand limits; test continuity and differentiability at a point (the |x| at 0 example).", videos: [{ title: "Limit of a function — LHL and RHL — Dr. Gajendra Purohit", url: "https://www.youtube.com/watch?v=DSA8yvgVltA", dur: "15m" }, { title: "Continuity of a function — Dr. Gajendra Purohit", url: "https://www.youtube.com/watch?v=mhi5TdWLUjs", dur: "15m" }, { title: "Differentiability of a function — Dr. Gajendra Purohit", url: "https://www.youtube.com/watch?v=xzvl-a7RmPU", dur: "12m" }] },
        { id: "calc-u1-lcd-drill", kind: "do", title: "Limits and continuity problems", note: "10 exam-style limit / continuity / differentiability checks." },
        { id: "calc-u1-successive", kind: "watch", title: "Successive differentiation and Leibnitz", note: "nth derivative of standard functions; Leibnitz theorem for the nth derivative of a product.", videos: [{ title: "Successive Differentiation — concepts & examples — Dr. Gajendra Purohit", url: "https://www.youtube.com/watch?v=KijGLjxKlsY", dur: "15m" }, { title: "Leibnitz Theorem — Part I — Dr. Gajendra Purohit", url: "https://www.youtube.com/watch?v=EGnI8WyYb3o", dur: "30m" }] },
        { id: "calc-u1-successive-drill", kind: "do", title: "Successive differentiation problems", note: "6 nth-derivative and Leibnitz questions." },
        { id: "calc-u1-mvt", kind: "watch", title: "Rolle's theorem and Lagrange's mean value theorem", note: "State both, check the conditions, find c; know the geometric picture.", videos: [{ title: "Rolle's Theorem — proof & examples — Dr. Gajendra Purohit", url: "https://www.youtube.com/watch?v=IFtjDDB8fzo", dur: "16m" }, { title: "Lagrange's Mean Value Theorem — proof & examples — Dr. Gajendra Purohit", url: "https://www.youtube.com/watch?v=_rLizW7giT4", dur: "13m" }] },
        { id: "calc-u1-mvt-drill", kind: "do", title: "Rolle + LMVT problems", note: "8 verify-and-find-c questions." },
        { id: "calc-u1-taylor", kind: "watch", title: "Taylor and Maclaurin series", note: "Expand eˣ, sin x, cos x, log(1+x) and any f(x) about a point.", videos: [{ title: "Taylor Series — Part I — Dr. Gajendra Purohit", url: "https://www.youtube.com/watch?v=LEspaisjDFE", dur: "18m" }, { title: "Maclaurin Series — Part I — Dr. Gajendra Purohit", url: "https://www.youtube.com/watch?v=Ac1mr2WrO-g", dur: "19m" }] },
        { id: "calc-u1-taylor-drill", kind: "do", title: "Taylor expansions", note: "6 expansions to 3–4 terms." },
      ],
    },
    {
      heading: "Unit II · Two-variable calculus",
      tag: "Same ideas as Unit I, now with x and y.",
      steps: [
        { id: "calc-u2-limits", kind: "watch", title: "Limits and continuity in two variables", note: "Show a limit doesn't exist by approaching along two paths (y = mx, y = x²).", videos: [{ title: "Limit of a two-variable function — Dr. Gajendra Purohit", url: "https://www.youtube.com/watch?v=ZXNrEI5lIWs", dur: "16m" }, { title: "Two-variable limits — examples, Part II — Dr. Gajendra Purohit", url: "https://www.youtube.com/watch?v=jydFFxeWYkI", dur: "11m" }] },
        { id: "calc-u2-partial", kind: "watch", title: "Partial derivatives", note: "∂f/∂x holds y constant; second-order and mixed partials, fxy = fyx.", videos: [{ title: "Partial Differentiation — examples — Dr. Gajendra Purohit", url: "https://www.youtube.com/watch?v=eTp5wq-cSXY", dur: "17m" }, { title: "Partial Differentiation — one shot — Pradeep Giri Academy", url: "https://www.youtube.com/watch?v=VIMZq5x4Wqk", dur: "43m" }] },
        { id: "calc-u2-partial-drill", kind: "do", title: "Partial derivatives problems", note: "12 partial-derivative questions, including verifying fxy = fyx." },
        { id: "calc-u2-total", kind: "watch", title: "Total derivative and chain rule", note: "du/dt along a curve; implicit differentiation with partials.", videos: [{ title: "Total Differential Coefficient — Dr. Gajendra Purohit", url: "https://www.youtube.com/watch?v=kmsmhnlJ5UI", dur: "15m" }, { title: "Total Differentiation — example & question — Dr. Gajendra Purohit", url: "https://www.youtube.com/watch?v=9GKfvknvTQk", dur: "16m" }] },
        { id: "calc-u2-euler", kind: "watch", title: "Euler's theorem for homogeneous functions", note: "Check homogeneity and its degree; x·fx + y·fy = n·f and the second-order form.", videos: [{ title: "Euler's Theorem for Homogeneous Functions — Dr. Gajendra Purohit", url: "https://www.youtube.com/watch?v=bTs7ncA_AtY", dur: "19m" }] },
        { id: "calc-u2-euler-drill", kind: "do", title: "Euler's theorem problems", note: "6 prove / verify questions." },
        { id: "calc-u2-taylor", kind: "watch", title: "Taylor and Maclaurin in two variables", note: "Expand f(x, y) to second-degree terms about a point.", videos: [{ title: "Taylor Series for two variables — Part I — Dr. Gajendra Purohit", url: "https://www.youtube.com/watch?v=CQV8FCLja9Q", dur: "18m" }, { title: "Taylor Series for two variables — Part II — Dr. Gajendra Purohit", url: "https://www.youtube.com/watch?v=KKlqFJjhtQ4", dur: "23m" }] },
      ],
    },
    {
      heading: "Unit III · Applications: optimisation",
      tag: "Finding the best value — the maths behind machine learning.",
      steps: [
        { id: "calc-u3-maxmin", kind: "watch", title: "Maxima and minima of f(x, y)", note: "Stationary points, the rt − s² test, classify max / min / saddle.", videos: [{ title: "Maxima and Minima of two-variable functions — Dr. Gajendra Purohit", url: "https://www.youtube.com/watch?v=NpR91wexqHA", dur: "25m" }] },
        { id: "calc-u3-maxmin-drill", kind: "do", title: "Maxima and minima problems", note: "6 full classify-the-points questions." },
        { id: "calc-u3-lagrange", kind: "watch", title: "Lagrange multipliers", note: "Set up L = f + λg, solve the system, interpret the answer.", videos: [{ title: "Lagrange's Method of Undetermined Multipliers — Dr. Gajendra Purohit", url: "https://www.youtube.com/watch?v=FrD7uu6chP0", dur: "26m" }] },
        { id: "calc-u3-lagrange-drill", kind: "do", title: "Lagrange multiplier problems", note: "5 constrained-extremum questions." },
        { id: "calc-u3-hessian", kind: "watch", title: "Gradient vector and Hessian matrix", note: "Build ∇f and the Hessian; use the Hessian's determinant to classify points.", videos: [{ title: "Gradient of a scalar field — Dr. Gajendra Purohit", url: "https://www.youtube.com/watch?v=9CHfHuFBTw8", dur: "21m" }, { title: "Hessian Matrix (Hindi) — Blazengg Academy", url: "https://www.youtube.com/watch?v=-uEDRqzesbE", dur: "12m" }] },
        { id: "calc-u3-gd", kind: "watch", title: "Gradient descent and Newton's method", note: "Write both update rules and run 2–3 iterations by hand.", videos: [{ title: "Introduction to Gradient Descent — Gate Smashers", url: "https://www.youtube.com/watch?v=vtOI7NgXMQQ", dur: "10m" }, { title: "Gradient Descent from scratch (first hour is enough) — CampusX", url: "https://www.youtube.com/watch?v=ORyfPJypKuU", dur: "1h 58m" }, { title: "Newton's Method for Optimization — KK Sir ki classes", url: "https://www.youtube.com/watch?v=SIqfDj1DTyM", dur: "11m" }] },
        { id: "calc-u3-regression", kind: "watch", title: "Linear regression by optimisation", note: "Least squares: derive the normal equations for y = a + bx; the idea for many inputs.", videos: [{ title: "Simple Linear Regression — intuition (Hindi) — CampusX", url: "https://www.youtube.com/watch?v=UZPfbG0jNec", dur: "34m" }, { title: "Ordinary Least Squares — CampusX", url: "https://www.youtube.com/watch?v=kFLolWyYSzY", dur: "18m" }, { title: "Multiple Linear Regression — mathematical formulation — CampusX", url: "https://www.youtube.com/watch?v=NU37mF5q8VE", dur: "48m" }] },
      ],
    },
    {
      heading: "Unit IV · Integral calculus",
      tag: "Integrating over areas and volumes.",
      steps: [
        { id: "calc-u4-double", kind: "watch", title: "Double integrals and area", note: "Evaluate over rectangles and regions bounded by curves; area as a double integral.", videos: [{ title: "Double Integral & Area by Double Integration — Dr. Gajendra Purohit", url: "https://www.youtube.com/watch?v=db7d_a0wiUg", dur: "17m" }] },
        { id: "calc-u4-double-drill", kind: "do", title: "Double integral problems", note: "8 questions; always sketch the region first." },
        { id: "calc-u4-order", kind: "watch", title: "Change of order of integration", note: "Redraw the region and swap the limits (Cartesian and polar).", videos: [{ title: "Change of Order of Integration — Dr. Gajendra Purohit", url: "https://www.youtube.com/watch?v=fXMyLYwBB3s", dur: "22m" }] },
        { id: "calc-u4-order-drill", kind: "do", title: "Change of order problems", note: "5 swap-the-order questions." },
        { id: "calc-u4-triple", kind: "watch", title: "Triple integrals", note: "Evaluate with constant and variable limits.", videos: [{ title: "Triple Integral — Dr. Gajendra Purohit", url: "https://www.youtube.com/watch?v=Gt5ApX3oIN0", dur: "22m" }] },
        { id: "calc-u4-variables", kind: "watch", title: "Change of variables: Jacobian and polar", note: "Compute a Jacobian; convert a double integral to polar coordinates.", videos: [{ title: "Jacobian and the Jacobian transformation — Dr. Gajendra Purohit", url: "https://www.youtube.com/watch?v=YXmeH1yevkk", dur: "16m" }, { title: "Change of Variable in Multiple Integrals — Dr. Gajendra Purohit", url: "https://www.youtube.com/watch?v=lNSmyPdQbVc", dur: "20m" }, { title: "Change into Polar Coordinates — Dr. Gajendra Purohit", url: "https://www.youtube.com/watch?v=Tw7nZdSO7tM", dur: "19m" }] },
        { id: "calc-u4-volume", kind: "watch", title: "Area and volume", note: "Volume by a triple (or double) integral.", videos: [{ title: "Volume by Triple Integral — Dr. Gajendra Purohit", url: "https://www.youtube.com/watch?v=XZbvZabU5ik", dur: "20m" }] },
      ],
    },
    {
      heading: "Unit V · Vector calculus",
      tag: "Vectors meet derivatives and integrals. Do Basics 9 (vectors) first if you skipped it.",
      steps: [
        { id: "calc-u5-3d", kind: "watch", title: "Equations of a line and a plane (3D geometry)", note: "Direction ratios; a line through two points; a plane through three points or with a normal.", videos: [{ title: "Three Dimensional Geometry — one shot — Ushank Sir (Science and Fun)", url: "https://www.youtube.com/watch?v=sNG2FVZi5d8", dur: "1h 41m" }] },
        { id: "calc-u5-tangent", kind: "watch", title: "Tangent plane and normal line", note: "Tangent plane and normal line to a surface at a point (uses the gradient).", videos: [{ title: "Tangent Plane & Normal Line — numericals — Gautam Varde", url: "https://www.youtube.com/watch?v=UUBdk1LXia8", dur: "19m" }] },
        { id: "calc-u5-grad", kind: "watch", title: "Gradient and directional derivative", note: "∇f; directional derivative = ∇f · unit vector; direction of greatest increase.", videos: [{ title: "Gradient & Directional Derivative — concept & questions — Dr. Gajendra Purohit", url: "https://www.youtube.com/watch?v=GrlqXl3xnPk", dur: "18m" }, { title: "Gradient of a scalar field, directional derivative, normal vector — Dr. Gajendra Purohit", url: "https://www.youtube.com/watch?v=9CHfHuFBTw8", dur: "21m" }] },
        { id: "calc-u5-divcurl", kind: "watch", title: "Divergence and curl", note: "Compute div and curl; solenoidal and irrotational fields; physical meaning.", videos: [{ title: "Divergence and Curl — irrotational & solenoidal — Dr. Gajendra Purohit", url: "https://www.youtube.com/watch?v=csCskd01jwE", dur: "10m" }, { title: "Divergence and Curl of a vector field — Dr. Gajendra Purohit", url: "https://www.youtube.com/watch?v=IKW_4QltDXk", dur: "13m" }] },
        { id: "calc-u5-line", kind: "watch", title: "Line integrals and work done", note: "∫ F · dr along a curve; work done by a force; scalar potential.", videos: [{ title: "Line Integrals of a Vector Field — Dr. Gajendra Purohit", url: "https://www.youtube.com/watch?v=pfCwRLK29h4", dur: "23m" }, { title: "Application of Line Integral — work done — Dr. Gajendra Purohit", url: "https://www.youtube.com/watch?v=sO9Z2RSeH4s", dur: "22m" }] },
        { id: "calc-u5-surface", kind: "watch", title: "Surface integrals", note: "Flux of a vector field through a surface.", videos: [{ title: "Surface Integral — Dr. Gajendra Purohit", url: "https://www.youtube.com/watch?v=X2Z0tJG0rjU", dur: "15m" }] },
        { id: "calc-u5-drill", kind: "do", title: "Vector calculus problems", note: "8 mixed questions." },
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
