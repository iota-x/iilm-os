-- ════════════════════════════════════════════════════════════════════
-- 009 — an admin, a better board, and Ask that remembers
-- ════════════════════════════════════════════════════════════════════

-- ─── admin ──────────────────────────────────────────────────────────
-- One person runs this for the section. They can delete or pin any post,
-- and see the maintenance bits in Settings. Nothing else is different.
alter table profiles add column if not exists is_admin boolean not null default false;

create or replace function is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select is_admin from profiles where id = auth.uid()), false);
$$;

-- ─── board: admins moderate, questions get answers, posts carry an image ─
alter table posts
  add column if not exists answer_reply_id uuid references replies(id) on delete set null,
  add column if not exists image_path text;

drop policy if exists "posts update" on posts;
drop policy if exists "posts delete" on posts;
create policy "posts update" on posts for update to authenticated
  using (user_id = auth.uid() or is_admin());
create policy "posts delete" on posts for delete to authenticated
  using (user_id = auth.uid() or is_admin());

drop policy if exists "replies delete" on replies;
create policy "replies delete" on replies for delete to authenticated
  using (user_id = auth.uid() or is_admin());

-- Images on the board are for the section, so they live in their own bucket
-- that anyone with the link can read. Paths are <user_id>/<random>.jpg, so
-- links are unguessable; the vault stays private as before.
insert into storage.buckets (id, name, public, file_size_limit)
values ('board', 'board', true, 5242880)
on conflict (id) do nothing;

drop policy if exists "board read" on storage.objects;
drop policy if exists "board insert" on storage.objects;
drop policy if exists "board delete" on storage.objects;
create policy "board read" on storage.objects for select
  using (bucket_id = 'board');
create policy "board insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'board' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "board delete" on storage.objects for delete to authenticated
  using (bucket_id = 'board' and ((storage.foldername(name))[1] = auth.uid()::text or is_admin()));

-- ─── ask: conversations persist ─────────────────────────────────────
create table if not exists ask_threads (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  title       text not null default 'New conversation',
  messages    jsonb not null default '[]'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists ask_threads_user_idx on ask_threads(user_id, updated_at desc);
alter table ask_threads enable row level security;
drop policy if exists "ask_threads own" on ask_threads;
create policy "ask_threads own" on ask_threads for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
