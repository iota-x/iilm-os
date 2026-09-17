-- Run this once in the Supabase SQL editor, or just re-run supabase/schema.sql
-- (which now contains it). Safe to run more than once.

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

alter table checkpoints enable row level security;
drop policy if exists own_all on checkpoints;
create policy own_all on checkpoints for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
