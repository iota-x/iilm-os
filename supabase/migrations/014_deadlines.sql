-- 014: deadlines caught from WhatsApp and the ERP, shared on the class board
--
-- Most teachers post deadlines on WhatsApp or the ERP, not Classroom. A
-- student pastes or shares the message, Semwise reads the dates out, and
-- one tap posts them to the class board as a notice with a due date — the
-- rest of the class adds it to their own Planner from there.
--
-- Safe to run twice.

alter table posts add column if not exists due_date date;
create index if not exists posts_due_idx on posts(cohort_id, due_date) where due_date is not null;

-- Classroom announcements already read for deadlines, so each is read once
alter table classroom_links add column if not exists seen_announcements text[] not null default '{}';

-- teachers can give a notice a due date too; it lands on every class's board
-- with the "Add to my Planner" button
drop function if exists teacher_post(text, text, text, text[]);
create or replace function teacher_post(p_title text, p_body text, p_kind text, p_cohorts text[], p_due date default null)
returns int language plpgsql security definer set search_path = public as $$
declare n int;
begin
  if not (is_faculty() or is_admin()) then raise exception 'Only teachers can post to several classes'; end if;
  if coalesce(trim(p_title), '') = '' then raise exception 'Give it a title.'; end if;
  if p_kind not in ('notice','resource','discussion') then raise exception 'Unknown kind of post'; end if;
  insert into posts (user_id, title, body, kind, cohort_id, due_date)
  select auth.uid(), trim(p_title), coalesce(trim(p_body), ''), p_kind, co.id, p_due
  from cohorts co
  where co.id = any(p_cohorts) and (co.university_id = my_university() or is_admin());
  get diagnostics n = row_count;
  return n;
end $$;
grant execute on function teacher_post(text, text, text, text[], date) to authenticated;

-- which Classroom permissions the student granted, so Settings can ask
-- people who connected before announcements were read to reconnect once
alter table classroom_links add column if not exists granted_scopes text;
