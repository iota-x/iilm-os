-- ════════════════════════════════════════════════════════════════════
-- 010 — goals know where you're starting from
-- ════════════════════════════════════════════════════════════════════
-- `daily_minutes` already existed (how much time a day the plan is built
-- to). `level` is your own read of the subject: 1 = new to it, 2 = seen it
-- in class, 3 = fairly solid. It scales every topic's time estimate.
alter table goals
  add column if not exists level smallint not null default 2 check (level between 1 and 3);
