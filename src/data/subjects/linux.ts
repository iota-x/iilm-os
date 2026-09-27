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
  // Not a syllabus unit — the course is lab-only. This is the theory Dr. Aarti
  // Chugh's two decks and the handouts teach, which is what the lab quizzes
  // and the viva ask. Having it as topics gives the handouts somewhere to hang.
  units: [
    {
      number: 1,
      title: "Linux fundamentals (theory for quizzes and viva)",
      sessions: 2,
      co: "CO1, CO2",
      assessment: "Lab quizzes and execution/viva — continuous",
      inMidsem: false,
      topics: [
        {
          code: "linux-u1-os",
          session: "Lecture 1",
          title: "Operating system concept: kernel, system calls, shell and utilities",
          weight: 2,
          inMidsem: false,
          outcome: "Draw the layers from hardware up to the user and say what the kernel provides to the layers above it.",
          subtopics: [
            "OS as a resource manager: CPU, memory, disks, devices",
            "Layers: hardware → kernel → system call library → utilities/applications → shell or GUI → users",
            "Kernel jobs: interrupts, memory allocation, CPU sharing",
          ],
        },
        {
          code: "linux-u1-history",
          session: "Lecture 1",
          title: "History of UNIX and Linux; UNIX vs Linux; GNU",
          weight: 3,
          inMidsem: false,
          outcome: "Tell the MULTICS → UNIX → SysV/BSD → Linux story with names and years, and give four differences between UNIX and Linux.",
          subtopics: [
            "MULTICS (GE, MIT, Bell Labs) → UNICS/UNIX by Ken Thompson; rewritten in C with Dennis Ritchie in 1973",
            "1978 split into System V and BSD",
            "Linus Torvalds, 1991: free kernel, POSIX-conformant, a mix of SysV and BSD",
            "GNU = GNU's Not Unix",
            "UNIX is proprietary, licensed and server-first; Linux is free and open source with bash by default",
          ],
        },
        {
          code: "linux-u1-distros",
          session: "Lecture 2",
          title: "Linux distributions",
          weight: 2,
          inMidsem: false,
          outcome: "Say what a distribution adds to the kernel and name five, with what each is known for.",
          subtopics: [
            "Distribution = kernel + system utilities + GUI (GNOME/KDE) + applications",
            "600+ exist: Ubuntu, Debian, Fedora, Mint, openSUSE, Manjaro, MX, elementary, Solus, Deepin",
          ],
        },
        {
          code: "linux-u1-architecture",
          session: "Lecture 2",
          title: "Linux architecture: hardware, kernel, shell, applications",
          weight: 4,
          inMidsem: false,
          outcome: "Draw the four-layer diagram, list what the kernel does, name four kernel types and four shells.",
          subtopics: [
            "Hardware layer: drivers, memory, CPU, I/O",
            "Kernel: memory, process and device management, system calls and security; lives at /boot/vmlinuz",
            "Kernel types: monolithic, micro, hybrid, exo",
            "Shell: bash (Bourne Again SHell), sh, ksh, csh/tcsh, zsh",
            "Utilities and daemons; application programs",
          ],
        },
        {
          code: "linux-u1-filesystem",
          session: "Lecture 1",
          title: "Basic principles, file types and the directory structure",
          weight: 4,
          inMidsem: false,
          outcome: "State the principles, the four file types and hard vs soft links, and say what lives in each top-level directory.",
          subtopics: [
            "Everything is a file; small single-purpose programs chained with pipes; config in text; case-sensitive",
            "File types: ordinary, directory, device, link (hard and soft)",
            "/bin, /sbin, /boot, /dev, /proc, /etc, /home, /lib, /mnt, /root, /tmp, /usr/lib, /var, /media",
          ],
        },
        {
          code: "linux-u1-paths",
          session: "Lab 1",
          title: "Login, absolute vs relative paths, internal vs external commands, metacharacters",
          weight: 4,
          inMidsem: false,
          outcome: "Answer the Lab 1 viva set: paths with examples, internal vs external (prove it with `type`), metacharacters with examples.",
          subtopics: [
            "Virtual consoles vs graphical login",
            "Absolute path starts at / (/home/user/Btech); relative doesn't (Btech/FirstYear)",
            "Internal = built into the shell (cd, echo, alias); external = a binary on PATH (ls, grep, cp)",
            "Metacharacters: * ? [ ] > >> < | ; &",
            "Five differences between Linux and Windows",
          ],
        },
        {
          code: "linux-u1-commands",
          session: "Lab 1–2",
          title: "Basic commands: ls, cd, pwd, mkdir, rmdir, cp, mv, rm, cat, touch, ps, man, echo …",
          weight: 5,
          inMidsem: false,
          outcome: "Type each of the 18 handout commands and the deck's extras from memory, with the options the quiz asks.",
          subtopics: [
            "ls -l -a -A -h -1 -d -t -S -r -R -X",
            "cd .. / cd - / cd ~ ; pwd ; mkdir ; rmdir (empty only)",
            "cp and mv: what happens when the destination is a directory, a file, or doesn't exist",
            "rm -i -r -f ; touch ; cat ; more / less",
            "ps aux, top, free -m, df -h, du -sh, uname -a, whoami, id, su -, passwd",
            "man, info, --help ; echo $HOSTNAME ; cal ; date ; sort ; clear",
          ],
        },
        {
          code: "linux-u1-install",
          session: "Lab 1",
          title: "Installing Linux in a virtual machine",
          weight: 3,
          inMidsem: false,
          outcome: "Install Ubuntu in a VM, sizing RAM and disk sensibly, and explain five benefits of a VM.",
          subtopics: [
            "Hypervisor choices: VirtualBox, VMware, Hyper-V — UTM on an Apple-silicon Mac",
            "New VM → ISO → user and hostname → half the RAM → 20 GB+ disk → install",
            "Guest Additions: apt install build-essential linux-headers-$(uname -r)",
            "Benefits: utilisation, isolation, scalability, cost, testing, recovery, migration",
          ],
        },
        {
          code: "linux-u1-labfile",
          session: "Every lab",
          title: "The lab record: format, screenshot rules and SOPs",
          weight: 2,
          inMidsem: false,
          outcome: "Set up the record once in the prescribed format and keep every screenshot valid, with your URN visible.",
        },
      ],
    },
  ],
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
    "linux/LinuxArchitecture_Distributions.pptx",
    "linux/Lab File format.docx",
  ],
  gaps: [
    "None of the handouts cover experiments 2–8 yet: performance monitoring, single-user mode, permissions (chmod/chown/umask), filters, pipes and redirection, users and groups. They also leave out run levels and Lab 1's \"Linux vs Windows\" answer.",
    "The marking scheme. The syllabus itself is confirmed against the official document (0-0-2, Batch 2024-28) — four COs and all 14 experiments match, CO mapping included — but the 50 quiz + 50 execution/viva split above is the standard IILM lab scheme inferred from your Applied Calculus Lab plan. Confirm it with Dr. Pooja Batra.",
  ],
};
