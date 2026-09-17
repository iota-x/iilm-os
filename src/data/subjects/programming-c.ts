import type { SeedSubject } from "../types";

export const programmingC: SeedSubject = {
  slug: "programming-in-c",
  name: "Programming in C",
  shortName: "C",
  code: "CSE26108",
  credits: 3,
  ltpc: "3-0-0-3",
  color: "blue",
  status: "complete",
  teacher: "Dr. Sapna Arora",
  labTeacher: "Dr. Sapna Arora",
  hasLab: true,
  labTitle: "Programming in C Lab",
  labCode: null,
  labLtpc: "0-0-2-1",
  overview:
    "Fundamentals of computer programming using C. Starts from computer basics, algorithms and structured problem solving, then C syntax and semantics — variables, operators, I/O, control structures, functions, arrays, strings, pointers, user-defined data types, dynamic memory allocation and file handling.",
  midsemScope:
    "Units 1, 2, 3 & 4 — computer fundamentals and problem solving, C basics, input/output and program control, and functions.",
  midsemConfirmed: true,
  objectives: [
    "Build a foundation in computer organisation, problem solving and algorithm design.",
    "Write, compile, debug and trace structured C programs.",
    "Use control structures, functions, arrays, strings and pointers effectively.",
    "Manage memory with dynamic allocation and persist data with file handling.",
  ],
  outcomes: [
    {
      code: "CO1",
      text: "Understand the fundamental constructs of the C programming language required for structured program development.",
      bloom: "K2 — Understanding",
    },
    {
      code: "CO2",
      text: "Develop C programs using input-output operations, control statements, functions, arrays and strings.",
      bloom: "K3 — Applying",
    },
    {
      code: "CO3",
      text: "Analyse and implement C programs using pointers, dynamic memory allocation, and user-defined data types for efficient memory and data management.",
      bloom: "K4 — Analysing",
    },
    {
      code: "CO4",
      text: "Develop C programs that perform file operations for storing and retrieving data.",
      bloom: "K3 — Applying",
    },
  ],
  units: [
    {
      number: 1,
      title: "Computer Fundamentals and Problem Solving",
      sessions: 4,
      co: "CO1",
      assessment: "Quiz 1 (online)",
      inMidsem: true,
      topics: [
        {
          code: "c-u1-anatomy",
          session: "S1",
          title:
            "Introduction to computers, classification, anatomy of a computer, memory hierarchy, introduction to OS, operational overview of a CPU",
          weight: 3,
          inMidsem: true,
          outcome:
            "Draw the memory hierarchy, name each level's speed/cost trade-off, and describe the fetch-decode-execute cycle.",
        },
        {
          code: "c-u1-langs",
          session: "S2",
          title:
            "Program fundamentals: generation and classification of programming languages, compiling, interpreting, loading, linking",
          weight: 4,
          inMidsem: true,
          outcome:
            "Explain the full compile → assemble → link → load pipeline and the difference between a compiler and an interpreter.",
        },
        {
          code: "c-u1-algorithms",
          session: "S3",
          title:
            "Developing a program, software development. Algorithms: definitions and ways of stating them (step-form, pseudo-code, flowchart)",
          weight: 5,
          inMidsem: true,
          outcome:
            "Write the same algorithm three ways and draw a correct flowchart with the standard symbols.",
        },
        {
          code: "c-u1-structured",
          session: "S4",
          title: "Strategy for designing algorithms, structured programming concept",
          weight: 3,
          inMidsem: true,
          outcome:
            "State the three structured-programming constructs and why goto is discouraged.",
        },
      ],
    },
    {
      number: 2,
      title: "Fundamentals of C Programming",
      sessions: 5,
      co: "CO1",
      assessment: "Quiz 1 (online)",
      inMidsem: true,
      topics: [
        {
          code: "c-u2-overview",
          session: "S1",
          title:
            "Basics of C: overview, developing programs in C, parts of a simple C program, structure of a C program, comments",
          weight: 3,
          inMidsem: true,
          outcome: "Label every section of a C source file and explain what main() returns.",
        },
        {
          code: "c-u2-tokens",
          session: "S2",
          title: "Program statements, C tokens, keywords, identifiers",
          weight: 4,
          inMidsem: true,
          outcome:
            "Classify any piece of C source into its six token types; state the identifier naming rules.",
        },
        {
          code: "c-u2-datatypes",
          session: "S3",
          title: "Data types, variables, constants, operators and expressions",
          weight: 5,
          inMidsem: true,
          outcome:
            "Recall sizes and ranges of each type, and use every operator category correctly.",
        },
        {
          code: "c-u2-precedence",
          session: "S4",
          title: "Expression evaluation — precedence and associativity, type conversions",
          weight: 5,
          inMidsem: true,
          outcome:
            "Predict the output of a gnarly mixed expression with ++, --, / and implicit promotion.",
        },
        {
          code: "c-u2-review",
          session: "S5",
          title: "Review of Unit 2 through programs",
          weight: 2,
          inMidsem: true,
          outcome: "Consolidation session — bring your own broken programs.",
        },
      ],
    },
    {
      number: 3,
      title: "Input, Output and Program Control",
      sessions: 6,
      co: "CO2",
      assessment: "Class Test 1 (offline)",
      inMidsem: true,
      topics: [
        {
          code: "c-u3-io",
          session: "S1",
          title: "Formatted and non-formatted input/output functions, escape sequences",
          weight: 5,
          inMidsem: true,
          outcome:
            "Use printf/scanf format specifiers and width/precision correctly; know why scanf(\"%d\") leaves the newline behind.",
        },
        {
          code: "c-u3-if",
          session: "S2",
          title: "if, if-else",
          weight: 4,
          inMidsem: true,
          outcome: "Write correct branching and spot the classic `=` vs `==` bug.",
        },
        {
          code: "c-u3-nested",
          session: "S3",
          title: "Nested if, nested if-else, conditional operator",
          weight: 5,
          inMidsem: true,
          outcome:
            "Resolve dangling-else correctly and rewrite an if-else chain as a ternary.",
        },
        {
          code: "c-u3-switch",
          session: "S4",
          title: "Comma operator, switch statement",
          weight: 5,
          inMidsem: true,
          outcome:
            "Write a menu-driven switch and explain fall-through when break is omitted.",
        },
        {
          code: "c-u3-while",
          session: "S5",
          title: "while, do-while",
          weight: 5,
          inMidsem: true,
          outcome: "State the one real difference between while and do-while and trace both.",
        },
        {
          code: "c-u3-for",
          session: "S6",
          title: "for loop, break, continue, goto, return, exit",
          weight: 5,
          inMidsem: true,
          outcome:
            "Trace nested loops on paper and predict output when break/continue are hit.",
        },
      ],
    },
    {
      number: 4,
      title: "Functions",
      sessions: 6,
      co: "CO2",
      assessment: "Class Test 1 (offline) — before mid-sem",
      inMidsem: true,
      topics: [
        {
          code: "c-u4-intro",
          session: "S1",
          title: "Introduction to functions, types of functions, passing parameters to functions",
          weight: 5,
          inMidsem: true,
          outcome:
            "Write declaration, definition and call correctly; classify the four function types by args/return.",
        },
        {
          code: "c-u4-recursion",
          session: "S2",
          title: "Call by value, recursive functions",
          weight: 5,
          inMidsem: true,
          outcome:
            "Trace a recursion stack by hand (factorial, fibonacci, tower of hanoi) and state the base case.",
        },
        {
          code: "c-u4-storage",
          session: "S3",
          title: "Storage classes",
          weight: 5,
          inMidsem: true,
          outcome:
            "Fill in the auto/register/static/extern table: scope, lifetime, default value, storage location.",
        },
        {
          code: "c-u4-programs",
          session: "S4",
          title: "Implementation of programs based on previous units through functions",
          weight: 3,
          inMidsem: true,
          outcome: "Refactor earlier programs into functions.",
        },
        {
          code: "c-u4-test",
          session: "S5",
          title: "Class Test 1",
          weight: 1,
          inMidsem: true,
          outcome: "10 marks, covers Units 3 & 4.",
        },
        {
          code: "c-u4-revision",
          session: "S6",
          title: "Revision of all units",
          weight: 1,
          inMidsem: true,
          outcome: "Pre-mid-sem revision session.",
        },
      ],
    },
    {
      number: 5,
      title: "Arrays and Strings",
      sessions: 6,
      co: "CO2",
      assessment: "Class Test 2 (offline)",
      inMidsem: false,
      topics: [
        {
          code: "c-u5-arrays",
          session: "S1",
          title:
            "Array notation and representation, declaration, initialisation, manipulating array elements",
          weight: 5,
          inMidsem: false,
          outcome: "Declare, initialise and traverse; know why there's no bounds checking.",
        },
        {
          code: "c-u5-multidim",
          session: "S2",
          title: "Multi-dimensional arrays",
          weight: 5,
          inMidsem: false,
          outcome: "Work with 2D arrays and row-major memory layout.",
        },
        {
          code: "c-u5-funcarrays",
          session: "S3",
          title: "Functions with arrays",
          weight: 4,
          inMidsem: false,
          outcome: "Pass and return arrays via pointers.",
        },
        {
          code: "c-u5-passing",
          session: "S4",
          title: "Passing arrays to functions",
          weight: 4,
          inMidsem: false,
          outcome: "Understand array-to-pointer decay and why sizeof breaks inside a function.",
        },
        {
          code: "c-u5-chararrays",
          session: "S5",
          title: "Character arrays",
          weight: 4,
          inMidsem: false,
          outcome: "Handle the null terminator correctly.",
        },
        {
          code: "c-u5-strings",
          session: "S6",
          title: "Strings",
          weight: 5,
          inMidsem: false,
          outcome: "Use and hand-implement strlen, strcpy, strcat, strcmp.",
        },
      ],
    },
    {
      number: 6,
      title: "Pointers and Dynamic Memory Allocation",
      sessions: 6,
      co: "CO3",
      assessment: "Class Test 2 (offline)",
      inMidsem: false,
      topics: [
        {
          code: "c-u6-pointers",
          session: "S1",
          title: "Pointer declarations, pointer arithmetic",
          weight: 5,
          inMidsem: false,
          outcome: "Read any declaration right-to-left; know what p+1 adds.",
        },
        {
          code: "c-u6-passing",
          session: "S2",
          title: "Passing pointers to functions, pointer arrays",
          weight: 5,
          inMidsem: false,
          outcome: "Write a working swap() and explain why call-by-value can't do it.",
        },
        {
          code: "c-u6-arraysptr",
          session: "S3",
          title: "Arrays of pointers",
          weight: 4,
          inMidsem: false,
          outcome: "Distinguish char *a[] from char (*a)[].",
        },
        {
          code: "c-u6-dma",
          session: "S4",
          title: "Dynamic memory allocation, call by reference",
          weight: 5,
          inMidsem: false,
          outcome: "Use malloc/calloc/realloc/free and state the difference between each.",
        },
        {
          code: "c-u6-practice",
          session: "S5",
          title: "Programming practice",
          weight: 2,
          inMidsem: false,
          outcome: "Consolidation.",
        },
        {
          code: "c-u6-test",
          session: "S6",
          title: "Class Test 2",
          weight: 1,
          inMidsem: false,
          outcome: "10 marks, covers Units 5 & 6.",
        },
      ],
    },
    {
      number: 7,
      title: "User-defined Data Types",
      sessions: 6,
      co: "CO3",
      assessment: "Quiz 2 (online)",
      inMidsem: false,
      topics: [
        {
          code: "c-u7-structs",
          session: "S1",
          title:
            "Structures: declaration, members, initialisation, accessing members, array of structures",
          weight: 5,
          inMidsem: false,
          outcome: "Define and use structs, including arrays of structs and dot/arrow access.",
        },
        {
          code: "c-u7-structprog",
          session: "S2",
          title: "Implementation through programs",
          weight: 2,
          inMidsem: false,
          outcome: "Practice session.",
        },
        {
          code: "c-u7-unions",
          session: "S3",
          title:
            "Unions: declaration, members, initialisation, accessing, array of unions, structures vs unions",
          weight: 5,
          inMidsem: false,
          outcome: "State the memory difference between struct and union with sizes.",
        },
        {
          code: "c-u7-unionprog",
          session: "S4",
          title: "Implementation through programs",
          weight: 2,
          inMidsem: false,
          outcome: "Practice session.",
        },
        {
          code: "c-u7-enum",
          session: "S5",
          title: "Enumeration types",
          weight: 3,
          inMidsem: false,
          outcome: "Declare enums and know their default integer values.",
        },
        {
          code: "c-u7-revision",
          session: "S6",
          title: "Revision of structure, union and enum",
          weight: 1,
          inMidsem: false,
          outcome: "Consolidation.",
        },
      ],
    },
    {
      number: 8,
      title: "File Handling",
      sessions: 6,
      co: "CO4",
      assessment: "Quiz 2 (online)",
      inMidsem: false,
      topics: [
        {
          code: "c-u8-intro",
          session: "S1",
          title: "Files: introduction, using files in C",
          weight: 4,
          inMidsem: false,
          outcome: "Open, read, write and close with the right modes.",
        },
        {
          code: "c-u8-textbinary",
          session: "S2",
          title: "Working with text files, working with binary files",
          weight: 5,
          inMidsem: false,
          outcome: "Choose between fprintf/fscanf and fread/fwrite correctly.",
        },
        {
          code: "c-u8-records",
          session: "S3",
          title: "Files of records, random access to files of records",
          weight: 5,
          inMidsem: false,
          outcome: "Use fseek, ftell and rewind to jump around a record file.",
        },
        {
          code: "c-u8-mgmt",
          session: "S4",
          title: "Other file management functions",
          weight: 3,
          inMidsem: false,
          outcome: "remove, rename, feof, ferror.",
        },
        {
          code: "c-u8-review",
          session: "S5",
          title: "Review of file management through programs",
          weight: 2,
          inMidsem: false,
          outcome: "Practice session.",
        },
        {
          code: "c-u8-quiz",
          session: "S6",
          title: "Revision and Quiz 2",
          weight: 1,
          inMidsem: false,
          outcome: "5 marks, covers Units 7 & 8.",
        },
      ],
    },
  ],
  experiments: [],
  components: [
    {
      name: "Quiz 1 (online)",
      marks: 5,
      weightage: 5,
      scope: "Units 1 & 2",
      timing: "After Unit 2",
      co: "CO1",
      track: "theory",
    },
    {
      name: "Class Test 1",
      marks: 10,
      weightage: 10,
      scope: "Units 3 & 4",
      timing: "After Unit 4, before mid-sem",
      co: "CO2",
      track: "theory",
    },
    {
      name: "Mid-Term Examination",
      marks: 20,
      weightage: 20,
      scope: "Units 1, 2, 3 & 4",
      timing: "After Unit 4 — 5–11 Oct",
      co: "CO1, CO2",
      track: "theory",
    },
    {
      name: "Class Test 2",
      marks: 10,
      weightage: 10,
      scope: "Units 5 & 6",
      timing: "After Unit 6",
      co: "CO2, CO3",
      track: "theory",
    },
    {
      name: "Quiz 2 (online)",
      marks: 5,
      weightage: 5,
      scope: "Units 7 & 8",
      timing: "After Unit 8",
      co: "CO3, CO4",
      track: "theory",
    },
    {
      name: "End-Term Examination",
      marks: 100,
      weightage: 50,
      scope: "Entire syllabus, Units 1–8",
      timing: "End-Term",
      co: "CO1–CO4",
      track: "theory",
    },
  ],
  strategies: [
    {
      title: "You already program. That is both your edge and your trap.",
      body: `Three years of JS/PHP means loops, functions and conditionals are free marks for you. Do not spend study hours re-learning what a for loop is.

The trap is that C exams are not "can you build the thing". They are:
1. **Predict the output** of a deliberately confusing snippet.
2. **Find the error** in a given program.
3. **Write a program on paper** with correct syntax and no compiler to catch you.
4. **Explain a concept** in words — storage classes, compiler vs interpreter, call by value vs reference.

Your existing skill helps with (3) only. Categories 1, 2 and 4 are where marks are lost, and they need deliberate practice, not more building.`,
    },
    {
      title: "Unit 1 is the one you'll be tempted to skip, and it's the easiest marks",
      body: `Computer fundamentals, memory hierarchy, compiling vs interpreting vs loading vs linking, algorithms, flowcharts, structured programming. Four sessions of pure theory — no problem-solving, nothing to debug.

It's roughly a quarter of the mid-sem syllabus by unit count and it's all recall. One focused evening gets you most of it. Every mark here is a mark you don't have to fight for on the pointer questions later.

Flowchart symbols specifically: know oval (start/stop), parallelogram (I/O), rectangle (process), diamond (decision), and the arrow conventions. That's a guaranteed question.`,
    },
    {
      title: "Precedence and associativity is the highest-yield hour you'll spend",
      body: `Unit 2, Session 4. Expression evaluation shows up in *every* output-prediction question for the rest of the course.

Specifically drill:
• post vs pre increment inside a larger expression — \`i++ + ++i\`
• integer division truncation — \`5/2\` is 2, \`5/2.0\` is 2.5
• implicit type promotion in mixed expressions
• the fact that \`a && b\` short-circuits and won't evaluate \`b\`

Write ten of these, work them out on paper, then run them and see where you were wrong. The gap between your answer and the compiler's is exactly what the examiner is testing.`,
    },
    {
      title: "Storage classes is a table. Learn it as a table.",
      body: `Four rows — auto, register, static, extern. Four columns — scope, lifetime, default initial value, where it's stored.

Draw that 4×4 grid from memory until you can do it in 60 seconds. It is an almost-certain mid-sem question, it's worth full marks if you reproduce the table, and it takes an hour to nail permanently.

The one that catches people: \`static\` inside a function keeps its value between calls but is still local in scope. And uninitialised \`auto\` is garbage while uninitialised \`static\` is zero.`,
    },
    {
      title: "Trace recursion on paper, with a real stack drawing",
      body: `Unit 4, Session 2. Recursion questions in mid-sems are almost always "what does this print" rather than "write a recursive function".

The method that works: draw a box per call, write the parameter value in it, draw an arrow down for the call and up for the return with the returned value written on it. Do this for factorial(4), fib(5), and a Tower of Hanoi with 3 discs. Once you've drawn three of them by hand the pattern sticks.

Then do the nasty variant — a recursive function where the printf is *after* the recursive call, so the output comes out reversed. That's the classic trick question.`,
    },
    {
      title: "Two lab slots a week — Tuesday and Wednesday",
      body: `As Group 2 you have Programming in C Lab on Tuesday 11:10–13:20 (Lab 12-A-12) and again Wednesday 14:00–16:10 (Lab 12-A-12). That's over four hours of supervised coding a week.

Use them. Write the programs during lab, not after — you get the teacher in the room when something doesn't compile, and the lab file stays current instead of becoming a 20-program backlog in December.

Practical tip: write your C on your Mac with \`gcc\` (or \`clang\`, already installed) in a terminal, not an IDE. The exam will ask you about compilation stages, and actually running \`gcc -E\`, \`gcc -S\`, \`gcc -c\` once makes preprocessing/compiling/assembling/linking concrete instead of abstract.`,
    },
  ],
  textbooks: [
    {
      title: "The C Programming Language (2nd ed.)",
      author: "Brian W. Kernighan and Dennis M. Ritchie, Prentice Hall, 1988",
      note: "K&R. Short, dense, definitive. Best for correctness, not for exam-style padding.",
    },
    {
      title: "Let Us C (20th ed.)",
      author: "Yashavant Kanetkar, BPB Publications, 2024",
      note: "This is the one your exam questions will look like. Do its chapter exercises.",
    },
  ],
  references: [
    {
      title: "Computer Concepts and Programming in C",
      author: "E. Balagurusamy, McGraw Hill Education",
    },
    {
      title: "Computer Concepts and Programming in C",
      author: "R. S. Salaria, Khanna Book Publishing",
    },
  ],
  localFiles: ["C/lec_Course Plan_Programming in C.pdf"],
  gaps: ["Programming in C Lab course plan / experiment list is not in your folder yet."],
};
