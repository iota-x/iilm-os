-- Run this once in the Supabase SQL editor, or just re-run supabase/schema.sql
-- (which now contains it). Safe to run more than once.

-- One row per class you actually mark. Unmarked classes count for nothing —
-- no row means no assumption either way, which keeps the percentage honest
-- when you forget a day or a class is cancelled.
create table if not exists class_marks (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  on_date     date not null,
  slot_id     uuid not null references timetable_slots(id) on delete cascade,
  subject_id  uuid references subjects(id) on delete set null,
  attended    boolean not null,
  created_at  timestamptz default now(),
  unique (user_id, on_date, slot_id)
);

create index if not exists class_marks_date_idx on class_marks(on_date);
create index if not exists class_marks_subject_idx on class_marks(subject_id);

alter table class_marks enable row level security;
drop policy if exists own_all on class_marks;
create policy own_all on class_marks for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
