-- "Helpful" on posts and replies. One per person per thing; readable by
-- everyone signed in, and you can only add or remove your own.

create table if not exists post_votes (
  post_id     uuid not null references posts(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (post_id, user_id)
);
create table if not exists reply_votes (
  reply_id    uuid not null references replies(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (reply_id, user_id)
);

alter table post_votes  enable row level security;
alter table reply_votes enable row level security;

drop policy if exists "post_votes read"   on post_votes;
drop policy if exists "post_votes insert" on post_votes;
drop policy if exists "post_votes delete" on post_votes;
create policy "post_votes read"   on post_votes for select to authenticated using (true);
create policy "post_votes insert" on post_votes for insert to authenticated with check (user_id = auth.uid());
create policy "post_votes delete" on post_votes for delete to authenticated using (user_id = auth.uid());

drop policy if exists "reply_votes read"   on reply_votes;
drop policy if exists "reply_votes insert" on reply_votes;
drop policy if exists "reply_votes delete" on reply_votes;
create policy "reply_votes read"   on reply_votes for select to authenticated using (true);
create policy "reply_votes insert" on reply_votes for insert to authenticated with check (user_id = auth.uid());
create policy "reply_votes delete" on reply_votes for delete to authenticated using (user_id = auth.uid());
