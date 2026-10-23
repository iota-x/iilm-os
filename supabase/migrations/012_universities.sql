-- ════════════════════════════════════════════════════════════════════
-- 012 — many universities: who belongs where, and a board per class
-- ════════════════════════════════════════════════════════════════════
-- Semwise started as one section's app. From here every account belongs to
-- a university and a class (cohort) inside it. The list of both lives in
-- src/lib/universities.ts; these tables mirror it (`npm run tenants`) so
-- profiles and the board's policies can refer to them. Every account made
-- before this is IILM B.Tech CSE Semester I, Section E — and is backfilled so.

-- ─── universities and their classes ─────────────────────────────────
create table if not exists universities (
  id             text primary key,
  name           text not null,
  short_name     text not null,
  city           text,
  email_domains  text[] not null default '{}',
  active         boolean not null default true,
  created_at     timestamptz not null default now()
);

create table if not exists cohorts (
  id             text primary key,
  university_id  text not null references universities(id) on delete cascade,
  programme      text not null,
  semester       smallint not null,
  section        text,
  batch          text,
  lab_groups     smallint[] not null default '{}',
  catalog        text,
  active         boolean not null default true,
  created_at     timestamptz not null default now()
);
create index if not exists cohorts_university_idx on cohorts(university_id);

-- the sign-up page lists them, before anyone is signed in
alter table universities enable row level security;
alter table cohorts      enable row level security;
drop policy if exists "universities read" on universities;
drop policy if exists "cohorts read"      on cohorts;
create policy "universities read" on universities for select to anon, authenticated using (active);
create policy "cohorts read"      on cohorts      for select to anon, authenticated using (active);

insert into universities (id, name, short_name, city, email_domains, active) values
  ('iilm-gurugram', 'IILM University, Gurugram', 'IILM University', 'Gurugram', array['gg.iilm.edu'], true)
on conflict (id) do update set name = excluded.name, short_name = excluded.short_name, city = excluded.city, email_domains = excluded.email_domains, active = excluded.active;
insert into cohorts (id, university_id, programme, semester, section, batch, lab_groups, catalog, active) values
  ('iilm-gurugram/btech-cse-2026/s1/a', 'iilm-gurugram', 'B.Tech CSE', 1, 'A', '2026-30', array[1, 2]::smallint[], 'iilm-btech-cse-s1', true),
  ('iilm-gurugram/btech-cse-2026/s1/b', 'iilm-gurugram', 'B.Tech CSE', 1, 'B', '2026-30', array[1, 2]::smallint[], 'iilm-btech-cse-s1', true),
  ('iilm-gurugram/btech-cse-2026/s1/c', 'iilm-gurugram', 'B.Tech CSE', 1, 'C', '2026-30', array[1, 2]::smallint[], 'iilm-btech-cse-s1', true),
  ('iilm-gurugram/btech-cse-2026/s1/d', 'iilm-gurugram', 'B.Tech CSE', 1, 'D', '2026-30', array[1, 2]::smallint[], 'iilm-btech-cse-s1', true),
  ('iilm-gurugram/btech-cse-2026/s1/e', 'iilm-gurugram', 'B.Tech CSE', 1, 'E', '2026-30', array[1, 2]::smallint[], 'iilm-btech-cse-s1', true),
  ('iilm-gurugram/btech-cse-2026/s1/f', 'iilm-gurugram', 'B.Tech CSE', 1, 'F', '2026-30', array[1, 2]::smallint[], 'iilm-btech-cse-s1', true),
  ('iilm-gurugram/btech-cse-2026/s1/g', 'iilm-gurugram', 'B.Tech CSE', 1, 'G', '2026-30', array[1, 2]::smallint[], 'iilm-btech-cse-s1', true),
  ('iilm-gurugram/btech-cse-2026/s1/h', 'iilm-gurugram', 'B.Tech CSE', 1, 'H', '2026-30', array[1, 2]::smallint[], 'iilm-btech-cse-s1', true),
  ('iilm-gurugram/btech-cse-2026/s1/i', 'iilm-gurugram', 'B.Tech CSE', 1, 'I', '2026-30', array[1, 2]::smallint[], 'iilm-btech-cse-s1', true),
  ('iilm-gurugram/btech-cse-2026/s1/j', 'iilm-gurugram', 'B.Tech CSE', 1, 'J', '2026-30', array[1, 2]::smallint[], 'iilm-btech-cse-s1', true),
  ('iilm-gurugram/other', 'iilm-gurugram', 'Another programme', 1, null, null, array[]::smallint[], null, true)
on conflict (id) do update set university_id = excluded.university_id, programme = excluded.programme, semester = excluded.semester, section = excluded.section, batch = excluded.batch, lab_groups = excluded.lab_groups, catalog = excluded.catalog, active = excluded.active;

-- ─── profiles: which university and class ───────────────────────────
alter table profiles
  add column if not exists university_id text references universities(id),
  add column if not exists cohort_id     text references cohorts(id);

update profiles set university_id = 'iilm-gurugram' where university_id is null;
update profiles set cohort_id = 'iilm-gurugram/btech-cse-2026/s1/e' where cohort_id is null;

-- lab groups were 1 or 2 because Section E had two; other classes have more
alter table profiles drop constraint if exists profiles_lab_group_check;
alter table profiles add constraint profiles_lab_group_check check (lab_group between 1 and 12);

create or replace function my_cohort() returns text
language sql stable security definer set search_path = public as $$
  select cohort_id from profiles where id = auth.uid();
$$;

create or replace function my_university() returns text
language sql stable security definer set search_path = public as $$
  select university_id from profiles where id = auth.uid();
$$;

-- ─── the class board: one per class ─────────────────────────────────
-- A post belongs to the class it was written in; only that class (and the
-- admin) can see it. New posts take the author's class without the app
-- having to say so.
alter table posts add column if not exists cohort_id text references cohorts(id);
update posts set cohort_id = 'iilm-gurugram/btech-cse-2026/s1/e' where cohort_id is null;
alter table posts alter column cohort_id set default my_cohort();
alter table posts alter column cohort_id set not null;
create index if not exists posts_cohort_idx on posts(cohort_id, created_at desc);

drop policy if exists "posts read"   on posts;
drop policy if exists "posts insert" on posts;
create policy "posts read"   on posts for select to authenticated
  using (cohort_id = my_cohort() or is_admin());
create policy "posts insert" on posts for insert to authenticated
  with check (user_id = auth.uid() and cohort_id = my_cohort());

-- replies and votes follow their post: visible only where the post is
drop policy if exists "replies read"   on replies;
drop policy if exists "replies insert" on replies;
create policy "replies read"   on replies for select to authenticated
  using (exists (select 1 from posts p where p.id = post_id));
create policy "replies insert" on replies for insert to authenticated
  with check (user_id = auth.uid() and exists (select 1 from posts p where p.id = post_id));

drop policy if exists "post_votes read"   on post_votes;
drop policy if exists "post_votes insert" on post_votes;
create policy "post_votes read"   on post_votes for select to authenticated
  using (exists (select 1 from posts p where p.id = post_id));
create policy "post_votes insert" on post_votes for insert to authenticated
  with check (user_id = auth.uid() and exists (select 1 from posts p where p.id = post_id));

drop policy if exists "reply_votes read"   on reply_votes;
drop policy if exists "reply_votes insert" on reply_votes;
create policy "reply_votes read"   on reply_votes for select to authenticated
  using (exists (select 1 from replies r where r.id = reply_id));
create policy "reply_votes insert" on reply_votes for insert to authenticated
  with check (user_id = auth.uid() and exists (select 1 from replies r where r.id = reply_id));

-- names on the board: only people at your own university
create or replace view member_names
  with (security_invoker = false) as
  select id, display_name from profiles
  where university_id = my_university() or id = auth.uid() or is_admin();
grant select on member_names to authenticated;

-- ─── waitlist: colleges we're not at yet ────────────────────────────
-- Written by the sign-up route with the service role; nobody reads it from
-- the app, so RLS is on with no policies.
create table if not exists waitlist (
  email       text primary key,
  domain      text not null,
  college     text,
  created_at  timestamptz not null default now()
);
create index if not exists waitlist_domain_idx on waitlist(domain);
alter table waitlist enable row level security;
