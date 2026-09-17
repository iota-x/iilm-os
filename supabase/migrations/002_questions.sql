-- Run this once in the Supabase SQL editor, or just re-run supabase/schema.sql
-- (which now contains it). Safe to run more than once.

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

alter table questions enable row level security;
alter table attempts  enable row level security;

drop policy if exists own_all on questions;
create policy own_all on questions for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists own_all on attempts;
create policy own_all on attempts for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
