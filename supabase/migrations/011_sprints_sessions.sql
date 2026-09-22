-- ════════════════════════════════════════════════════════════════════
-- 011 — goals that re-adjust, weeks with a review, and time actually spent
-- ════════════════════════════════════════════════════════════════════

-- ─── goals ──────────────────────────────────────────────────────────
alter table goals
  -- dates the plan skips (a trip, an exam day)
  add column if not exists days_off date[] not null default '{}',
  -- topics that didn't fit before the deadline at the last plan
  add column if not exists overflow smallint not null default 0,
  -- the auto re-adjust runs at most once a day
  add column if not exists last_planned_on date;

-- ─── tasks: which week (sprint) of a goal a block belongs to ───────
alter table tasks
  add column if not exists sprint smallint;

-- ─── study sessions: minutes that were really spent ───────────────
-- The table has existed since the first schema (the timer log) but nothing
-- wrote to it. Now the focus timer logs what it measured and a plain tick
-- logs the block's estimate, marked as such. Goal id lets a goal show
-- time put in.
alter table study_sessions
  add column if not exists goal_id uuid references goals(id) on delete set null,
  add column if not exists source text not null default 'timer' check (source in ('timer','tick'));
