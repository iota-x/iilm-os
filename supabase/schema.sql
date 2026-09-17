-- ════════════════════════════════════════════════════════════════════
--  IILM OS — schema
--  Run this once in the Supabase SQL Editor, then `npm run seed`.
--  Safe to re-run: everything is IF NOT EXISTS / CREATE OR REPLACE.
-- ════════════════════════════════════════════════════════════════════

create extension if not exists "pgcrypto";

-- ─── profile ────────────────────────────────────────────────────────
create table if not exists profiles (
  id               uuid primary key references auth.users(id) on delete cascade,
  display_name     text,
  lab_group        smallint default 2 check (lab_group in (1, 2)),
  theme            text default 'system',
  created_at       timestamptz default now()
);

-- ─── semesters ──────────────────────────────────────────────────────
create table if not exists semesters (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  name          text not null,
  number        smallint not null,
  section       text,
  batch         text,
  session_label text,
  university    text,
  school        text,
  start_date    date,
  end_date      date,
  is_active     boolean default true,
  created_at    timestamptz default now(),
  unique (user_id, number)
);

-- ─── subjects ───────────────────────────────────────────────────────
create table if not exists subjects (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  semester_id       uuid not null references semesters(id) on delete cascade,
  slug              text not null,
  name              text not null,
  short_name        text not null,
  code              text,
  credits           numeric default 3,
  ltpc              text,
  color             text default 'slate',
  status            text default 'complete' check (status in ('complete','partial','empty')),
  teacher           text,
  lab_teacher       text,
  has_lab           boolean default false,
  lab_title         text,
  lab_code          text,
  lab_ltpc          text,
  overview          text,
  midsem_scope      text,
  midsem_confirmed  boolean default false,
  objectives        text[] default '{}',
  gaps              text[] default '{}',
  local_files       text[] default '{}',
  sort_order        int default 0,
  created_at        timestamptz default now(),
  unique (semester_id, slug)
);

-- ─── course outcomes ────────────────────────────────────────────────
create table if not exists outcomes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  subject_id  uuid not null references subjects(id) on delete cascade,
  code        text not null,
  text        text not null,
  bloom       text,
  unique (subject_id, code)
);

-- ─── units ──────────────────────────────────────────────────────────
create table if not exists units (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  subject_id  uuid not null references subjects(id) on delete cascade,
  number      smallint not null,
  title       text not null,
  sessions    smallint,
  co          text,
  assessment  text,
  in_midsem   boolean default false,
  sort_order  int default 0,
  unique (subject_id, number)
);

-- ─── topics ─────────────────────────────────────────────────────────
create table if not exists topics (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  subject_id      uuid not null references subjects(id) on delete cascade,
  unit_id         uuid not null references units(id) on delete cascade,
  code            text not null,
  session         text,
  title           text not null,
  weight          smallint default 3 check (weight between 1 and 5),
  in_midsem       boolean default false,
  outcome         text,
  status          text default 'not_started'
                  check (status in ('not_started','learning','revising','mastered')),
  confidence      smallint default 0 check (confidence between 0 and 5),
  last_studied_at timestamptz,
  sort_order      int default 0,
  unique (user_id, code)
);

-- ─── lab experiments ────────────────────────────────────────────────
create table if not exists experiments (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  subject_id  uuid not null references subjects(id) on delete cascade,
  number      smallint not null,
  title       text not null,
  co          text,
  objective   text,
  tasks       text[] default '{}',
  in_midsem   boolean default false,
  status      text default 'not_started'
              check (status in ('not_started','in_progress','done')),
  file_done   boolean default false,
  notes       text,
  unique (subject_id, number)
);

-- ─── assessment components (the marking scheme, per subject) ────────
create table if not exists components (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  subject_id  uuid not null references subjects(id) on delete cascade,
  name        text not null,
  marks       numeric not null,
  weightage   numeric not null,
  scope       text,
  timing      text,
  co          text,
  track       text default 'theory' check (track in ('theory','lab')),
  obtained    numeric,
  status      text default 'upcoming'
              check (status in ('upcoming','done','missed')),
  sort_order  int default 0
);

-- ─── strategies (the written playbook per subject) ──────────────────
create table if not exists strategies (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  subject_id  uuid not null references subjects(id) on delete cascade,
  title       text not null,
  body        text not null,
  sort_order  int default 0,
  pinned      boolean default false
);

-- ─── books ──────────────────────────────────────────────────────────
create table if not exists books (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  subject_id  uuid not null references subjects(id) on delete cascade,
  title       text not null,
  author      text,
  note        text,
  kind        text default 'textbook' check (kind in ('textbook','reference')),
  sort_order  int default 0
);

-- ─── resources ──────────────────────────────────────────────────────
create table if not exists resources (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  subject_id  uuid references subjects(id) on delete cascade,
  unit_id     uuid references units(id) on delete set null,
  topic_id    uuid references topics(id) on delete set null,
  title       text not null,
  url         text not null,
  kind        text default 'article'
              check (kind in ('video','playlist','article','practice','pdf','book','tool')),
  source      text,
  rank        smallint default 5,
  minutes     smallint,
  why         text,
  is_curated  boolean default false,
  opened_at   timestamptz,
  useful      boolean,
  created_at  timestamptz default now()
);

-- ─── notes ──────────────────────────────────────────────────────────
create table if not exists notes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  subject_id  uuid references subjects(id) on delete cascade,
  unit_id     uuid references units(id) on delete set null,
  topic_id    uuid references topics(id) on delete set null,
  title       text not null default 'Untitled',
  content     text default '',
  tags        text[] default '{}',
  pinned      boolean default false,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

create index if not exists notes_user_updated_idx on notes (user_id, updated_at desc);
create index if not exists notes_subject_idx on notes (subject_id);

-- full text search over notes
create index if not exists notes_fts_idx
  on notes using gin (to_tsvector('english', coalesce(title,'') || ' ' || coalesce(content,'')));

-- ─── attachments (screenshots etc., stored in the `vault` bucket) ────
create table if not exists attachments (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  note_id       uuid references notes(id) on delete cascade,
  subject_id    uuid references subjects(id) on delete cascade,
  topic_id      uuid references topics(id) on delete set null,
  storage_path  text not null,
  filename      text,
  mime          text,
  size_bytes    bigint,
  caption       text,
  created_at    timestamptz default now()
);

-- ─── tasks (the checklist; plan blocks live here too) ───────────────
create table if not exists tasks (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  subject_id    uuid references subjects(id) on delete cascade,
  topic_id      uuid references topics(id) on delete set null,
  title         text not null,
  detail        text,
  topic_codes   text[] default '{}',
  due_date      date,
  minutes       smallint,
  kind          text default 'custom'
                check (kind in ('learn','drill','revise','admin','lab','mock','custom')),
  status        text default 'todo'
                check (status in ('todo','doing','done','skipped')),
  source        text default 'manual' check (source in ('plan','manual')),
  sort_order    int default 0,
  completed_at  timestamptz,
  created_at    timestamptz default now()
);

create index if not exists tasks_user_due_idx on tasks (user_id, due_date);

-- ─── plan days (metadata for the 18-day run-up, and beyond) ─────────
create table if not exists plan_days (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  date        date not null,
  phase       text,
  budget      smallint,
  headline    text,
  note        text,
  unique (user_id, date)
);

-- ─── study sessions (the timer log) ─────────────────────────────────
create table if not exists study_sessions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  subject_id  uuid references subjects(id) on delete cascade,
  topic_id    uuid references topics(id) on delete set null,
  task_id     uuid references tasks(id) on delete set null,
  started_at  timestamptz not null default now(),
  ended_at    timestamptz,
  minutes     smallint,
  kind        text default 'learn',
  note        text
);

create index if not exists sessions_user_start_idx on study_sessions (user_id, started_at desc);

-- ─── timetable ──────────────────────────────────────────────────────
create table if not exists timetable_slots (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  semester_id  uuid not null references semesters(id) on delete cascade,
  day          text not null check (day in ('Mon','Tue','Wed','Thu','Fri','Sat','Sun')),
  periods      smallint[] default '{}',
  start_time   text not null,
  end_time     text not null,
  subject_id   uuid references subjects(id) on delete cascade,
  kind         text default 'lecture' check (kind in ('lecture','lab')),
  lab_group    smallint,
  room         text,
  teacher      text
);

-- ─── exams ──────────────────────────────────────────────────────────
create table if not exists exams (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  semester_id   uuid not null references semesters(id) on delete cascade,
  subject_id    uuid references subjects(id) on delete cascade,
  key           text not null,
  name          text not null,
  kind          text default 'mse',
  exam_date     date,
  window_label  text,
  max_marks     numeric,
  weightage     numeric,
  scope         text,
  obtained      numeric,
  status        text default 'upcoming',
  unique (user_id, key)
);

-- ─── attendance (75% rule is not optional) ──────────────────────────
create table if not exists attendance (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  subject_id  uuid not null references subjects(id) on delete cascade,
  held        smallint default 0,
  attended    smallint default 0,
  updated_at  timestamptz default now(),
  unique (user_id, subject_id)
);

-- ════════════════════════════════════════════════════════════════════
--  updated_at trigger for notes
-- ════════════════════════════════════════════════════════════════════
create or replace function touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists notes_touch on notes;
create trigger notes_touch before update on notes
  for each row execute function touch_updated_at();

-- ════════════════════════════════════════════════════════════════════
--  Checkpoints: the sub-steps inside a topic. A topic like "Limit,
--  Continuity, Differentiability" is several things to learn, not one —
--  these make it a checklist you can work down.
-- ════════════════════════════════════════════════════════════════════
create table if not exists checkpoints (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  topic_id    uuid not null references topics(id) on delete cascade,
  title       text not null,
  done        boolean not null default false,
  sort_order  smallint default 0,
  created_at  timestamptz default now(),
  unique (topic_id, title)
);

create index if not exists checkpoints_topic_idx on checkpoints(topic_id);

-- ════════════════════════════════════════════════════════════════════
--  Questions and attempts: what you might be asked, and how each go at
--  it actually went. Attempts are rows, not a flag, so "wrong twice then
--  right" survives.
-- ════════════════════════════════════════════════════════════════════
-- A question you might be asked. Tied to a topic so the app can tell you
-- which topic you keep failing, not just which question.
create table if not exists questions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  subject_id  uuid references subjects(id) on delete cascade,
  topic_id    uuid references topics(id) on delete set null,
  prompt      text not null,
  answer      text,
  source      text,
  marks       smallint,
  kind        text default 'practice'
              check (kind in ('pyq','practice','quiz','example','viva')),
  created_at  timestamptz default now()
);

-- Every attempt is its own row. That is the whole point: a flag on the
-- question would be overwritten and you'd lose the fact that you got it
-- wrong twice before getting it right.
create table if not exists attempts (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  question_id  uuid not null references questions(id) on delete cascade,
  outcome      text not null check (outcome in ('correct','partial','wrong')),
  note         text,
  created_at   timestamptz default now()
);

create index if not exists questions_topic_idx on questions(topic_id);
create index if not exists questions_subject_idx on questions(subject_id);
create index if not exists attempts_question_idx on attempts(question_id);

-- ════════════════════════════════════════════════════════════════════
--  Row level security — every table is scoped to the owning user.
-- ════════════════════════════════════════════════════════════════════
do $$
declare t text;
begin
  foreach t in array array[
    'profiles','semesters','subjects','outcomes','units','topics','experiments',
    'components','strategies','books','resources','notes','attachments','tasks',
    'plan_days','study_sessions','timetable_slots','exams','attendance','checkpoints','questions','attempts'
  ] loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists own_all on %I', t);
    if t = 'profiles' then
      execute 'create policy own_all on profiles for all
               using (auth.uid() = id) with check (auth.uid() = id)';
    else
      execute format('create policy own_all on %I for all
               using (auth.uid() = user_id) with check (auth.uid() = user_id)', t);
    end if;
  end loop;
end $$;

-- ════════════════════════════════════════════════════════════════════
--  Auto-create a profile row on signup
-- ════════════════════════════════════════════════════════════════════
create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();

-- ════════════════════════════════════════════════════════════════════
--  Storage: private bucket for screenshots and lab-file images.
--  Objects live under <user_id>/... so the policies below scope by folder.
-- ════════════════════════════════════════════════════════════════════
insert into storage.buckets (id, name, public, file_size_limit)
values ('vault', 'vault', false, 26214400)
on conflict (id) do nothing;

drop policy if exists "vault own read"   on storage.objects;
drop policy if exists "vault own write"  on storage.objects;
drop policy if exists "vault own update" on storage.objects;
drop policy if exists "vault own delete" on storage.objects;

create policy "vault own read" on storage.objects for select
  using (bucket_id = 'vault' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "vault own write" on storage.objects for insert
  with check (bucket_id = 'vault' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "vault own update" on storage.objects for update
  using (bucket_id = 'vault' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "vault own delete" on storage.objects for delete
  using (bucket_id = 'vault' and (storage.foldername(name))[1] = auth.uid()::text);
