import type { SeedSubject } from "../types";

export const linux: SeedSubject = {
  slug: "linux-administration",
  name: "Linux Administration Lab",
  shortName: "Linux",
  code: "CSE2107",
  credits: 1,
  ltpc: "0-0-2-1",
  color: "amber",
  status: "complete",
  teacher: null,
  labTeacher: "Dr. Pooja Batra",
  hasLab: true,
  labTitle: "Linux Administration Lab",
  labCode: "CSE2107",
  labLtpc: "0-0-2-1",
  overview:
    "A pure lab course. Install and navigate Linux, use essential commands for file and directory management, handle permissions, archiving, compression, filters, pipes and redirection, manage users and groups, and write shell scripts.",
  midsemScope:
    "Lab courses have no written mid-sem. Assessment is continuous — quizzes and execution/viva during lab hours, with your lab file checked each session.",
  midsemConfirmed: false,
  objectives: [
    "Differentiate Unix variants and install a Linux OS.",
    "Use essential commands for navigation, file manipulation, directory and user management.",
    "Handle archiving, compression, permissions, sorting and text extraction.",
    "Write shell scripts with variables and control statements.",
  ],
  outcomes: [
    {
      code: "CO1",
      text: "Differentiate varieties of Unix, install Linux OS.",
      bloom: "K2 — Understanding",
    },
    {
      code: "CO2",
      text: "Utilise essential Linux commands for system navigation, file manipulation, directory management and user management.",
      bloom: "K3 — Applying",
    },
    {
      code: "CO3",
      text: "Execute tasks related to file archiving, compression, permissions, and other operations like sorting and extracting subparts.",
      bloom: "K3 — Applying",
    },
    { code: "CO4", text: "Prepare shell scripts.", bloom: "K3 — Applying" },
  ],
  units: [],
  experiments: [
    {
      number: 1,
      title: "Installing Linux Operating System",
      co: "CO1",
      objective:
        "Install Linux, and control system startup states. Your folder has 'Installing Linux Using a Virtual Machine.pdf' for this.",
      tasks: [
        "Boot, reboot, and shut down a system normally.",
        "Boot systems into different run levels manually.",
        "Cover the write-up questions: What is UNIX and how does it differ from Linux? Structure of the Linux OS. Steps to install Linux. Internal vs external commands. Absolute vs relative paths. Metacharacters. Five differences between Linux and Windows.",
      ],
      inMidsem: true,
    },
    {
      number: 2,
      title: "Login to OS and monitoring the performance",
      co: "CO1",
      objective: "Log in and inspect running system state.",
      tasks: [
        "top, htop, ps, free, df, du, uptime, vmstat.",
        "Read and explain what each column means.",
      ],
      inMidsem: true,
    },
    {
      number: 3,
      title: "Use single-user mode to gain access to a system",
      co: "CO1",
      objective: "Recover access via single-user / rescue mode.",
      tasks: [
        "Interrupt the bootloader, edit the kernel line, boot to single-user mode.",
        "Reset a forgotten root password from that mode.",
      ],
      inMidsem: true,
    },
    {
      number: 4,
      title: "Explore Linux basic file and directory commands",
      co: "CO2",
      objective: "Full file and directory workflow.",
      tasks: [
        "mkdir, cd, pwd, cat, ls, cp, mv, rm, rmdir, touch.",
        "Work through the 16-step sequence in LinuxLabFile.docx: create a directory of your name, make file1.txt / file2.h / file3.c, create Letters / Programs / Misc, copy by wildcard, rename, move, delete.",
        "Practise wildcards: *, ?, [ ].",
      ],
      inMidsem: true,
    },
    {
      number: 5,
      title: "Diagnose and correct file permission problems",
      co: "CO2",
      objective:
        "Create, delete and modify owner, group and other permissions.",
      tasks: [
        "chmod in both numeric mode (755, 644) and named mode (u+x, go-w).",
        "chown, chgrp, umask.",
        "Explain r/w/x for files versus for directories — they mean different things.",
      ],
      inMidsem: true,
    },
    {
      number: 6,
      title: "Working with filters",
      co: "CO3",
      objective: "Transform text streams.",
      tasks: [
        "grep, sort, uniq, cut, paste, head, tail, tr, wc, sed basics.",
        "Chain filters to answer a question about a data file.",
      ],
      inMidsem: true,
    },
    {
      number: 7,
      title: "Working with pipes and redirection",
      co: "CO3",
      objective: "Compose commands and control their streams.",
      tasks: [
        "|, >, >>, <, 2>, 2>&1, tee, /dev/null.",
        "Explain stdin / stdout / stderr as file descriptors 0, 1, 2.",
      ],
      inMidsem: true,
    },
    {
      number: 8,
      title: "Manage Users and Groups",
      co: "CO3",
      objective: "Administer accounts.",
      tasks: [
        "useradd, userdel, usermod, passwd, groupadd, groups, id.",
        "Inspect /etc/passwd, /etc/shadow, /etc/group and explain each field.",
      ],
      inMidsem: true,
    },
    {
      number: 9,
      title: "What is a shell? Types of shells",
      co: "CO4",
      objective: "Understand the shell as a program.",
      tasks: [
        "sh, bash, csh, ksh, zsh — history and differences.",
        "echo $SHELL, chsh, /etc/shells.",
      ],
      inMidsem: false,
    },
    {
      number: 10,
      title: "Shell programming: shell variables and control statements",
      co: "CO4",
      objective: "Learn the scripting language itself.",
      tasks: [
        "Shebang, variables, quoting, command substitution, $1..$n, $#, $?.",
        "if/elif/else, case, for, while, until, test and [[ ]].",
      ],
      inMidsem: false,
    },
    {
      number: 11,
      title: "Shell script for arithmetic operations on integers and real numbers",
      co: "CO4",
      objective: "Arithmetic in bash.",
      tasks: [
        "Integer arithmetic with $(( )) and expr.",
        "Real-number arithmetic with bc — bash can't do floats natively, that's the whole point of this experiment.",
      ],
      inMidsem: false,
    },
    {
      number: 12,
      title: "Shell script to find the greatest of three numbers",
      co: "CO4",
      objective: "Nested conditionals.",
      tasks: ["Read three numbers, compare with -gt, print the largest."],
      inMidsem: false,
    },
    {
      number: 13,
      title: "Shell script to print the Fibonacci series",
      co: "CO4",
      objective: "Loops with accumulating state.",
      tasks: ["Read n, print the first n Fibonacci numbers using a while or for loop."],
      inMidsem: false,
    },
    {
      number: 14,
      title: "Shell script to print the reverse of a number",
      co: "CO4",
      objective: "Modulo and integer division in a loop.",
      tasks: ["Extract digits with % 10, build the reverse with * 10 + digit."],
      inMidsem: false,
    },
  ],
  components: [
    {
      name: "Lab Quizzes (5 compulsory × 10)",
      marks: 50,
      weightage: 50,
      scope: "Concepts, command syntax, logic, debugging",
      timing: "Continuous",
      co: "CO1–CO4",
      track: "lab",
    },
    {
      name: "Execution & Viva Voce (5 compulsory × 10)",
      marks: 50,
      weightage: 50,
      scope: "Practical execution, implementation, output accuracy",
      timing: "Continuous",
      co: "CO1–CO4",
      track: "lab",
    },
  ],
  strategies: [
    {
      title: "This should be your easiest subject. Treat it as a freebie you don't drop.",
      body: `You use a Mac terminal daily. Roughly 60% of this syllabus — file and directory commands, permissions, pipes, redirection, filters — you already do without thinking about it.

The gap is (a) the theory write-ups, and (b) the four or five things that genuinely differ on Linux: run levels / systemd targets, single-user mode, /etc/passwd and /etc/shadow, useradd, and bash scripting specifics.

Budget one weekend afternoon for the whole of experiments 1–8 and you'll be ahead of the class. Don't budget more than that — the marks here are capped at 100 and there's no written end-sem.`,
    },
    {
      title: "Install a real VM. Don't use macOS terminal as a substitute.",
      body: `macOS is BSD-flavoured, not GNU. Commands behave differently and the exam will assume GNU:
• \`sed -i\` needs an argument on macOS, doesn't on Linux
• \`ls --color\` doesn't exist on macOS
• no \`useradd\`, no \`/etc/shadow\`, no run levels, no \`systemctl\`
• \`grep\`, \`sort\`, \`date\` all take different flags

Your folder already has "Installing Linux Using a Virtual Machine.pdf". Follow it — UTM is the free, native option on Apple Silicon; VirtualBox is the doc's likely choice. Install Ubuntu Server (no desktop, faster, and forces you into the CLI). Snapshot it before you start breaking things in experiment 3.`,
    },
    {
      title: "Your lab file is checked at the start of every session",
      body: `The calculus lab plan spells this out and Linux lab will run the same way: "Lab files of the previous experiment need to be checked at the end of every lab."

So the loop is: do the experiment in the lab on Friday 11:10–13:20, write it up Friday evening while it's fresh, and walk in the next week with it done. Fourteen experiments across the semester is roughly one a week — trivially manageable if you never let it slip, brutal if you let five pile up.

Screenshot every command's output as you go. That's what the write-up needs and re-running everything later to recapture screenshots is the thing that makes people hate lab files.`,
    },
    {
      title: "The lab record has a prescribed format — and it's the same for every lab",
      body: `The practical-file template for CSE2107 (in your linux folder) fixes the format, and the SOPs in it apply to all your labs:

**Layout** — A4 portrait; margins left 1.5", others 1"; Times New Roman throughout; main heading 14 pt bold, section headings 12 pt bold, body 12 pt justified, 1.15 spacing; commands and code in Consolas / Courier New 10–11 pt. Each experiment starts on a new page. Footer on every page except the title: your URN and the course code.

**Each experiment** — title with the CO(s) mapped, numbered procedure / commands, output, then whatever the faculty adds (objective, result).

**Output rules** — screenshots only, taken live in the lab; typed, scanned or copied output is rejected. Every screenshot must show your **name or URN inside it** (the prompt is the easy way: set \`PS1\` to include your URN) and the **full window** with both the command and its result.

**Cadence** — hard copy of the previous experiment to every session for the teacher to sign and date; a scanned copy of the whole record uploaded to DigiiCampus before the end-semester practical. Minimum five quizzes and five vivas per lab, all during lab hours on DigiiCampus.

Set the document up once with these settings and a footer, then duplicate the page for each new experiment.`,
    },
    {
      title: "For the viva, know the 'why' behind the five commands you'll be asked",
      body: `Execution & viva is 50 of the 100 marks. The questions that come up over and over:

• What's the difference between an internal and an external command? (built into the shell vs a binary on PATH — \`type cd\` vs \`type ls\` proves it)
• Absolute vs relative path.
• What do r, w, x mean **for a directory**? (r = list it, w = create/delete files in it, x = enter it — this trips everyone up)
• What's the difference between \`>\` and \`>>\`, and between \`2>\` and \`&>\`?
• What are the seven fields of /etc/passwd?
• Why can't bash do 3.5 + 2.1 without \`bc\`?

Six answers. Learn them properly and the viva is free marks.`,
    },
  ],
  textbooks: [
    {
      title: "Linux Administration: A Beginner's Guide",
      author: "Wale Soyinka, McGraw-Hill Education",
    },
    { title: "Unix Shell Programming", author: "Yashvant Kanetkar" },
  ],
  references: [
    {
      title: "UNIX and Linux System Administration Handbook",
      author:
        "Evi Nemeth, Garth Snyder, Trent R. Hein, Ben Whaley, Dan Mackin — Addison-Wesley Professional",
    },
  ],
  localFiles: [
    "linux/Linux Syllabus.docx",
    "linux/LinuxLabFile.docx",
    "linux/Practical File Template CSE2107.docx",
    "linux/Lab 1.docx",
    "linux/linux basic commands.docx",
    "linux/Installing Linux Using a Virtual Machine.pdf",
    "linux/Linux_History_BasicCommands.ppt",
  ],
  gaps: [
    "The marking scheme. The syllabus itself is confirmed against the official document (0-0-2, Batch 2024-28) — four COs and all 14 experiments match, CO mapping included — but the 50 quiz + 50 execution/viva split above is the standard IILM lab scheme inferred from your Applied Calculus Lab plan. Confirm it with Dr. Pooja Batra.",
  ],
};
