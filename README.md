# IILM OS

A study platform for B.Tech CSE Semester I at IILM University, Gurugram.
Built around the actual course plans — not a generic todo app with subjects bolted on.

---

## What's in it

**Syllabus, loaded from the real documents.** 90 topics across 6 subjects, session by session,
exactly as the course plans define them. Applied Calculus (5 units) and Programming in C
(8 units) are complete, with course outcomes, assessment schedules and marking schemes
transcribed verbatim. Each topic carries an exam weight (1–5) and a one-line "what you
actually need to be able to do".

**Mid-sem scope is explicit.** Calculus = Units I–III. C = Units 1–4. Straight from the course
plans. Every progress bar in the app measures against that scope, not the whole course.

**Marking scheme, spelled out.** CLA 30 + Mid-Sem 20 + End-Sem 100→50. The two 40% hurdles
you have to clear *separately*, and the 75% attendance rule that bars you from the end-sem
entirely. Per-component mark entry so you can see where you stand.

**Timetable.** Both lab groups, all 19 slots, with your free study window each day computed
from when your last class ends.

**An 18-day plan to mid-sems.** 59 blocks, 64 study hours, phased: triage → first pass →
drill → mock. Budgeted against your actual free time after classes.

**Notes.** Markdown with LaTeX (KaTeX). Paste a screenshot straight into the editor and it
uploads to private storage. Autosaves. Link a note to a subject and topic.

**Resources.** 46 curated links, ranked, each with a line on why it's worth your time —
every URL was opened and checked. Plus a "Find more" button and your own saved links.

**Lab tracking.** 24 experiments across Applied Calculus Lab and Linux Administration Lab,
with separate checkboxes for "done" and "written up in the lab file" — because those are
different problems.

---

## Setup

### 1. Database

Open the Supabase SQL editor for your project and run `supabase/schema.sql`. It creates
19 tables, row-level security on all of them, a private `vault` storage bucket for
screenshots, and a trigger that creates your profile row on signup. It's safe to re-run.

### 2. Environment

`.env.local` should already have your Supabase URL and keys. Add a password:

```
SEED_PASSWORD=whatever-you-want
```

That's what you'll log in with. `SEED_EMAIL` is the account it creates.

### 3. Seed

```bash
npm install
npm run seed
```

This creates your auth user and pushes every subject, unit, topic, experiment, marking
component, strategy, curated resource, timetable slot and plan day into the database.

It's **idempotent** — re-run it any time you edit the files in `src/data/`. It upserts by
natural key and never touches your notes, tasks, marks or screenshots.

### 4. Run

```bash
npm run dev
```

---

## Deploy

```bash
gh repo create iilm-os --private --source=. --push
vercel --prod
```

Then add the three environment variables in the Vercel dashboard
(`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).

---

## Filling the gaps

Three subjects are incomplete because the source material wasn't available:

| Subject | Missing |
|---|---|
| Digital Electronics & Computer Organization | Everything — course plan, units, lab experiments |
| Computational Design Thinking | Course plan; Units 2+ |
| Foundation of AI and Automation | Course plan; Units 2+ |

When you get a course plan, open the matching file in `src/data/subjects/`, add the units
and topics in the same shape as `calculus.ts`, set `status: "complete"` and
`midsemConfirmed: true`, then run `npm run seed` again. The app will pick it all up.

You can also add units and topics from inside the app, but the data files are the source of
truth — anything you add in the app gets kept, but won't survive a schema rebuild.

---

## Next semester

The schema is built around semesters, not this one semester. Add new files under
`src/data/subjects/`, bump `SEMESTER.number` in `src/data/index.ts`, and seed again.
Semester I's notes, marks and screenshots stay exactly where they are.

---

## Scripts

```bash
npm run dev         # dev server
npm run build       # production build
npm run seed        # push src/data/* into Supabase (idempotent)
npm run typecheck   # tsc --noEmit
npm run lint        # eslint
npx tsx scripts/verify.ts   # dry-run check of the seed data, no network needed
```

---

## Shape of it

```
src/
  data/           source of truth — the syllabus, timetable, plan and curated resources
    subjects/     one file per subject
    timetable.ts  both lab groups
    plan.ts       the 18-day run-up
    resources.ts  46 curated links
  app/
    (app)/        the signed-in app
    login/        auth
    api/vault/    streams screenshots out of private storage
  components/
  lib/
    queries.ts    server-side reads
    actions.ts    server actions for every mutation
supabase/
  schema.sql      run this once
scripts/
  seed.ts         data files → database
  verify.ts       sanity-check the data files
```

Next.js 16 · React 19 · Tailwind v4 · Supabase · TypeScript.
