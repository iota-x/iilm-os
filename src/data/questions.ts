import type { SeedQuestion } from "./types";

/**
 * A starter drill set for the mid-sem scope — Applied Calculus Units I–III
 * and Programming in C Units 1–4.
 *
 * These are NOT past papers. They are standard questions in the shape Indian
 * university papers use, written against your syllabus so `/practice` has
 * something in it from day one. Replace or delete them as real questions turn
 * up from lectures, tutorials and your prescribed textbooks.
 *
 * `target` is a topic code. Marks follow the usual 2 / 5 / 10 split.
 */
export const questions: SeedQuestion[] = [
  /* ── Applied Calculus · Unit I ──────────────────────────── */
  {
    target: "calc-u1-limits",
    prompt: "Evaluate $\\lim_{x \\to 0} \\dfrac{\\sin 3x}{5x}$.",
    answer:
      "Rewrite so the standard limit appears:\n\n$$\\frac{\\sin 3x}{5x} = \\frac{3}{5}\\cdot\\frac{\\sin 3x}{3x}$$\n\nAs $x \\to 0$ we have $3x \\to 0$, and $\\frac{\\sin 3x}{3x} \\to 1$.\n\n**Answer:** $\\dfrac{3}{5}$.",
    marks: 2,
  },
  {
    target: "calc-u1-limits",
    prompt: "Examine $f(x) = |x - 2|$ at $x = 2$ for continuity and differentiability.",
    answer:
      "**Continuity.** Left limit $= 0$, right limit $= 0$, and $f(2) = 0$. All three agree, so $f$ is continuous at $x = 2$.\n\n**Differentiability.** From the definition:\n\n- LHD $= \\lim_{h\\to0^-}\\frac{|2+h-2|-0}{h} = \\lim\\frac{-h}{h} = -1$\n- RHD $= \\lim_{h\\to0^+}\\frac{h}{h} = +1$\n\nLHD $\\neq$ RHD, so $f$ is **not differentiable** at $x = 2$.\n\nThe moral, and usually the marked line: continuity does not imply differentiability. A corner is the counterexample.",
    marks: 5,
  },
  {
    target: "calc-u1-successive",
    prompt: "If $y = \\sin(ax + b)$, find the $n$th derivative $y_n$.",
    answer:
      "Each differentiation advances the phase by $\\frac{\\pi}{2}$ and pulls out a factor $a$:\n\n- $y_1 = a\\cos(ax+b) = a\\sin\\!\\left(ax+b+\\tfrac{\\pi}{2}\\right)$\n- $y_2 = a^2\\sin\\!\\left(ax+b+\\tfrac{2\\pi}{2}\\right)$\n\n**Answer:** $y_n = a^n \\sin\\!\\left(ax + b + \\dfrac{n\\pi}{2}\\right)$.\n\nThe cosine case is identical with $\\cos$ in place of $\\sin$.",
    marks: 5,
  },
  {
    target: "calc-u1-successive",
    prompt: "Using Leibnitz's theorem, find the $n$th derivative of $y = x^2 e^x$.",
    answer:
      "Leibnitz: $(uv)_n = \\sum_{k=0}^{n} \\binom{n}{k} u_{n-k} v_k$.\n\nTake $u = e^x$ (so $u_r = e^x$ for every $r$) and $v = x^2$, whose derivatives terminate: $v_0 = x^2$, $v_1 = 2x$, $v_2 = 2$, $v_k = 0$ for $k \\geq 3$. Only three terms survive:\n\n$$y_n = \\binom{n}{0}e^x x^2 + \\binom{n}{1}e^x(2x) + \\binom{n}{2}e^x(2)$$\n\n**Answer:** $y_n = e^x\\left[x^2 + 2nx + n(n-1)\\right]$.\n\nChoosing $u$ as the factor that never terminates is the whole trick.",
    marks: 5,
  },
  {
    target: "calc-u1-rolle",
    prompt: "Verify Rolle's theorem for $f(x) = x^2 - 5x + 6$ on $[2, 3]$ and find $c$.",
    answer:
      "**Check all three hypotheses.**\n\n1. $f$ is a polynomial, hence continuous on $[2,3]$.\n2. Polynomial, hence differentiable on $(2,3)$.\n3. $f(2) = 4-10+6 = 0$ and $f(3) = 9-15+6 = 0$, so $f(2) = f(3)$.\n\nRolle's theorem therefore guarantees some $c \\in (2,3)$ with $f'(c) = 0$.\n\n$f'(x) = 2x - 5 = 0 \\Rightarrow c = 2.5$, and $2.5 \\in (2,3)$.\n\nState and check the three conditions explicitly — that is where most of the marks sit.",
    marks: 5,
  },
  {
    target: "calc-u1-lmvt",
    prompt:
      "Use Lagrange's Mean Value Theorem to prove that $|\\sin a - \\sin b| \\leq |a - b|$ for all real $a, b$.",
    answer:
      "If $a = b$ both sides are $0$. Otherwise apply LMVT to $f(x) = \\sin x$ on the interval with endpoints $a$ and $b$ — continuous and differentiable everywhere — giving some $c$ strictly between them with\n\n$$\\frac{\\sin a - \\sin b}{a - b} = f'(c) = \\cos c$$\n\nTake absolute values: $\\left|\\frac{\\sin a - \\sin b}{a-b}\\right| = |\\cos c| \\leq 1$, then multiply by $|a-b|$:\n\n$$|\\sin a - \\sin b| \\leq |a - b|$$\n\nThis \"bound the derivative, then bound the difference\" pattern is the most commonly asked LMVT application.",
    marks: 5,
  },
  {
    target: "calc-u1-taylor1",
    prompt:
      "Expand $f(x) = \\ln(1 + x)$ as a Maclaurin series up to the $x^4$ term, and state the Lagrange remainder.",
    answer:
      "Derivatives at $0$: $f(0)=0$, $f'(x)=(1+x)^{-1}\\Rightarrow f'(0)=1$, $f''(0)=-1$, $f'''(0)=2$, $f^{(4)}(0)=-6$.\n\n$$\\ln(1+x) = x - \\frac{x^2}{2} + \\frac{x^3}{3} - \\frac{x^4}{4} + \\cdots$$\n\nGeneral term $\\frac{(-1)^{n-1}x^n}{n}$, valid for $-1 < x \\leq 1$.\n\n**Lagrange remainder:** $R_n = \\dfrac{f^{(n)}(\\theta x)}{n!}x^n$ for some $\\theta \\in (0,1)$.",
    marks: 5,
  },

  /* ── Applied Calculus · Unit II ─────────────────────────── */
  {
    target: "calc-u2-limits2",
    prompt: "Show that $\\lim_{(x,y) \\to (0,0)} \\dfrac{xy}{x^2 + y^2}$ does not exist.",
    answer:
      "Approach the origin along the line $y = mx$:\n\n$$\\frac{xy}{x^2+y^2} = \\frac{x(mx)}{x^2 + m^2x^2} = \\frac{m}{1+m^2}$$\n\nThis is independent of $x$ but depends on $m$ — along $y = x$ it is $\\frac{1}{2}$, along $y = 0$ it is $0$.\n\nDifferent paths give different values, so the limit **does not exist**.\n\nFor two-variable limits, producing two paths that disagree is the standard proof of non-existence.",
    marks: 5,
  },
  {
    target: "calc-u2-partial",
    prompt:
      "If $z = \\tan^{-1}\\!\\left(\\dfrac{y}{x}\\right)$, show that $\\dfrac{\\partial^2 z}{\\partial x^2} + \\dfrac{\\partial^2 z}{\\partial y^2} = 0$.",
    answer:
      "First derivatives:\n\n$$z_x = \\frac{-y}{x^2+y^2}, \\qquad z_y = \\frac{x}{x^2+y^2}$$\n\nDifferentiating again by the quotient rule:\n\n$$z_{xx} = \\frac{2xy}{(x^2+y^2)^2}, \\qquad z_{yy} = \\frac{-2xy}{(x^2+y^2)^2}$$\n\nAdding gives $z_{xx} + z_{yy} = 0$.\n\nThis is Laplace's equation; a function satisfying it is called **harmonic**.",
    marks: 5,
  },
  {
    target: "calc-u2-total",
    prompt:
      "If $u = x^2 + y^2$ where $x = t^2$ and $y = t^3$, find $\\dfrac{du}{dt}$ using the chain rule.",
    answer:
      "$$\\frac{du}{dt} = \\frac{\\partial u}{\\partial x}\\frac{dx}{dt} + \\frac{\\partial u}{\\partial y}\\frac{dy}{dt}$$\n\nWith $u_x = 2x$, $u_y = 2y$, $\\frac{dx}{dt} = 2t$, $\\frac{dy}{dt} = 3t^2$:\n\n$$\\frac{du}{dt} = 2x(2t) + 2y(3t^2) = 2t^2(2t) + 2t^3(3t^2) = 4t^3 + 6t^5$$\n\n**Check by direct substitution:** $u = t^4 + t^6 \\Rightarrow \\frac{du}{dt} = 4t^3 + 6t^5$. Agrees.",
    marks: 5,
  },
  {
    target: "calc-u2-euler",
    prompt: "Verify Euler's theorem for $u = \\dfrac{x^3 + y^3}{x + y}$.",
    answer:
      "**Establish homogeneity.** Replace $x \\to tx$, $y \\to ty$:\n\n$$u(tx,ty) = \\frac{t^3(x^3+y^3)}{t(x+y)} = t^2 u(x,y)$$\n\nSo $u$ is homogeneous of degree $n = 2$, and Euler's theorem claims $x u_x + y u_y = 2u$.\n\nSimplify first: $\\frac{x^3+y^3}{x+y} = x^2 - xy + y^2$. Then $u_x = 2x - y$, $u_y = -x + 2y$, so\n\n$$x u_x + y u_y = 2x^2 - xy - xy + 2y^2 = 2(x^2 - xy + y^2) = 2u$$\n\nEstablishing the degree first is half the marks.",
    marks: 5,
  },
  {
    target: "calc-u2-taylor2",
    prompt: "Expand $f(x,y) = e^x \\cos y$ about $(0,0)$ up to second-degree terms.",
    answer:
      "Quickest route is to multiply the one-variable series:\n\n$$e^x = 1 + x + \\frac{x^2}{2} + \\cdots, \\qquad \\cos y = 1 - \\frac{y^2}{2} + \\cdots$$\n\nMultiply and keep total degree $\\leq 2$:\n\n$$e^x\\cos y = 1 + x + \\frac{x^2}{2} - \\frac{y^2}{2} + \\cdots$$\n\n**Check against the formula.** $f(0,0)=1$, $f_x=1$, $f_y=0$, $f_{xx}=1$, $f_{yy}=-1$, $f_{xy}=0$ — which reproduces exactly the same expansion.",
    marks: 5,
  },

  /* ── Applied Calculus · Unit III ────────────────────────── */
  {
    target: "calc-u3-maxmin",
    prompt: "Find and classify the stationary points of $f(x,y) = x^3 + y^3 - 3xy$.",
    answer:
      "**Stationary points.** $f_x = 3x^2 - 3y = 0 \\Rightarrow y = x^2$, and $f_y = 3y^2 - 3x = 0 \\Rightarrow x = y^2$.\n\nSubstituting, $x = x^4 \\Rightarrow x(x^3-1) = 0 \\Rightarrow x = 0$ or $x = 1$. Points: $(0,0)$ and $(1,1)$.\n\n**Second derivative test.** $f_{xx} = 6x$, $f_{yy} = 6y$, $f_{xy} = -3$, so\n\n$$D = f_{xx}f_{yy} - f_{xy}^2 = 36xy - 9$$\n\n- At $(0,0)$: $D = -9 < 0$ → **saddle point**.\n- At $(1,1)$: $D = 27 > 0$ and $f_{xx} = 6 > 0$ → **local minimum**, $f(1,1) = -1$.",
    marks: 10,
  },
  {
    target: "calc-u3-lagrange",
    prompt:
      "Using Lagrange multipliers, minimise $x^2 + y^2 + z^2$ subject to $x + 2y + 3z = 14$.",
    answer:
      "Let $F = x^2+y^2+z^2 - \\lambda(x+2y+3z-14)$.\n\n$$F_x: 2x = \\lambda, \\qquad F_y: 2y = 2\\lambda, \\qquad F_z: 2z = 3\\lambda$$\n\nSo $x = \\frac{\\lambda}{2}$, $y = \\lambda$, $z = \\frac{3\\lambda}{2}$. Substituting into the constraint:\n\n$$\\frac{\\lambda}{2} + 2\\lambda + \\frac{9\\lambda}{2} = 7\\lambda = 14 \\Rightarrow \\lambda = 2$$\n\n**Point:** $(1, 2, 3)$. **Minimum value:** $1 + 4 + 9 = 14$.\n\nGeometrically this is the squared distance from the origin to the plane, so the answer is the foot of the perpendicular — a quick sanity check.",
    marks: 10,
  },
  {
    target: "calc-u3-hessian",
    prompt:
      "For $f(x,y) = x^2 + xy + y^2 - 3x$, find the gradient and Hessian, and classify the stationary point.",
    answer:
      "**Gradient.** $\\nabla f = (2x + y - 3,\\; x + 2y)$.\n\nSetting both to zero: $x + 2y = 0 \\Rightarrow x = -2y$; then $2(-2y) + y - 3 = 0 \\Rightarrow -3y = 3 \\Rightarrow y = -1$, $x = 2$.\n\n**Stationary point:** $(2, -1)$.\n\n**Hessian.**\n\n$$H = \\begin{pmatrix} 2 & 1 \\\\ 1 & 2 \\end{pmatrix}$$\n\n$\\det H = 3 > 0$ and the leading entry $2 > 0$, so $H$ is positive definite → **local minimum**, with $f(2,-1) = 4 - 2 + 1 - 6 = -3$.",
    marks: 10,
  },
  {
    target: "calc-u3-gd",
    prompt:
      "For $f(x) = x^2$ starting at $x_0 = 3$, perform one step of gradient descent with learning rate $\\eta = 0.1$, and one step of Newton's method. Comment on the difference.",
    answer:
      "$f'(x) = 2x$ and $f''(x) = 2$.\n\n**Gradient descent.** $x_1 = x_0 - \\eta f'(x_0) = 3 - 0.1(6) = 2.4$.\n\n**Newton's method.** $x_1 = x_0 - \\dfrac{f'(x_0)}{f''(x_0)} = 3 - \\dfrac{6}{2} = 0$.\n\n**Comment.** Newton reaches the exact minimum in one step, because it models the function as a quadratic and here $f$ genuinely is one. Gradient descent only moves proportionally to the slope, so it creeps toward $0$ over many iterations. Newton costs a second derivative every step, which is why gradient descent is preferred in high dimensions.",
    marks: 10,
  },
  {
    target: "calc-u3-regression",
    prompt:
      "Write the cost function for simple linear regression $y = mx + c$ over $n$ points, and give $\\partial J/\\partial m$ and $\\partial J/\\partial c$.",
    answer:
      "**Cost (mean squared error):**\n\n$$J(m,c) = \\frac{1}{2n}\\sum_{i=1}^{n}\\left(mx_i + c - y_i\\right)^2$$\n\nThe $\\frac{1}{2}$ exists purely so it cancels on differentiation.\n\n**Gradients:**\n\n$$\\frac{\\partial J}{\\partial m} = \\frac{1}{n}\\sum_{i=1}^{n}\\left(mx_i + c - y_i\\right)x_i$$\n\n$$\\frac{\\partial J}{\\partial c} = \\frac{1}{n}\\sum_{i=1}^{n}\\left(mx_i + c - y_i\\right)$$\n\n**Update rules:** $m \\leftarrow m - \\eta\\frac{\\partial J}{\\partial m}$ and $c \\leftarrow c - \\eta\\frac{\\partial J}{\\partial c}$.",
    marks: 10,
  },

  /* ── Programming in C · Unit 1 ──────────────────────────── */
  {
    target: "c-u1-algorithms",
    prompt:
      "Write an algorithm in step form to find the largest of three numbers, and name the flowchart symbols you would use.",
    answer:
      "```\nStep 1: Start\nStep 2: Read a, b, c\nStep 3: If a > b and a > c then large = a\nStep 4: Else if b > c then large = b\nStep 5: Else large = c\nStep 6: Print large\nStep 7: Stop\n```\n\n**Flowchart symbols:** oval for Start/Stop, parallelogram for Read/Print, **diamond for each decision** (two branches, labelled Yes/No), rectangle for assignment, arrows for flow.\n\nMarks go for: terminals present, correct decision symbols, and every path reaching Stop.",
    marks: 5,
  },
  {
    target: "c-u1-langs",
    prompt: "Distinguish between a compiler, an interpreter, a linker and a loader.",
    answer:
      "| | What it does | When | Produces |\n|---|---|---|---|\n| **Compiler** | Translates the whole source at once | Before running | Object file |\n| **Interpreter** | Translates and runs one statement at a time | While running | Nothing persistent |\n| **Linker** | Joins object files and libraries, resolves references | After compiling | Executable |\n| **Loader** | Loads the executable into memory and starts it | At run time | Running process |\n\n**Key contrasts:** a compiler reports all errors after one pass, an interpreter stops at the first. Compiled code runs faster; interpreted code is easier to debug. C is compiled.",
    marks: 5,
  },

  /* ── Programming in C · Unit 2 ──────────────────────────── */
  {
    target: "c-u2-datatypes",
    prompt:
      "What does this print, and why?\n\n```c\nint a = 5;\nfloat b = 2;\nprintf(\"%f\", a / b);\n```",
    answer:
      "**Output:** `2.500000`\n\n`a / b` mixes `int` and `float`. Under the usual arithmetic conversions the `int` is promoted to `float`, so this is floating-point division: $5.0 / 2.0 = 2.5$.\n\n**The contrast worth remembering:** had `b` been an `int`, `a / b` would be *integer* division giving `2` — and printing an `int` with `%f` is undefined behaviour. Integer division truncates toward zero, it does not round.",
    marks: 2,
  },
  {
    target: "c-u2-precedence",
    prompt: "Evaluate `10 + 20 * 30 / 5 - 4 % 3`, showing the order of operations.",
    answer:
      "`*`, `/` and `%` share the highest precedence here and associate left to right; `+` and `-` come after.\n\n1. `20 * 30` → `600`\n2. `600 / 5` → `120`\n3. `4 % 3` → `1`\n4. `10 + 120` → `130`\n5. `130 - 1` → `129`\n\n**Answer:** `129`\n\nNote that `%` sits at the *same* level as `*` and `/`, not below it — a common slip.",
    marks: 2,
  },
  {
    target: "c-u2-precedence",
    prompt:
      "Give the value of `c` and the final values of `a` and `b`:\n\n```c\nint a = 10, b = 4, c;\nc = a-- - --b;\n```",
    answer:
      "- `a--` is **post**-decrement: it yields `10`, then `a` becomes `9`.\n- `--b` is **pre**-decrement: `b` becomes `3` first, and that `3` is used.\n\nSo `c = 10 - 3 = 7`.\n\n**Answer:** `c = 7`, `a = 9`, `b = 3`.\n\nPost- means *use then change*; pre- means *change then use*.",
    marks: 5,
  },

  /* ── Programming in C · Unit 3 ──────────────────────────── */
  {
    target: "c-u3-switch",
    prompt:
      "What is the output?\n\n```c\nint x = 2;\nswitch (x) {\n  case 1: printf(\"one\");\n  case 2: printf(\"two\");\n  case 3: printf(\"three\"); break;\n  default: printf(\"other\");\n}\n```",
    answer:
      "**Output:** `twothree`\n\nControl jumps to `case 2` and prints `two`. There is **no `break`** after it, so execution *falls through* into `case 3` and prints `three`. The `break` there exits, so `default` never runs.\n\nThis is the classic fall-through question. Fall-through is deliberate in C and occasionally useful, but a missing `break` is far more often a bug.",
    marks: 5,
  },
  {
    target: "c-u3-for",
    prompt:
      "What is printed?\n\n```c\nint i, s = 0;\nfor (i = 1; i <= 5; i++) {\n  if (i == 3) continue;\n  s += i;\n}\nprintf(\"%d\", s);\n```",
    answer:
      "**Output:** `12`\n\n`continue` abandons the rest of *this iteration* and jumps to the update `i++`, so `3` is never added:\n\n$$1 + 2 + 4 + 5 = 12$$\n\n**Contrast with `break`**, which would leave the loop entirely, giving $1 + 2 = 3$. That pair is a standard two-mark question.",
    marks: 2,
  },
  {
    target: "c-u3-while",
    prompt:
      "What is the difference between `while` and `do-while`? Demonstrate with a loop whose condition is false at the start.",
    answer:
      "`while` tests **before** the body (entry-controlled); `do-while` tests **after** (exit-controlled), so its body always runs at least once.\n\n```c\nint i = 10;\nwhile (i < 5) { printf(\"A\"); i++; }      /* prints nothing */\n\nint j = 10;\ndo { printf(\"B\"); j++; } while (j < 5);  /* prints B once */\n```\n\n**Output:** `B`\n\nNote the semicolon after `while (...)` in the `do-while` form — omitting it is a compile error.",
    marks: 5,
  },

  /* ── Programming in C · Unit 4 ──────────────────────────── */
  {
    target: "c-u4-recursion",
    prompt:
      "What is the output?\n\n```c\nvoid f(int n) {\n  if (n == 0) return;\n  printf(\"%d \", n);\n  f(n - 1);\n  printf(\"%d \", n);\n}\n/* called as f(3); */\n```",
    answer:
      "**Output:** `3 2 1 1 2 3`\n\nThe first `printf` runs on the way **down** the recursion, the second on the way **back up** as each call returns:\n\n```\nf(3): print 3 → f(2): print 2 → f(1): print 1 → f(0) returns\n      ← print 1 ← print 2 ← print 3\n```\n\nThis shows that statements after a recursive call execute in reverse order — the basis of printing a list backwards with recursion.",
    marks: 5,
  },
  {
    target: "c-u4-recursion",
    prompt: "Write a recursive function to compute the factorial of `n`, and trace `factorial(4)`.",
    answer:
      "```c\nint factorial(int n) {\n    if (n == 0 || n == 1)          /* base case */\n        return 1;\n    return n * factorial(n - 1);   /* recursive case */\n}\n```\n\n**Trace of `factorial(4)`:**\n\n```\nfactorial(4) = 4 * factorial(3)\nfactorial(3) = 3 * factorial(2)\nfactorial(2) = 2 * factorial(1)\nfactorial(1) = 1               ← base case\n             = 2 * 1 = 2\n             = 3 * 2 = 6\n             = 4 * 6 = 24\n```\n\n**Answer:** `24`, reached in 4 calls.\n\nAlways state the base case explicitly — without it the recursion never terminates and the stack overflows.",
    marks: 5,
  },
  {
    target: "c-u4-storage",
    prompt:
      "What is the output, and which storage class explains it?\n\n```c\nvoid f(void) {\n  static int c = 0;\n  c++;\n  printf(\"%d \", c);\n}\n/* f(); f(); f(); */\n```",
    answer:
      "**Output:** `1 2 3`\n\nA `static` local is initialised **once**, lives for the whole program (in the data segment, not on the stack), and keeps its value between calls — though its *scope* is still only the function.\n\nHad `c` been `auto` (the default for locals), it would be recreated and reset to `0` on every call, printing `1 1 1`.",
    marks: 5,
  },
  {
    target: "c-u4-storage",
    prompt:
      "Compare the four storage classes in C — `auto`, `register`, `static` and `extern` — on storage, default value, scope and lifetime.",
    answer:
      "| Class | Stored in | Default | Scope | Lifetime |\n|---|---|---|---|---|\n| `auto` | Stack | Garbage | The block | Until the block exits |\n| `register` | CPU register if one is free | Garbage | The block | Until the block exits |\n| `static` | Data segment | `0` | The block, or the file if global | Whole program |\n| `extern` | Data segment | `0` | Whole program | Whole program |\n\n**Points examiners look for:** `auto` is the default for locals; you cannot take the address of a `register` variable with `&`; `static` at file level restricts a name to that file; `extern` declares something defined elsewhere, it does not allocate.",
    marks: 10,
  },
  {
    target: "c-u4-intro",
    prompt:
      "Explain call by value and call by reference in C, and show why this swap fails:\n\n```c\nvoid swap(int a, int b) { int t = a; a = b; b = t; }\n```",
    answer:
      "**Call by value** passes a *copy*. The function above exchanges its own local copies; the caller's variables are untouched, so nothing appears to happen.\n\nC only ever passes by value — \"call by reference\" is simulated by passing an address:\n\n```c\nvoid swap(int *a, int *b) {\n    int t = *a;\n    *a = *b;\n    *b = t;\n}\n/* called as swap(&x, &y); */\n```\n\nNow the value being copied is an *address*, and dereferencing it reaches the caller's variables.\n\n**The sentence to write in an exam:** C is strictly call by value; passing pointers gives the effect of call by reference.",
    marks: 5,
  },
];
