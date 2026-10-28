# Semwise

Your semester, planned. A study platform built around each class's actual syllabus,
timetable and exam dates — open it and it tells you what to study today. Not a generic
todo app with subjects bolted on.

Live at **[semwise-app.vercel.app](https://semwise-app.vercel.app)** for IILM University,
Gurugram (B.Tech CSE Semester I), and built to take more universities.

---

## What's in it

**The real syllabus, already loaded.** 7 subjects, 32 units, 202 topics, transcribed from
the course plans — with course outcomes, marking schemes, and an exam weight and a
one-line "what you need to be able to do" on each topic.

**One tap plans every paper.** Goals split the whole syllabus into daily study blocks,
each paper finished the day before it's written, sized to the time you have. Miss a day
and the remaining days re-adjust. Spaced review brings shaky topics back.

**Today.** Days to the next paper, the one block to do now (with a timer), today's plan
and today's classes. College holidays are loaded, so no-class days show up on their own.

**Your class notes, on the right topic.** 686 pages of class notes and slide decks are
linked to the topics they cover, plus 161 study notes and one-page revision sheets. The
reader opens full-screen with a whiteboard layer — your ink is saved per page. Search
(Ctrl/⌘ K) finds words *inside* the notes and lands on the exact page.

**Ask — an AI tutor that knows the syllabus.** Answers name the real topic codes and the
paper date, and it reads photos of the board. 20 free questions a day on the shared key;
a student's own free Gemini key (stored encrypted) removes the cap.

**Catch deadlines from WhatsApp and the ERP.** Paste a message, share it from the phone,
drop a screenshot or a whole exported group chat: the dates come out as a checklist, you
confirm each line, and they land on the Planner. "Postponed to 29/10" keeps only the new
date; "holiday on Monday" is skipped. Post it to the class board and classmates add it to
their Planner in one tap.

**Google Classroom sync.** Coursework, due dates, announcements and materials come in on
their own once a student connects their account (nightly cron).

**Class board, per section.** Notices, resources and questions, ranked by Helpful votes
(sort by Most helpful). Accepted answers, anonymous questions, teacher-verified ticks,
"Seen by 48 of 60" on notices, and brownie points with a monthly top-helpers strip.
Past-paper bank per subject. Events with "I'm going", a calendar file and a card on Today
the evening before.

**Attendance and exams.** Attendance per subject against the 75% bar, with exactly how
many more classes you can miss. How the marks split, the two separate 40% hurdles, an
SGPA calculator and the end-sem marks you need from your internals.

**Teachers and admin.** Teachers request access at `/teacher/signin`, an admin approves
them at `/admin`, and `/teacher` posts one notice or deadline to many sections and shows
which topics a class is stuck on.

**Works on a phone.** Installs as an app from the browser (PWA) and takes shares from the
Android share sheet. Pages are always live (never cached, so one person's data can't show
to the next); without a connection it shows an offline page that reloads by itself.

---

## Setup

### 1. Database

In the Supabase SQL editor, run `supabase/schema.sql`, then every file in
`supabase/migrations/` in number order (`001` → `014`). Together they create the tables,
row-level security on all of them, the private `vault` and `board` storage buckets, and
the trigger that creates a profile row on sign-up.

### 2. Environment

`.env.local`:

| Variable | What it's for |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | the Supabase project |
| `SUPABASE_SERVICE_ROLE_KEY` | seed scripts, sign-up, admin actions, the shared-key quota |
| `KEY_ENCRYPTION_SECRET` | encrypts students' own Gemini keys. **Never rotate it casually** — stored keys become unreadable |
| `GOOGLE_GENERATIVE_AI_API_KEY` | the shared AI key (Gemini). `GROQ_API_KEY` or `ANTHROPIC_API_KEY` work instead; `*_MODEL` overrides the model |
| `SHARED_ASK_DAILY` | free AI uses per student per day on the shared key (default 20) |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Google Classroom sync (OAuth) |
| `CRON_SECRET` | protects the nightly Classroom cron |
| `SEED_EMAIL`, `SEED_PASSWORD`, `SEED_DISPLAY_NAME` | the owner account `npm run seed` creates |
| `CLASS_DEFAULT_PASSWORD` | starting password for accounts made by `npm run onboard` |

### 3. Seed

```bash
npm install
npm run tenants   # universities and classes into the database
npm run seed      # the owner's account and its class's syllabus, timetable and plan
```

The seed is **idempotent** — re-run it any time you edit `src/data/`. It upserts by
natural key and never touches notes, tasks, marks, attendance, photos or the board.

### 4. Run

```bash
npm run dev
```

---

## Deploy

The repo is connected to Vercel, so pushing `main` deploys. Add the environment
variables above in the Vercel dashboard. The Classroom cron is declared in
`vercel.json`. In Supabase Auth, set the Site URL to the live domain and allow
`https://<domain>/**` as a redirect, or password-reset emails won't work.

---

## Universities and classes

Every account belongs to a **university** and a **class (cohort)** in it — a
programme, semester and section. `src/lib/universities.ts` is the one list:

- a university has its email **domains** (who may sign up), an optional rule for
  the address, its **calendar** (mid-sem window, first end-sem paper, holidays)
  and a **grading** pack;
- a cohort points at a **syllabus pack** (`catalog`) and a **timetable** pack, both
  in `src/data/catalogs.ts`, and lists its lab groups.

Sign-up reads the domain from the email, offers that university's classes, and
seeds the chosen one's packs. An unknown domain goes on the `waitlist` table with
the college name typed. A class with no syllabus pack is still joinable — the
account starts empty and Today says so. The class board is per cohort (RLS in
migration 012), and the notes coverage, page explainers and video sprints only
show for the catalog they were written for.

**Adding a university:** add it and its cohorts to `src/lib/universities.ts`;
write its subjects under `src/data/<university>/` like `src/data/subjects/`;
register the syllabus, timetable and grading packs in `src/data/catalogs.ts`;
then `npm run tenants` (mirrors the list into the database) and deploy.

## Next semester

The schema is built around semesters, not this one semester. Add a new syllabus
pack, point the cohorts at it in `src/lib/universities.ts`, and `npm run reseed`.
Semester I's notes, marks and screenshots stay exactly where they are.

## Filling the gaps

Six of the seven Semester I subjects are complete. Entrepreneur Mindset is partial:
Units 1, 2, 4 and 5 are in, Unit 3 has no deck yet. When it arrives, add it to
`src/data/subjects/entrepreneur-mindset.ts` in the same shape as the other units and
`npm run reseed`.

---

## Scripts

```bash
npm run dev         # dev server
npm run build       # production build
npm run seed        # push the owner's class's packs into Supabase (idempotent)
npm run reseed      # the same for every account, each from its own class
npm run tenants     # mirror src/lib/universities.ts into the universities/cohorts tables
npm run onboard     # create accounts for everyone in scripts/roster.csv (--dry first)
npm run stats       # section-wide counts for a pitch (numbers only)
npm run pull        # your recent notes onto disk as markdown (read-only)
npm run intake      # unfiled photos and PDFs onto disk under inbox/ (read-only)
npm test            # vitest
npm run typecheck   # tsc --noEmit
npm run lint        # eslint
npx tsx scripts/verify.ts   # dry-run check of the seed data, no network needed
```

---

## Shape of it

```
src/
  data/             source of truth — syllabus, timetable, plan, coverage, resources
    subjects/       one file per subject
    catalogs.ts     syllabus / timetable / grading packs per class
    coverage.ts     topic → pages of the class notes
  app/
    (app)/          the signed-in app: today, goals, planner, notes, ask, class,
                    papers, events, attendance, exams, …
    teacher/ admin/ teacher posting and approvals
    api/            ask, catch, classroom, search, share, signup, vault, events
  components/
  lib/
    universities.ts universities and their classes
    queries.ts      server-side reads
    actions.ts      server actions for every mutation
    classroom.ts    Google Classroom sync
    ai-model.ts     which AI model runs, from whichever key is present
supabase/
  schema.sql        base schema
  migrations/       001–014, run in order after the schema
content/
  study-notes/      generated study notes and revision sheets
  page-index/       text of every notes page, for search inside the notes
scripts/            seed, reseed, tenants, onboard, stats, verify, …
docs/mobile-api.md  API for the planned mobile app (Bearer auth)
```

Next.js 16 · React 19 · Tailwind v4 · Supabase · Vercel AI SDK (Gemini) · TypeScript.
