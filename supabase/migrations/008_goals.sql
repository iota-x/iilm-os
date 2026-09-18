-- Goals: "finish X by <date>", turned into one task per topic spread across
-- the days until the deadline. Tasks generated this way carry goal_id, so a
-- replan can clear the future ones and redistribute what's left.

create table if not exists goals (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  title        text not null,
  subject_id   uuid references subjects(id) on delete cascade,
  unit_id      uuid references units(id) on delete cascade,
  /** which topics count: the subject's mid-sem scope, one unit, or the whole subject */
  scope        text not null default 'midsem' check (scope in ('midsem','unit','subject')),
  deadline     date not null,
  /** rough daily budget the plan was built to, in minutes */
  daily_minutes smallint not null default 90,
  status       text not null default 'active' check (status in ('active','done','dropped')),
  created_at   timestamptz not null default now()
);
create index if not exists goals_user_idx on goals(user_id, status);

alter table tasks
  add column if not exists goal_id uuid references goals(id) on delete cascade;
alter table tasks drop constraint if exists tasks_source_check;
alter table tasks add constraint tasks_source_check check (source in ('plan','manual','goal'));

alter table goals enable row level security;
drop policy if exists "goals own" on goals;
create policy "goals own" on goals for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
