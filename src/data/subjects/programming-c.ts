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
  labCode: "CSE26108P",
  labLtpc: "0-0-4-2",
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
  experiments: [
    {
      number: 1,
      title: "Computer Familiarization and C Programming Environment",
      co: "CO1",
      objective:
        "Familiarise yourself with the C programming environment, the program execution cycle, and basic program structure.",
      tasks: [
        "Think — read the given Hello World and name the header file, the main function, the output statement and the special symbols; predict the output before running it.",
        "Explore — compile and run it in the IDE, read the compilation messages, and say what Compile, Build, Run and Debug each actually do.",
        "Develop — print your name, your address, your college details, then all of it together using formatted output.",
        "Debug — the faculty hand out five programs with syntax errors; find and fix every one before it will compile.",
        "Challenge — a welcome screen for IILM University showing university name, department, student name, course and current semester, properly formatted.",
      ],
      inMidsem: true,
    },
    {
      number: 2,
      title: "Algorithms, Flowcharts and Basic Program Development",
      co: "CO1",
      objective:
        "Understand algorithmic thinking before writing C programs.",
      tasks: [
        "Think — write algorithms for adding two numbers, finding the larger of two, and the area of a rectangle.",
        "Design — draw flowcharts for the largest of three numbers, simple interest, and temperature conversion.",
        "Develop — turn each of those algorithms into a working C program.",
        "Improve — extend the temperature converter so the user chooses Celsius to Fahrenheit or Fahrenheit to Celsius.",
        "Challenge — invent your own real-life problem, write its algorithm, draw its flowchart, and implement it.",
      ],
      inMidsem: true,
    },
    {
      number: 3,
      title: "Variables, Data Types and Input/Output Operations",
      co: "CO1",
      objective:
        "Understand variables, constants, data types, and formatted input and output.",
      tasks: [
        "Think — predict the output of programs involving integer overflow, character variables, float variables and type conversion.",
        "Develop — read and display an int, a float, a char and a double.",
        "Improve — swap two numbers three ways: with a third variable, without one, and using arithmetic operators.",
        "Analyze — compare what %d, %f, %lf, %c and %s produce, and explain why they differ.",
        "Challenge — a student information program taking name, roll number, branch, semester and CGPA, printed with proper formatting.",
      ],
      inMidsem: true,
    },
    {
      number: 4,
      title: "Operators and Expressions",
      co: "CO1",
      objective:
        "Understand the different operators and how expressions are evaluated.",
      tasks: [
        "Think — predict the output of expressions using arithmetic, relational, logical and increment/decrement operators.",
        "Develop — demonstrate arithmetic, relational and logical operations.",
        "Improve — add modulus, increment and decrement to the calculator.",
        "Analyze — evaluate expressions involving precedence and associativity, working every step by hand before you run it.",
        "Challenge — a scientific calculator covering addition, subtraction, multiplication, division and modulus.",
      ],
      inMidsem: true,
    },
    {
      number: 5,
      title: "Decision Making using if-else Statements",
      co: "CO1",
      objective:
        "Develop logical decision-making skills using conditional statements.",
      tasks: [
        "Think — predict the output of five if-else programs without executing them.",
        "Develop — check positive/negative/zero, even/odd, and the largest of three numbers.",
        "Improve — classify a number as positive even, positive odd, negative even, negative odd, or zero.",
        "Analyze — a grading system showing grade, pass/fail and distinction, using nested if-else.",
        "Challenge — one real application of your choice: loan eligibility, voting eligibility, movie ticket pricing or scholarship eligibility.",
      ],
      inMidsem: true,
    },
    {
      number: 6,
      title: "switch Statement and the Conditional Operator",
      co: "CO1",
      objective:
        "Solve multi-way decision problems efficiently.",
      tasks: [
        "Think — predict the output of programs using switch, break, default and the conditional operator.",
        "Develop — a menu-driven calculator built on switch.",
        "Improve — extend it with square, cube, modulus and power.",
        "Analyze — compare nested if-else against switch and say when each is preferable.",
        "Challenge — a menu-driven ATM, restaurant ordering or library menu using switch.",
      ],
      inMidsem: true,
    },
    {
      number: 7,
      title: "Looping Statements (Basic)",
      co: "CO1",
      objective:
        "Understand repetitive execution using loops.",
      tasks: [
        "Think — predict the output of programs using while, do-while and for.",
        "Develop — print the first N natural numbers, the even numbers, the odd numbers, and count backwards.",
        "Improve — generate the multiplication table for any number the user enters.",
        "Analyze — compare what while, do-while and for produce for the same task, and explain the differences.",
        "Challenge — print multiplication tables from 1 to N, formatted as a table.",
      ],
      inMidsem: true,
    },
    {
      number: 8,
      title: "Advanced Loop Programming",
      co: "CO1",
      objective:
        "Solve computational problems using iterative statements.",
      tasks: [
        "Think — trace the loops by hand for factorial, Fibonacci and prime checking.",
        "Develop — factorial, the Fibonacci series, and the sum of digits.",
        "Improve — test for prime, Armstrong and palindrome numbers.",
        "Analyze — compare the time different loop constructs take on the same problem.",
        "Challenge — a menu-driven Number Analyzer checking prime, Armstrong, palindrome, perfect number and factorial.",
      ],
      inMidsem: true,
    },
    {
      number: 9,
      title: "Pattern Programming using Nested Loops",
      co: "CO1",
      objective:
        "Sharpen logical thinking through nested loop programming.",
      tasks: [
        "Think — predict the output of several nested loop programs.",
        "Develop — print a half pyramid, an inverted pyramid and a number pyramid.",
        "Improve — Floyd's triangle and Pascal's triangle.",
        "Analyze — turn one pattern into another by changing only the loop conditions.",
        "Challenge — design your own pattern from stars, numbers or letters and explain the logic behind it.",
      ],
      inMidsem: true,
    },
    {
      number: 10,
      title: "User-Defined Functions",
      co: "CO2",
      objective:
        "Understand modular programming using functions.",
      tasks: [
        "Think — predict the output of programs using function calls, return statements, and local versus global variables.",
        "Develop — write all four forms: no arguments and no return, arguments and no return, no arguments with a return, arguments with a return.",
        "Improve — rebuild the menu-driven calculator out of user-defined functions.",
        "Analyze — split a monolithic program into functions and compare readability and reusability.",
        "Challenge — a Student Result Management System with separate functions for reading details, totalling marks, calculating percentage, assigning grades and displaying the result.",
      ],
      inMidsem: true,
    },
    {
      number: 11,
      title: "Recursive Functions",
      co: "CO2",
      objective:
        "Understand recursion and compare it with iterative programming.",
      tasks: [
        "Think — trace recursive factorial, Fibonacci and sum-of-first-N, drawing the function call stack for each.",
        "Develop — recursive factorial, Fibonacci series, and power of a number.",
        "Improve — recursive GCD of two numbers, and reversing a number's digits.",
        "Analyze — implement factorial both recursively and iteratively, then compare length, readability, number of calls and efficiency.",
        "Challenge — a recursive menu-driven application solving several mathematical problems.",
      ],
      inMidsem: true,
    },
    {
      number: 12,
      title: "One-Dimensional Arrays",
      co: "CO2",
      objective:
        "Understand array representation and manipulation.",
      tasks: [
        "Think — trace the contents of an array after each iteration of a given program.",
        "Develop — read an array, display it, find its sum and average, and its largest and smallest elements.",
        "Improve — reverse an array, count even and odd elements, count positives and negatives.",
        "Analyze — solve the same problem with individual variables and then with an array, and compare.",
        "Challenge — a Student Marks Analyzer reporting highest, lowest, average and pass percentage.",
      ],
      inMidsem: false,
    },
    {
      number: 13,
      title: "Two-Dimensional Arrays (Matrices)",
      co: "CO2",
      objective:
        "Perform operations on matrices.",
      tasks: [
        "Think — predict the output of programs that traverse a matrix.",
        "Develop — read a matrix, display it, and add and subtract two matrices.",
        "Improve — matrix multiplication and transpose.",
        "Analyze — find the row sums, column sums, principal diagonal sum and secondary diagonal sum.",
        "Challenge — a Matrix Calculator offering several matrix operations from a menu.",
      ],
      inMidsem: false,
    },
    {
      number: 14,
      title: "Searching and Sorting",
      co: "CO2",
      objective:
        "Understand searching and sorting techniques.",
      tasks: [
        "Think — trace every iteration of linear search, binary search and bubble sort.",
        "Develop — implement linear search and binary search.",
        "Improve — implement bubble sort and selection sort.",
        "Analyze — compare the number of comparisons, the number of swaps, and where each algorithm is the right choice.",
        "Challenge — a Student Record Search System that both searches and sorts marks.",
      ],
      inMidsem: false,
    },
    {
      number: 15,
      title: "Character Arrays and Basic String Operations",
      co: "CO2",
      objective:
        "Understand strings and character manipulation.",
      tasks: [
        "Think — predict the output of string programs built on character arrays.",
        "Develop — find a string's length without a library function, copy one string into another, and reverse a string.",
        "Improve — check whether a string is a palindrome, and count vowels, consonants, digits and spaces.",
        "Analyze — compare your own string functions against the library ones.",
        "Challenge — a Text Analyzer reporting word count, vowels, consonants, digits and special characters.",
      ],
      inMidsem: false,
    },
    {
      number: 16,
      title: "Advanced String Processing",
      co: "CO2",
      objective:
        "Perform advanced string manipulation.",
      tasks: [
        "Think — predict the output of programs combining several string operations.",
        "Develop — concatenate, compare and copy strings without using library functions.",
        "Improve — strip spaces, and convert between lower and upper case both ways.",
        "Analyze — compare the library functions with your own implementations.",
        "Challenge — a Password Validator scoring strength on length, uppercase, lowercase, digits and special characters.",
      ],
      inMidsem: false,
    },
    {
      number: 17,
      title: "Introduction to Pointers",
      co: "CO2",
      objective:
        "Understand pointers and memory addressing.",
      tasks: [
        "Think — draw memory diagrams of variables and pointers, and predict the output of pointer programs.",
        "Develop — declare pointers, display addresses, and read values through them.",
        "Improve — swap two numbers with pointers, then try pointer arithmetic and pointer comparison.",
        "Analyze — compare passing a variable directly against passing it through a pointer.",
        "Challenge — a Number Analyzer using pointers for largest, smallest, sum and average.",
      ],
      inMidsem: false,
    },
    {
      number: 18,
      title: "Arrays, Functions and Pointers",
      co: "CO2",
      objective:
        "Understand how arrays, functions and pointers relate to one another.",
      tasks: [
        "Think — predict the output of programs mixing arrays, pointer arithmetic and function parameters.",
        "Develop — walk an array with pointers, and access a string through a pointer.",
        "Improve — write pointer-based functions for maximum, minimum and average.",
        "Analyze — compare array notation with pointer notation and explain where they are the same and where they differ.",
        "Challenge — an Array Processing Toolkit doing searching, sorting and statistics through pointers.",
      ],
      inMidsem: false,
    },
    {
      number: 19,
      title: "Dynamic Memory Allocation",
      co: "CO3",
      objective:
        "Understand memory allocated at runtime.",
      tasks: [
        "Think — predict how malloc(), calloc(), realloc() and free() behave.",
        "Develop — demonstrate malloc() and calloc().",
        "Improve — rework those using realloc() and free(), explaining what changes in memory.",
        "Analyze — compare static and dynamic allocation with worked examples.",
        "Challenge — a Dynamic Student Marks System where the number of students is decided at runtime.",
      ],
      inMidsem: false,
    },
    {
      number: 20,
      title: "Integrated Programming using Functions, Arrays and Pointers",
      co: "CO2, CO3",
      objective:
        "Bring several programming concepts together on one real-world problem.",
      tasks: [
        "Think — work out what a simple Student Management System needs: which functions, which arrays, where pointers help.",
        "Develop — separate functions for reading records, displaying them, and calculating total and average marks.",
        "Improve — use pointers and arrays to make it more modular and more efficient.",
        "Analyze — run it against different datasets, find the logical errors, and improve readability through documentation and function decomposition.",
        "Challenge — a Student Performance Analyzer for N students: total, percentage, highest, lowest and average marks, grade distribution, class topper, in a formatted tabular report.",
      ],
      inMidsem: false,
    },
    {
      number: 21,
      title: "Structures",
      co: "CO2",
      objective:
        "Organise and manipulate related data using structures.",
      tasks: [
        "Think — take a real entity (student, employee, book, product) and decide what its structure members should be.",
        "Develop — define a Student structure, read and display its details, then do the same for Employee records.",
        "Improve — store many students in an array of structures, find the topper by marks, and list everyone above a given percentage.",
        "Analyze — compare holding student information in individual variables, in arrays, and in structures, and say what structures buy you.",
        "Challenge — a Student Information Management System that adds a student, displays all students, searches for one, and reports class statistics.",
      ],
      inMidsem: false,
    },
    {
      number: 22,
      title: "Advanced Structures, Unions and Enumeration",
      co: "CO2",
      objective:
        "Understand memory-efficient data representation using structures, unions and enumerations.",
      tasks: [
        "Think — predict the memory a structure and a union each use, and explain why union members share memory.",
        "Develop — nested structures, structures inside arrays, and arrays inside structures.",
        "Improve — demonstrate a union, an enumeration, and menu selection driven by an enum.",
        "Analyze — compare structure against union, and integer constants against an enumeration.",
        "Challenge — a Vehicle Registration System built on structures and enumerations.",
      ],
      inMidsem: false,
    },
    {
      number: 23,
      title: "Introduction to File Handling",
      co: "CO3",
      objective:
        "Understand permanent data storage using files.",
      tasks: [
        "Think — work out why variables lose their values when a program ends, and distinguish RAM from secondary storage, and text files from binary files.",
        "Develop — create a file, write data into it, and read the data back.",
        "Improve — append more records to an existing file and display the whole thing.",
        "Analyze — compare console input/output with file input/output.",
        "Challenge — a Personal Diary application storing daily notes in a text file.",
      ],
      inMidsem: false,
    },
    {
      number: 24,
      title: "File Operations and Record Management",
      co: "CO3",
      objective:
        "Perform advanced file operations.",
      tasks: [
        "Think — predict what programs do under each of the different file opening modes.",
        "Develop — copy one file into another, and count the characters, words and lines in a text file.",
        "Improve — search for a record, update one, and delete one logically.",
        "Analyze — compare sequential file access with random access.",
        "Challenge — a Book Record Management System backed by files.",
      ],
      inMidsem: false,
    },
    {
      number: 25,
      title: "Debugging Techniques",
      co: "CO3",
      objective:
        "Improve your debugging and program correction skills.",
      tasks: [
        "Think — predict the output of five broken programs without executing them.",
        "Debug — fix programs carrying syntax errors, logical errors and runtime errors.",
        "Improve — tighten inefficient programs by cutting unnecessary statements and improving readability.",
        "Analyze — use the IDE debugger: set breakpoints, step through, and watch the variables change.",
        "Challenge — the instructor hands over a faulty application with several errors; find them, classify them, and fix them all.",
      ],
      inMidsem: false,
    },
    {
      number: 26,
      title: "Integrated Programming Practice I",
      co: "CO3",
      objective:
        "Integrate arrays, functions, structures and file handling.",
      tasks: [
        "Think — identify the modules a Student Result Management System needs.",
        "Develop — separate functions for input, calculation and display.",
        "Improve — hold the records in structures.",
        "Analyze — save the records to a file and read them back.",
        "Challenge — a Student Result Processing System that calculates grades, displays toppers, and stores results permanently.",
      ],
      inMidsem: false,
    },
    {
      number: 27,
      title: "Integrated Programming Practice II",
      co: "CO3",
      objective:
        "Solve a real-world application using modular programming.",
      tasks: [
        "Think — identify the modules a Library Management System needs.",
        "Develop — add a book, display the books, and search for one.",
        "Improve — keep the records in files.",
        "Analyze — test it against different datasets.",
        "Challenge — a Library Management System handling book issue, book return, search and availability status.",
      ],
      inMidsem: false,
    },
    {
      number: 28,
      title: "Computational Thinking Challenge",
      co: "CO3",
      objective:
        "Sharpen logical reasoning and algorithmic thinking.",
      tasks: [
        "Think — predict the output of complex programs mixing nested loops, functions, arrays and pointers.",
        "Analyze — pick the most efficient algorithm from several given solutions.",
        "Improve — rewrite long programs as modular ones.",
        "Debug — correct programs with hidden logical mistakes.",
        "Challenge — solve an unseen real-life problem using anything you have learned this semester.",
      ],
      inMidsem: false,
    },
    {
      number: 29,
      title: "Mini Programming Project",
      co: "CO2, CO3",
      objective:
        "Integrate multiple C programming concepts into one complete application.",
      tasks: [
        "Plan — write the problem statement, the algorithm, the flowchart and the modular design.",
        "Develop — build the whole application. Suggested domains: inventory management, employee payroll, hospital registration, banking, course registration.",
        "Improve — add menus, input validation and better output formatting.",
        "Test — work through it systematically with multiple test cases.",
        "Present — demonstrate it and explain the program logic, the functions used, the data structures used, and what gave you trouble.",
      ],
      inMidsem: false,
    },
    {
      number: 30,
      title: "Capstone Programming Challenge and Viva",
      co: "CO1, CO2, CO3",
      objective:
        "Assess the overall programming competence built up across the semester.",
      tasks: [
        "Think — analyse a real-world problem and identify its inputs, outputs, constraints and required modules.",
        "Design — prepare the algorithm, the flowchart and the modular solution design.",
        "Develop — implement the whole solution independently using the appropriate C constructs.",
        "Validate — test with normal, boundary and invalid inputs, then debug and optimise where needed.",
        "Reflect and demonstrate — present the solution in a viva, explaining your logic, your choice of constructs, your debugging process and what you learned.",
      ],
      inMidsem: false,
    },
  ],
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
    {
      name: "Lab Quizzes",
      marks: 50,
      weightage: 50,
      scope: "Ten compulsory quizzes of 5 marks each, across basic concepts and syntax, problem solving, implementation, debugging, and advanced application",
      timing: "Continuous, through the lab sessions",
      co: "CO1, CO2, CO3",
      track: "lab",
    },
    {
      name: "Execution & Viva Voce",
      marks: 50,
      weightage: 50,
      scope: "Five compulsory assessments of 10 marks each — problem solving, implementation and output accuracy, assessed at the machine",
      timing: "Continuous, through the lab sessions",
      co: "CO1, CO2, CO3",
      track: "lab",
    },
  ],
  strategies: [
    {
      title: "The lab is worth as much as the theory paper, and it is all continuous",
      body:
        "Programming in C Lab is a separate 2-credit course with its own code (CSE26108P) and no end-sem paper at all — 50 marks of quizzes across ten compulsory sittings, and 50 marks of execution and viva across five. Miss a session and those marks cannot be made up later. The plan also says the previous experiment's lab file is checked at the end of every lab, so the write-up is due before the next class, not at the end of term.",
    },
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
  localFiles: [
    "C/lec_Course Plan_Programming in C.pdf",
    "C/Lab_Course Plan_Programming in C.pdf",
  ],
  gaps: [],
};
