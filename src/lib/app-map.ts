/**
 * Every page in the app, described once. The guide page, the command
 * palette and the tour all read from here, so nothing can be reachable
 * without being findable.
 */
export interface AppPage {
  href: string;
  label: string;
  /** what it's for, one line */
  blurb: string;
  /** the moment you'd open it */
  when: string;
  /** extra words the search should match */
  keywords?: string[];
}

export interface AppGroup {
  label: string;
  /** why these belong together */
  intro: string;
  pages: AppPage[];
}

export const APP_MAP: AppGroup[] = [
  {
    label: "Start here",
    intro: "One page that tells you what to do next.",
    pages: [
      {
        href: "/",
        label: "Today",
        blurb: "The block to do now with a timer, today's plan, today's classes with attendance ticks, and the numbers that matter.",
        when: "Every time you open the app.",
        keywords: ["dashboard", "home", "focus", "timer", "streak"],
      },
    ],
  },
  {
    label: "Study",
    intro: "Planning what to learn, learning it, and keeping it.",
    pages: [
      {
        href: "/goals",
        label: "Goals",
        blurb: "Pick a subject and a date; the topics get spread across the days and each day's share lands on Today.",
        when: "When an exam or a deadline is coming and you want a plan without making one.",
        keywords: ["deadline", "plan", "target", "mid-sem"],
      },
      {
        href: "/planner",
        label: "Planner",
        blurb: "The week's timetable and the day-by-day study plan, with every block you can tick, skip or add to.",
        when: "To see the week ahead or move things around.",
        keywords: ["timetable", "schedule", "week", "calendar", "tasks", "blocks"],
      },
      {
        href: "/subjects",
        label: "Subjects",
        blurb: "Each course's syllabus as units and topics you can mark Learning → Revising → Solid, plus its strategy, resources, notes, photos, marks and lab.",
        when: "When you're studying a topic — this is where you record that you did.",
        keywords: ["syllabus", "units", "topics", "course", "calculus", "c", "de+co", "digital", "cdt", "ai", "linux", "lab", "experiments"],
      },
      {
        href: "/review",
        label: "Review",
        blurb: "Spaced repetition over your topics: the ones due today, ordered by how overdue and how heavily examined.",
        when: "Ten minutes a day, ideally first.",
        keywords: ["revision", "spaced", "repetition", "due", "overdue", "confidence"],
      },
      {
        href: "/practice",
        label: "Practice",
        blurb: "A question bank per topic — drill the ones you get wrong, log the outcome, see accuracy climb.",
        when: "After a first pass of a topic, and the night before a test.",
        keywords: ["questions", "drill", "quiz", "bank", "accuracy"],
      },
      {
        href: "/ask",
        label: "Ask",
        blurb: "An assistant with your syllabus loaded. It can read a board photo, write a note, add checkpoints or questions to a topic. Conversations are saved.",
        when: "“What should I study tonight?”, “turn this photo into notes”, “make me five questions on K-maps”.",
        keywords: ["ai", "chat", "gemini", "assistant", "claude", "help"],
      },
    ],
  },
  {
    label: "Material",
    intro: "Everything you collect during the semester, filed to the right class by itself.",
    pages: [
      {
        href: "/inbox",
        label: "Inbox",
        blurb: "Where photos and files land. A board photo is matched to the lecture from when it was taken; place it on a topic in one tap.",
        when: "After class — share photos from your phone straight into the app.",
        keywords: ["photos", "upload", "files", "share", "board", "camera", "pdf"],
      },
      {
        href: "/notes",
        label: "Notes",
        blurb: "Markdown notes attached to a subject or topic, with images from your photos. Ask can write them for you.",
        when: "Writing a lecture up, or reading one back before a test.",
        keywords: ["markdown", "write", "editor", "lecture notes"],
      },
      {
        href: "/resources",
        label: "Resources",
        blurb: "Hand-picked videos, articles and tools per topic, ranked, each with a line on why it's there.",
        when: "When a topic isn't landing from the lecture alone.",
        keywords: ["videos", "youtube", "links", "nptel", "articles", "neso", "gate smashers"],
      },
    ],
  },
  {
    label: "College",
    intro: "The section, the rules, and the numbers that decide whether you sit the exam.",
    pages: [
      {
        href: "/class",
        label: "Class",
        blurb: "Section E's board — questions, resources, notices. Reply, mark helpful, accept an answer, attach an image.",
        when: "When you didn't want to ask in class, or you found something worth sharing.",
        keywords: ["forum", "board", "discussion", "section", "posts", "questions", "community"],
      },
      {
        href: "/attendance",
        label: "Attendance",
        blurb: "Per-subject attendance against the 75% bar, with how many you can still miss or need to attend in a row.",
        when: "Tick classes on Today; open this when you're deciding whether to skip one.",
        keywords: ["75%", "present", "absent", "bunk", "classes"],
      },
      {
        href: "/exams",
        label: "Exams",
        blurb: "How the 100 marks split, where you stand paper by paper, every assessment per subject, and your internals against the 40% rule.",
        when: "When marks come back, and when you're planning what to weight.",
        keywords: ["marks", "marking", "mid-sem", "end-sem", "internals", "40%", "cla", "mse", "ese", "test", "quiz"],
      },
    ],
  },
  {
    label: "You",
    intro: "Settings and help.",
    pages: [
      {
        href: "/settings",
        label: "Settings",
        blurb: "Your name, lab group, theme, Gemini key (with a two-minute tutorial), and the attendance baseline from before you started.",
        when: "Once at the start, then rarely.",
        keywords: ["profile", "theme", "dark", "light", "key", "api", "gemini", "lab group", "password"],
      },
      {
        href: "/guide",
        label: "Guide",
        blurb: "This map — every page, what it's for, and how a week in the app works.",
        when: "When you're not sure where something lives.",
        keywords: ["help", "map", "tour", "how to", "shortcuts", "what is"],
      },
    ],
  },
];

export const APP_PAGES: AppPage[] = APP_MAP.flatMap((g) => g.pages);

/** Things you can do from the palette without going anywhere first. */
export const APP_ACTIONS: { label: string; href: string; keywords: string[] }[] = [
  { label: "Mark today's classes", href: "/#classes", keywords: ["attendance", "present", "absent", "tick"] },
  { label: "Add a task for today", href: "/?add=1", keywords: ["task", "todo", "block", "new"] },
  { label: "Set a goal", href: "/goals?new=1", keywords: ["goal", "deadline", "plan"] },
  { label: "Write a note", href: "/notes", keywords: ["note", "write", "new"] },
  { label: "New post on the board", href: "/class?new=1", keywords: ["post", "ask the class", "share", "forum"] },
  { label: "Upload photos", href: "/inbox", keywords: ["photo", "upload", "board", "share"] },
  { label: "Take the tour", href: "/?tour=1", keywords: ["tour", "help", "walkthrough", "intro"] },
];
