import type { SeedSubject } from "../types";

export const calculus: SeedSubject = {
  slug: "applied-calculus",
  name: "Applied Calculus",
  shortName: "Calculus",
  code: "CSE26103",
  credits: 3,
  ltpc: "3-0-0-3",
  color: "violet",
  status: "complete",
  teacher: "Dr. Vishwa Prakash Jha",
  labTeacher: "Dr. Vishwa Prakash Jha",
  hasLab: true,
  labTitle: "Applied Calculus Lab",
  labCode: null,
  labLtpc: "0-0-2-1",
  overview:
    "Differential and integral calculus for single and multiple variables. Limits, continuity, differentiation, Taylor and Maclaurin expansions, partial derivatives, multivariable optimisation, definite and indefinite integrals, double and triple integrals, and vector calculus — with applications to real engineering problems.",
  midsemScope: "Units I, II and III — one-variable calculus, two-variable calculus, and applications of differential calculus.",
  midsemConfirmed: true,
  objectives: [
    "Build a foundation in differential calculus of one and two variables — differentiation techniques, mean value theorems, Taylor expansions.",
    "Analyse multivariable functions using partial derivatives, total derivatives, Jacobians and optimisation techniques.",
    "Evaluate multiple integrals and apply them to compute areas, volumes and related engineering problems.",
    "Introduce vector calculus — gradient, divergence, curl, directional derivatives, line and surface integrals.",
  ],
  outcomes: [
    {
      code: "CO1",
      text: "Understand differentiation techniques, mean value theorems, and Taylor's theorem to analyse functions of one and two variables.",
      bloom: "K2 — Understanding",
    },
    {
      code: "CO2",
      text: "Solve multivariable calculus problems involving partial derivatives, total derivatives, Jacobians, homogeneous functions, and constrained optimisation using Lagrange multipliers.",
      bloom: "K3 — Applying",
    },
    {
      code: "CO3",
      text: "Evaluate double and triple integrals and apply them to determine areas, volumes, and other engineering quantities.",
      bloom: "K3 — Applying",
    },
    {
      code: "CO4",
      text: "Analyse vector fields using gradient, divergence, curl, directional derivatives, and evaluate line and surface integrals in engineering contexts.",
      bloom: "K4 — Analysing",
    },
  ],
  units: [
    {
      number: 1,
      title: "One Variable Calculus",
      sessions: 9,
      co: "CO1",
      assessment: "Quiz 1 (5 marks)",
      inMidsem: true,
      topics: [
        {
          code: "calc-u1-limits",
          session: "S1-S2",
          title: "Limit, Continuity, Differentiability for functions of a single variable",
          weight: 4,
          inMidsem: true,
          outcome:
            "Evaluate one-sided and two-sided limits, classify discontinuities, and test differentiability from the definition.",
        },
        {
          code: "calc-u1-successive",
          session: "S3",
          title: "Successive differentiation of standard functions",
          weight: 4,
          inMidsem: true,
          outcome:
            "Find the nth derivative of standard forms and apply Leibnitz's theorem to products.",
        },
        {
          code: "calc-u1-rolle",
          session: "S4-S5",
          title: "Rolle's theorem",
          weight: 5,
          inMidsem: true,
          outcome:
            "State all three hypotheses, verify them for a given function on an interval, and find c with f'(c)=0.",
        },
        {
          code: "calc-u1-lmvt",
          session: "S6",
          title: "Lagrange's mean value theorem",
          weight: 5,
          inMidsem: true,
          outcome:
            "Verify LMVT conditions and find c satisfying f'(c) = (f(b)-f(a))/(b-a); use it to prove simple inequalities.",
        },
        {
          code: "calc-u1-taylor1",
          session: "S7-S8",
          title: "Taylor's theorem for one-variable functions",
          weight: 5,
          inMidsem: true,
          outcome:
            "Expand a function about a point, write the Lagrange remainder, and get Maclaurin series for standard functions.",
        },
        {
          code: "calc-u1-numerical",
          session: "S9",
          title: "Numerical practice",
          weight: 2,
          inMidsem: true,
          outcome: "Mixed problem set over the whole unit — treat this as your Quiz 1 rehearsal.",
        },
      ],
    },
    {
      number: 2,
      title: "Two Variables Calculus",
      sessions: 9,
      co: "CO1",
      assessment: "Assignment 1 (10 marks)",
      inMidsem: true,
      topics: [
        {
          code: "calc-u2-limits2",
          session: "S1-S3",
          title: "Limits, continuity and differentiability of functions of two variables",
          weight: 5,
          inMidsem: true,
          outcome:
            "Test a limit along multiple paths (y=mx, y=x²) to prove non-existence, and distinguish existence of partials from differentiability.",
        },
        {
          code: "calc-u2-partial",
          session: "S4",
          title: "Partial derivatives",
          weight: 5,
          inMidsem: true,
          outcome:
            "Compute first and higher-order partials, verify mixed-partial equality, and evaluate at a point.",
        },
        {
          code: "calc-u2-total",
          session: "S5",
          title: "Total derivative",
          weight: 4,
          inMidsem: true,
          outcome: "Apply the chain rule for composite functions and compute df/dt along a curve.",
        },
        {
          code: "calc-u2-euler",
          session: "S6-S7",
          title: "Euler's theorem for homogeneous functions",
          weight: 5,
          inMidsem: true,
          outcome:
            "Identify degree of homogeneity and verify x·fx + y·fy = n·f, including the second-order extension.",
        },
        {
          code: "calc-u2-taylor2",
          session: "S8-S9",
          title: "Taylor and Maclaurin series for functions of two variables",
          weight: 4,
          inMidsem: true,
          outcome: "Expand f(x,y) about a point up to second or third-order terms.",
        },
      ],
    },
    {
      number: 3,
      title: "Applications of Differential Calculus",
      sessions: 10,
      co: "CO2",
      assessment: "Mid-Term Examination (20 marks)",
      inMidsem: true,
      topics: [
        {
          code: "calc-u3-maxmin",
          session: "S1-S2",
          title: "Maxima and minima of functions of two variables",
          weight: 5,
          inMidsem: true,
          outcome:
            "Find stationary points, apply the second-derivative (rt − s²) test, and classify max / min / saddle.",
        },
        {
          code: "calc-u3-lagrange",
          session: "S3",
          title: "Lagrange's method of multipliers",
          weight: 5,
          inMidsem: true,
          outcome:
            "Set up the auxiliary function, solve the constrained system, and interpret λ.",
        },
        {
          code: "calc-u3-hessian",
          session: "S4",
          title: "Gradient vector and Hessian matrices",
          weight: 4,
          inMidsem: true,
          outcome:
            "Build ∇f and H, use eigenvalues / leading minors to classify a critical point.",
        },
        {
          code: "calc-u3-gd",
          session: "S5-S6",
          title: "Gradient descent algorithm, Newton's method for optimisation",
          weight: 4,
          inMidsem: true,
          outcome:
            "Write the update rules, hand-iterate 2–3 steps, and explain why the learning rate controls convergence.",
        },
        {
          code: "calc-u3-regression",
          session: "S7-S9",
          title: "Simple and multiple linear regression through optimisation",
          weight: 3,
          inMidsem: true,
          outcome:
            "Derive normal equations by minimising squared error and connect them to the gradient-descent update.",
        },
        {
          code: "calc-u3-revision",
          session: "S10",
          title: "Revision & practice questions",
          weight: 1,
          inMidsem: true,
          outcome: "The pre-mid-sem revision session. Turn up with your doubt list.",
        },
      ],
    },
    {
      number: 4,
      title: "Integral Calculus",
      sessions: 8,
      co: "CO3",
      assessment: "Quiz 2 (5 marks)",
      inMidsem: false,
      topics: [
        {
          code: "calc-u4-double",
          session: "S1",
          title: "Double integrals",
          weight: 5,
          inMidsem: false,
          outcome: "Set up and evaluate ∬ over rectangular and general regions.",
        },
        {
          code: "calc-u4-triple",
          session: "S2",
          title: "Triple integrals",
          weight: 4,
          inMidsem: false,
          outcome: "Order the limits correctly for a solid region and evaluate.",
        },
        {
          code: "calc-u4-order",
          session: "S3-S4",
          title: "Change of order of integration",
          weight: 5,
          inMidsem: false,
          outcome: "Sketch the region, re-read the limits in the other order, and evaluate.",
        },
        {
          code: "calc-u4-variables",
          session: "S5-S6",
          title: "Change of variables",
          weight: 4,
          inMidsem: false,
          outcome: "Use the Jacobian to move to polar / cylindrical / spherical coordinates.",
        },
        {
          code: "calc-u4-areavol",
          session: "S7-S8",
          title: "Applications to area and volume",
          weight: 4,
          inMidsem: false,
          outcome: "Compute plane areas and solid volumes using double and triple integrals.",
        },
      ],
    },
    {
      number: 5,
      title: "Vector Calculus",
      sessions: 9,
      co: "CO4",
      assessment: "Assignment 2 (10 marks)",
      inMidsem: false,
      topics: [
        {
          code: "calc-u5-lineplane",
          session: "S1",
          title: "Equations to a line and a plane",
          weight: 3,
          inMidsem: false,
          outcome: "Write vector and Cartesian forms; find intersections and distances.",
        },
        {
          code: "calc-u5-tangent",
          session: "S2-S3",
          title: "Tangent plane and normal line",
          weight: 4,
          inMidsem: false,
          outcome: "Use ∇F at a point to get the tangent plane and normal line of a surface.",
        },
        {
          code: "calc-u5-gradcurldiv",
          session: "S4-S5",
          title: "Gradient, curl and divergence and their physical significance",
          weight: 5,
          inMidsem: false,
          outcome:
            "Compute all three, and say what each means physically (flux density, rotation, steepest ascent).",
        },
        {
          code: "calc-u5-directional",
          session: "S6-S7",
          title: "Directional derivatives",
          weight: 5,
          inMidsem: false,
          outcome:
            "Normalise the direction vector, compute ∇f·û, and identify the direction of maximum increase.",
        },
        {
          code: "calc-u5-linesurface",
          session: "S8-S9",
          title: "Line and surface integrals",
          weight: 5,
          inMidsem: false,
          outcome: "Parametrise the curve or surface and evaluate work / flux integrals.",
        },
      ],
    },
  ],
  experiments: [
    {
      number: 1,
      title: "Introduction to MATLAB/Python: basic commands, symbolic variables, arithmetic, plotting",
      co: "CO1",
      objective:
        "Get familiar with the MATLAB/Python environment, symbolic variables, basic commands, arithmetic operations and graphical visualisation of standard functions.",
      tasks: [
        "Learn the interface: command window, workspace, editor, help utilities.",
        "Perform arithmetic, define symbolic variables, evaluate expressions.",
        "Plot algebraic, trigonometric, exponential and logarithmic functions; customise titles, labels, legends, grids.",
      ],
      inMidsem: true,
    },
    {
      number: 2,
      title: "Numerical exploration of limit and continuity",
      co: "CO1",
      objective:
        "Numerically evaluate limits by approaching from both sides with shrinking h, and plot the three kinds of discontinuity. The notebook handed out has five programs (numpy + matplotlib) and a three-part assignment to submit.",
      tasks: [
        "Program 1 — table of f(x) = (x²−4)/(x−2) at x = 2 ± h for h = 0.1 … 0.00001; both sides → 4, so the limit exists and equals 4.",
        "Program 2 — the same table for g(x) = 1/x at 0: left → −∞, right → +∞, LHL ≠ RHL, limit does not exist.",
        "Program 3 — plot (x²−4)/(x−2) in two pieces around x = 2 and mark the hole: a removable discontinuity (limit 4, f(2) undefined).",
        "Program 4 — piecewise f = x+1 (x<2), x+3 (x≥2): left limit 3, right limit 5 — a jump discontinuity.",
        "Program 5 — 1/x with the asymptote drawn at x = 0 — an infinite discontinuity.",
        "Assignment (submit): (a) run the limit table for (x²−9)/(x−3) at x = 3 — left, right, does it exist; (b) plot |x|/x at 0, name the discontinuity type and explain why the limit fails; (c) invent your own piecewise function with a jump, plot it, and verify the jump numerically.",
      ],
      inMidsem: true,
    },
    {
      number: 3,
      title: "Graphing functions and derivatives",
      co: "CO1",
      objective:
        "Compute derivatives numerically (forward, backward and central difference), plot f and f′ together, and read off increasing/decreasing intervals, maxima, minima, concavity and inflection points. Eight programs in the handed-out notebook.",
      tasks: [
        "Program 1–2 — forward difference f′(x) ≈ [f(x+h) − f(x)]/h for f = x² at one point, then over an array; compare with 2x.",
        "Program 3 — plot x² and its derivative 2x; f′ < 0 left of 0, f′ > 0 right of 0, minimum where f′ crosses zero.",
        "Program 4 — x³ − 6x² + 9x + 1 with central difference; critical points at x = 1 (local max) and x = 3 (local min).",
        "Program 5 — sin x and its derivative cos x on [0, 2π]; the derivative is zero at the max (π/2) and min (3π/2).",
        "Program 6 — find critical points automatically (sign change of f′) and classify them by the sign of f′ on either side.",
        "Program 7 — x³ − 3x² − 9x + 5: shade increasing (f′>0) and decreasing (f′<0) regions.",
        "Program 8 — second derivative f″(x) ≈ [f(x+h) − 2f(x) + f(x−h)]/h² for x³ − 3x: concave up where f″>0, down where f″<0, inflection at x = 0.",
        "Know the three difference formulas and why the central one is most accurate — that's the viva question.",
      ],
      inMidsem: true,
    },
    {
      number: 4,
      title: "Taylor and Maclaurin series",
      co: "CO2",
      objective:
        "Compute Taylor and Maclaurin expansions of elementary functions and analyse approximation error.",
      tasks: [
        "Generate series up to a specified degree using symbolic computation.",
        "Compare the series approximation with the original function numerically and graphically.",
      ],
      inMidsem: true,
    },
    {
      number: 5,
      title: "Graphical verification of Rolle's Theorem and Lagrange's Mean Value Theorem",
      co: "CO2",
      objective: "Verify Rolle's and LMVT using symbolic computation and graphs.",
      tasks: [
        "Verify all theorem conditions, find c with f'(c)=0, illustrate graphically.",
        "Compute the LMVT point and visualise the corresponding tangent line.",
      ],
      inMidsem: true,
    },
    {
      number: 6,
      title: "Verification of Euler's theorem for homogeneous functions and computation of Jacobians",
      co: "CO2",
      objective: "Verify Euler's theorem and compute Jacobian matrices.",
      tasks: [
        "Identify homogeneous functions and verify Euler's theorem symbolically.",
        "Compute Jacobians for transformations in two or more variables and interpret the result.",
      ],
      inMidsem: true,
    },
    {
      number: 7,
      title: "Determination and visualisation of maxima and minima of functions of two variables",
      co: "CO2",
      objective:
        "Find critical points using partial derivatives, classify them with the second-derivative test, and visualise with surface and contour plots.",
      tasks: [
        "Compute first-order partials and solve for stationary points.",
        "Apply the Hessian test to classify each critical point.",
        "Generate 3D surface and contour plots.",
        "Verify analytical results symbolically.",
      ],
      inMidsem: true,
    },
    {
      number: 8,
      title: "Gradient Descent for function minimisation",
      co: "CO3",
      objective: "Implement gradient descent to find minima of multivariable functions.",
      tasks: [
        "Define a cost function, compute the gradient, update parameters to reach the minimum.",
        "Try different learning rates and observe convergence speed.",
      ],
      inMidsem: true,
    },
    {
      number: 9,
      title: "Newton's method for function minimisation",
      co: "CO3",
      objective: "Implement Newton's method to find minima of multivariable functions.",
      tasks: [
        "Define a cost function, compute gradient and Hessian, update parameters.",
        "Compare convergence against gradient descent.",
      ],
      inMidsem: false,
    },
    {
      number: 10,
      title: "Multiple Linear Regression using Gradient Descent",
      co: "CO3",
      objective: "Implement multiple linear regression via gradient-descent optimisation.",
      tasks: [
        "Prepare a small multi-attribute dataset, define the loss, update parameters by gradient descent.",
        "Compare learned parameters against built-in regression tools.",
      ],
      inMidsem: false,
    },
  ],
  components: [
    {
      name: "Quiz 1",
      marks: 5,
      weightage: 5,
      scope: "Unit I",
      timing: "After Unit I",
      co: "CO1",
      track: "theory",
    },
    {
      name: "Assignment 1",
      marks: 10,
      weightage: 10,
      scope: "Units I, II",
      timing: "After Unit II",
      co: "CO1",
      track: "theory",
    },
    {
      name: "Mid-Term Examination",
      marks: 20,
      weightage: 20,
      scope: "Units I, II & III",
      timing: "After Unit III — 5–11 Oct",
      co: "CO1, CO2",
      track: "theory",
    },
    {
      name: "Quiz 2",
      marks: 5,
      weightage: 5,
      scope: "Unit IV",
      timing: "After Unit IV",
      co: "CO3",
      track: "theory",
    },
    {
      name: "Assignment 2",
      marks: 10,
      weightage: 10,
      scope: "Units IV and V",
      timing: "After Unit V",
      co: "CO3, CO4",
      track: "theory",
    },
    {
      name: "End-Term Examination",
      marks: 100,
      weightage: 50,
      scope: "Entire syllabus, Units I–V",
      timing: "End-Term",
      co: "CO1–CO4",
      track: "theory",
    },
    {
      name: "Lab Quizzes (5 compulsory × 10)",
      marks: 50,
      weightage: 50,
      scope: "Concepts, syntax, logic, debugging across all experiments",
      timing: "Continuous",
      co: "CO1–CO3",
      track: "lab",
    },
    {
      name: "Execution & Viva Voce (5 compulsory × 10)",
      marks: 50,
      weightage: 50,
      scope: "Practical coding, implementation, output accuracy",
      timing: "Continuous",
      co: "CO1–CO3",
      track: "lab",
    },
  ],
  strategies: [
    {
      title: "The mid-sem is 20 marks but it's the cheapest 20 you'll get",
      body: `Units I, II and III only. That's 28 sessions of content and it is *entirely* problem-solving — there is almost no theory to write. Every single question type has a fixed method. The examiner is checking whether you can execute the method, not whether you understand calculus deeply.

So the winning move is **method sheets, not notes**. For each of the 17 mid-sem topics, write one page: the setup, the steps in order, one worked example, one trap. Then drill.

The single highest-value thing: Rolle's, LMVT, Euler's theorem, maxima/minima with the rt−s² test, and Lagrange multipliers. Those five are near-certain to appear and each has a mechanical recipe.`,
    },
    {
      title: "Use the assignment that's already in your course plan",
      body: `Your Applied Calculus course plan contains a complete 5-question written assignment with a full marking rubric — limits of two variables along paths, partial derivatives, gradient + directional derivative, definition of differentiability, and the partials-exist-but-not-differentiable counterexample.

That is not a random assignment. It is the faculty telling you exactly what they consider examinable in Unit II. Solve all five, then read the rubric and grade yourself honestly. If you can score 8/10 against that rubric you are in good shape for that whole unit.

The rubric is reproduced in full on this subject's Marks tab.`,
    },
    {
      title: "Learn the counterexamples, not just the theorems",
      body: `Calculus papers at this level love "show that X exists but Y fails". Memorise these three and you will recognise most variants:

• **f(x,y) = xy/(x²+y²)**, f(0,0)=0 — partials exist at origin, but f is not differentiable there.
• **f(x,y) = x²y/(x⁴+y²)** — limit is 0 along every straight line y=mx but 1/2 along y=x², so the limit does not exist.
• **f(x) = |x|** on [−1,1] — continuous, f(−1)=f(1), but Rolle fails because it is not differentiable at 0.

Each one is a 2-mark question that takes 4 minutes if you've seen it and 20 if you haven't.`,
    },
    {
      title: "The lab is 100 marks of pure continuous assessment — don't sleep on it",
      body: `Applied Calculus Lab has **no end-sem written paper**. It's 50 marks of quizzes (5 × 10) plus 50 marks of execution & viva (5 × 10). All of it happens during lab hours, and your lab file is checked at the start of every session.

This is the easiest 100 marks in your semester and it is entirely within your control. Two rules: turn up having already written the code, and keep the file current. You're a developer — writing a Python script that plots a function and its derivative is 15 minutes of work for you. Don't let it become a backlog.

Your Monday 8:50–11:00 slot is the Group 2 calculus lab, so Sunday evening is the natural time to prep the next experiment.`,
    },
    {
      title: "Python over MATLAB",
      body: `The lab plan says "MATLAB/Python" everywhere, which means you can use Python. Use it — you already know the ecosystem and the college MATLAB licence will be a hassle.

Your stack: \`sympy\` for symbolic (limits, derivatives, Taylor series, Jacobians, solving critical points), \`numpy\` + \`matplotlib\` for plotting and gradient descent, \`mpl_toolkits.mplot3d\` for surface plots. That covers all ten experiments.

Write one \`utils.py\` with your plotting helpers early on and every later experiment becomes a 20-line script.`,
    },
  ],
  textbooks: [
    {
      title: "Text Book of Calculus",
      author: "Khalil Ahmad and Pankaj Sharma, New Age International, 2022",
      note: "ISBN 978-9393159991 — the prescribed book, matches the unit structure closely.",
    },
    {
      title: "Calculus — Single and Multivariable (3rd ed.)",
      author: "Hughes-Hallett et al., John Wiley & Sons, 2001",
      note: "ISBN 978-0471408277 — better for intuition, weaker for Indian exam-style problems.",
    },
  ],
  references: [
    {
      title: "Multivariable Calculus with Applications",
      author: "Peter D. Lax and Maria S. Terrell, Springer, 2017",
    },
    {
      title: "Numerical Optimization",
      author: "Jorge Nocedal, Stephen J. Wright, Springer, 1999",
      note: "Only relevant for the Unit III gradient descent / Newton's method sessions.",
    },
  ],
  localFiles: [
    "applied_calculus/Applied Calculus Course Plan.docx",
    "applied_calculus/Lab_Course Plan_Applied_calculus.pdf",
    "applied_calculus/Applied Calculus lab 1.docx",
    "applied_calculus/Applied Calculus lab 2 - limits and continuity.ipynb",
    "applied_calculus/Applied Calculus lab 3 - derivatives and critical points.ipynb",
    "applied_calculus/Applied Calculus_GN.docx",
  ],
  gaps: [],
};
