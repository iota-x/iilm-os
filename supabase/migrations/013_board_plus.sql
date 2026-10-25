-- ════════════════════════════════════════════════════════════════════
-- 013 — the board grows up: points, teachers, anonymous questions,
--       notices you can see were read, past papers, events, Classroom
-- ════════════════════════════════════════════════════════════════════

-- ─── who may set what on their own profile ──────────────────────────
-- profiles' policy is "your own row, all columns", so until now anyone
-- could make themselves admin, or move into another class's board, with
-- one request. Requests from the app (role "authenticated") keep those
-- columns as they were; the service role and the SQL editor still set them.
alter table profiles add column if not exists is_faculty boolean not null default false;
-- teachers ask for access at /teacher/signin; the admin approves at /admin
alter table profiles
  add column if not exists faculty_status text check (faculty_status in ('pending','approved','rejected')),
  add column if not exists department text;

create or replace function guard_profile_flags() returns trigger
language plpgsql set search_path = public as $$
begin
  if coalesce(auth.role(), '') = 'authenticated' then
    if tg_op = 'INSERT' then
      new.is_admin := false;
      new.is_faculty := false;
      new.faculty_status := null;
    else
      new.is_admin := old.is_admin;
      new.is_faculty := old.is_faculty;
      new.faculty_status := old.faculty_status;
      new.university_id := old.university_id;
      new.cohort_id := old.cohort_id;
    end if;
  end if;
  return new;
end $$;
drop trigger if exists guard_profile_flags on profiles;
create trigger guard_profile_flags before insert or update on profiles
  for each row execute function guard_profile_flags();

create or replace function is_faculty() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select is_faculty from profiles where id = auth.uid()), false);
$$;

create or replace function cohort_university(c text) returns text
language sql stable security definer set search_path = public as $$
  select university_id from cohorts where id = c;
$$;

create or replace function my_catalog() returns text
language sql stable security definer set search_path = public as $$
  select c.catalog from profiles p join cohorts c on c.id = p.cohort_id where p.id = auth.uid();
$$;

-- names on the board say who's a teacher (columns can only be added at the end)
create or replace view member_names
  with (security_invoker = false) as
  select id, display_name, is_faculty from profiles
  where university_id = my_university() or id = auth.uid() or is_admin();
grant select on member_names to authenticated;

-- teachers read every class's board at their own university
drop policy if exists "posts read" on posts;
create policy "posts read" on posts for select to authenticated
  using (cohort_id = my_cohort() or is_admin()
         or (is_faculty() and cohort_university(cohort_id) = my_university()));

-- ─── anonymous questions ────────────────────────────────────────────
-- An anonymous post has no user_id at all, so nothing the class can read
-- points back to the author. Who wrote it lives in post_owners, which only
-- the author (and the admin, for moderation) can read.
alter table posts alter column user_id drop not null;
alter table posts add column if not exists anonymous boolean not null default false;

create table if not exists post_owners (
  post_id  uuid primary key references posts(id) on delete cascade,
  user_id  uuid not null references auth.users(id) on delete cascade
);
alter table post_owners enable row level security;
drop policy if exists "post_owners read" on post_owners;
create policy "post_owners read" on post_owners for select to authenticated
  using (user_id = auth.uid() or is_admin());

create or replace function owns_post(p uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from post_owners where post_id = p and user_id = auth.uid());
$$;

drop policy if exists "posts update" on posts;
drop policy if exists "posts delete" on posts;
create policy "posts update" on posts for update to authenticated
  using (user_id = auth.uid() or is_admin() or owns_post(id));
create policy "posts delete" on posts for delete to authenticated
  using (user_id = auth.uid() or is_admin() or owns_post(id));

create or replace function create_anonymous_post(p_title text, p_body text, p_subject text)
returns uuid language plpgsql security definer set search_path = public as $$
declare new_id uuid;
begin
  if auth.uid() is null then raise exception 'Not signed in'; end if;
  if coalesce(trim(p_title), '') = '' then raise exception 'Give it a title.'; end if;
  insert into posts (user_id, title, body, kind, subject_slug, anonymous, cohort_id)
  values (null, trim(p_title), coalesce(trim(p_body), ''), 'question', nullif(p_subject, ''), true, my_cohort())
  returning id into new_id;
  insert into post_owners (post_id, user_id) values (new_id, auth.uid());
  return new_id;
end $$;
grant execute on function create_anonymous_post(text, text, text) to authenticated;

-- ─── teacher-verified, and only the admin pins ──────────────────────
alter table posts
  add column if not exists verified_by uuid references auth.users(id) on delete set null,
  add column if not exists verified_at timestamptz;

create or replace function guard_post_flags() returns trigger
language plpgsql set search_path = public as $$
begin
  if coalesce(auth.role(), '') = 'authenticated' then
    if not is_admin() then
      new.pinned := case when tg_op = 'INSERT' then false else old.pinned end;
    end if;
    if not (is_admin() or is_faculty()) then
      new.verified_by := case when tg_op = 'INSERT' then null else old.verified_by end;
      new.verified_at := case when tg_op = 'INSERT' then null else old.verified_at end;
    end if;
    if tg_op = 'UPDATE' then
      new.anonymous := old.anonymous;
      new.user_id := old.user_id;
    end if;
  end if;
  return new;
end $$;
drop trigger if exists guard_post_flags on posts;
create trigger guard_post_flags before insert or update on posts
  for each row execute function guard_post_flags();

-- a teacher can't update other people's posts through RLS, so verifying
-- goes through here
create or replace function set_post_verified(p_id uuid, p_on boolean) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not (is_faculty() or is_admin()) then raise exception 'Only teachers can verify'; end if;
  update posts set verified_by = case when p_on then auth.uid() end,
                   verified_at = case when p_on then now() end
  where id = p_id
    and (cohort_id = my_cohort() or is_admin() or cohort_university(cohort_id) = my_university());
end $$;
grant execute on function set_post_verified(uuid, boolean) to authenticated;

-- ─── notices: who has read them ─────────────────────────────────────
create table if not exists post_reads (
  post_id  uuid not null references posts(id) on delete cascade,
  user_id  uuid not null references auth.users(id) on delete cascade,
  read_at  timestamptz not null default now(),
  primary key (post_id, user_id)
);
alter table post_reads enable row level security;
drop policy if exists "post_reads insert" on post_reads;
drop policy if exists "post_reads read"   on post_reads;
create policy "post_reads insert" on post_reads for insert to authenticated
  with check (user_id = auth.uid() and exists (select 1 from posts p where p.id = post_id));
create policy "post_reads read" on post_reads for select to authenticated
  using (user_id = auth.uid());

-- "Seen by 48 of 60" for everyone; the names of who hasn't, only for the
-- person who posted it, teachers and the admin
create or replace function notice_reach(p_id uuid)
returns table (seen int, total int, can_see_names boolean, unseen text[])
language plpgsql stable security definer set search_path = public as $$
declare c text; author uuid;
begin
  select p.cohort_id, coalesce(p.user_id, o.user_id) into c, author
  from posts p left join post_owners o on o.post_id = p.id
  where p.id = p_id and (p.cohort_id = my_cohort() or is_admin()
                         or (is_faculty() and cohort_university(p.cohort_id) = my_university()));
  if c is null then return; end if;
  can_see_names := author = auth.uid() or is_admin() or is_faculty();
  select count(*) filter (where r.user_id is not null), count(*),
         case when can_see_names
              then coalesce(array_agg(coalesce(pr.display_name, 'Someone') order by pr.display_name)
                            filter (where r.user_id is null), '{}') end
    into seen, total, unseen
  from profiles pr left join post_reads r on r.post_id = p_id and r.user_id = pr.id
  where pr.cohort_id = c and not pr.is_faculty;
  return next;
end $$;
grant execute on function notice_reach(uuid) to authenticated;

-- ─── past papers: shared by every class on the same syllabus ────────
create table if not exists papers (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null default auth.uid() references auth.users(id) on delete cascade,
  university_id  text not null default my_university() references universities(id),
  catalog        text default my_catalog(),
  subject_slug   text not null,
  year           smallint not null check (year between 2000 and 2100),
  exam           text not null check (exam in ('mid-sem','end-sem','quiz','other')),
  title          text,
  file_path      text,
  url            text,
  verified_by    uuid references auth.users(id) on delete set null,
  verified_at    timestamptz,
  created_at     timestamptz not null default now(),
  check (file_path is not null or url is not null)
);
create index if not exists papers_scope_idx on papers(university_id, catalog, subject_slug);

create table if not exists paper_votes (
  paper_id    uuid not null references papers(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (paper_id, user_id)
);

alter table papers      enable row level security;
alter table paper_votes enable row level security;
drop policy if exists "papers read"   on papers;
drop policy if exists "papers insert" on papers;
drop policy if exists "papers delete" on papers;
create policy "papers read" on papers for select to authenticated
  using ((university_id = my_university() and (catalog is not distinct from my_catalog() or is_faculty()))
         or is_admin());
create policy "papers insert" on papers for insert to authenticated
  with check (user_id = auth.uid() and university_id = my_university()
              and catalog is not distinct from my_catalog());
create policy "papers delete" on papers for delete to authenticated
  using (user_id = auth.uid() or is_admin());

drop policy if exists "paper_votes read"   on paper_votes;
drop policy if exists "paper_votes insert" on paper_votes;
drop policy if exists "paper_votes delete" on paper_votes;
create policy "paper_votes read" on paper_votes for select to authenticated
  using (exists (select 1 from papers p where p.id = paper_id));
create policy "paper_votes insert" on paper_votes for insert to authenticated
  with check (user_id = auth.uid() and exists (select 1 from papers p where p.id = paper_id));
create policy "paper_votes delete" on paper_votes for delete to authenticated
  using (user_id = auth.uid());

create or replace function set_paper_verified(p_id uuid, p_on boolean) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not (is_faculty() or is_admin()) then raise exception 'Only teachers can verify'; end if;
  update papers set verified_by = case when p_on then auth.uid() end,
                    verified_at = case when p_on then now() end
  where id = p_id and (university_id = my_university() or is_admin());
end $$;
grant execute on function set_paper_verified(uuid, boolean) to authenticated;

-- scanned papers run bigger than board photos
update storage.buckets set file_size_limit = 10485760 where id = 'board';

-- ─── events and workshops: the whole university ─────────────────────
create table if not exists events (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null default auth.uid() references auth.users(id) on delete cascade,
  university_id  text not null default my_university() references universities(id),
  title          text not null,
  body           text not null default '',
  organiser      text,
  venue          text,
  url            text,
  starts_at      timestamptz not null,
  ends_at        timestamptz,
  created_at     timestamptz not null default now()
);
create index if not exists events_when_idx on events(university_id, starts_at);

create table if not exists event_rsvps (
  event_id    uuid not null references events(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (event_id, user_id)
);

alter table events      enable row level security;
alter table event_rsvps enable row level security;
drop policy if exists "events read"   on events;
drop policy if exists "events insert" on events;
drop policy if exists "events update" on events;
drop policy if exists "events delete" on events;
create policy "events read"   on events for select to authenticated
  using (university_id = my_university() or is_admin());
create policy "events insert" on events for insert to authenticated
  with check (user_id = auth.uid() and university_id = my_university());
create policy "events update" on events for update to authenticated
  using (user_id = auth.uid() or is_admin());
create policy "events delete" on events for delete to authenticated
  using (user_id = auth.uid() or is_admin());

drop policy if exists "event_rsvps read"   on event_rsvps;
drop policy if exists "event_rsvps insert" on event_rsvps;
drop policy if exists "event_rsvps delete" on event_rsvps;
create policy "event_rsvps read" on event_rsvps for select to authenticated
  using (exists (select 1 from events e where e.id = event_id));
create policy "event_rsvps insert" on event_rsvps for insert to authenticated
  with check (user_id = auth.uid() and exists (select 1 from events e where e.id = event_id));
create policy "event_rsvps delete" on event_rsvps for delete to authenticated
  using (user_id = auth.uid());

-- ─── brownie points ─────────────────────────────────────────────────
-- One point for every Helpful someone else gives your post, reply or past
-- paper; three when your reply is accepted as the answer. Anonymous posts
-- earn nothing (that's the price of anonymity). `since` null = all time.
create or replace function class_points(since timestamptz default null)
returns table (user_id uuid, display_name text, points int)
language sql stable security definer set search_path = public as $$
  with members as (
    select id, display_name from profiles
    where cohort_id = my_cohort() and not is_faculty
  ), earned as (
    select p.user_id, 1 as n from post_votes v join posts p on p.id = v.post_id
    where p.user_id is not null and v.user_id <> p.user_id and (since is null or v.created_at >= since)
    union all
    select r.user_id, 1 from reply_votes v join replies r on r.id = v.reply_id
    where v.user_id <> r.user_id and (since is null or v.created_at >= since)
    union all
    select pa.user_id, 1 from paper_votes v join papers pa on pa.id = v.paper_id
    where v.user_id <> pa.user_id and (since is null or v.created_at >= since)
    union all
    select r.user_id, 3 from posts p join replies r on r.id = p.answer_reply_id
    where r.user_id is distinct from coalesce(p.user_id, (select o.user_id from post_owners o where o.post_id = p.id))
      and (since is null or r.created_at >= since)
  )
  select m.id, coalesce(m.display_name, 'Someone'), sum(e.n)::int
  from earned e join members m on m.id = e.user_id
  group by m.id, m.display_name
  order by 3 desc, 2;
$$;
grant execute on function class_points(timestamptz) to authenticated;

-- ─── Google Classroom ───────────────────────────────────────────────
-- The refresh token is encrypted by the app (KEY_ENCRYPTION_SECRET) before
-- it gets here, like the Gemini keys.
create table if not exists classroom_links (
  user_id         uuid primary key references auth.users(id) on delete cascade,
  google_email    text,
  refresh_token   text not null,
  connected_at    timestamptz not null default now(),
  last_synced_at  timestamptz,
  last_error      text
);
alter table classroom_links enable row level security;
drop policy if exists "classroom_links own" on classroom_links;
create policy "classroom_links own" on classroom_links for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- coursework becomes planner to-dos, matched on the Classroom id
alter table tasks add column if not exists external_id text;
create unique index if not exists tasks_external_idx on tasks(user_id, external_id) where external_id is not null;
alter table tasks drop constraint if exists tasks_source_check;
alter table tasks add constraint tasks_source_check check (source in ('plan','manual','goal','classroom'));

-- ─── teachers post once, to as many of their classes as they like ───
create or replace function teacher_post(p_title text, p_body text, p_kind text, p_cohorts text[])
returns int language plpgsql security definer set search_path = public as $$
declare n int;
begin
  if not (is_faculty() or is_admin()) then raise exception 'Only teachers can post to several classes'; end if;
  if coalesce(trim(p_title), '') = '' then raise exception 'Give it a title.'; end if;
  if p_kind not in ('notice','resource','discussion') then raise exception 'Unknown kind of post'; end if;
  insert into posts (user_id, title, body, kind, cohort_id)
  select auth.uid(), trim(p_title), coalesce(trim(p_body), ''), p_kind, co.id
  from cohorts co
  where co.id = any(p_cohorts) and (co.university_id = my_university() or is_admin());
  get diagnostics n = row_count;
  return n;
end $$;
grant execute on function teacher_post(text, text, text, text[]) to authenticated;
