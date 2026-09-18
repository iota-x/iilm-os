-- ════════════════════════════════════════════════════════════════════
-- 005 — the whole section on one app: accounts, and a class board
-- ════════════════════════════════════════════════════════════════════

-- ─── accounts ───────────────────────────────────────────────────────
-- Everyone is created by scripts/onboard.ts with the same starting password,
-- so until they change it anyone who knows the default could sign in as
-- anyone. must_change_password gates the app behind /welcome until then.

alter table profiles
  add column if not exists section              text,
  add column if not exists must_change_password boolean not null default false;

-- Classmates need each other's names on the board, and nothing else from
-- profiles. A view owned by postgres bypasses profiles' own-row-only RLS
-- and exposes exactly two columns.
create or replace view member_names
  with (security_invoker = false) as
  select id, display_name from profiles;
grant select on member_names to authenticated;

-- ─── class board ────────────────────────────────────────────────────
-- The first shared tables. Every other table is one person's data; these
-- are readable by the whole section. Subjects are referenced by slug, not
-- id, because each account owns its own copy of the subject rows.

create table if not exists posts (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  subject_slug  text,
  kind          text not null default 'discussion'
                check (kind in ('discussion','question','resource','notice')),
  title         text not null,
  body          text not null default '',
  url           text,
  pinned        boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists posts_created_idx on posts(created_at desc);
create index if not exists posts_subject_idx on posts(subject_slug);

create table if not exists replies (
  id          uuid primary key default gen_random_uuid(),
  post_id     uuid not null references posts(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  body        text not null,
  created_at  timestamptz not null default now()
);
create index if not exists replies_post_idx on replies(post_id, created_at);

alter table posts   enable row level security;
alter table replies enable row level security;

-- read: anyone signed in. write: your own rows only.
drop policy if exists "posts read"   on posts;
drop policy if exists "posts insert" on posts;
drop policy if exists "posts update" on posts;
drop policy if exists "posts delete" on posts;
create policy "posts read"   on posts for select to authenticated using (true);
create policy "posts insert" on posts for insert to authenticated with check (user_id = auth.uid());
create policy "posts update" on posts for update to authenticated using (user_id = auth.uid());
create policy "posts delete" on posts for delete to authenticated using (user_id = auth.uid());

drop policy if exists "replies read"   on replies;
drop policy if exists "replies insert" on replies;
drop policy if exists "replies delete" on replies;
create policy "replies read"   on replies for select to authenticated using (true);
create policy "replies insert" on replies for insert to authenticated with check (user_id = auth.uid());
create policy "replies delete" on replies for delete to authenticated using (user_id = auth.uid());
