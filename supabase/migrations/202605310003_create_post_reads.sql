-- Per-user post read tracking for myBakingStory.
-- This migration is written to be safe to rerun from the Supabase SQL Editor.

create table if not exists public.post_reads (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  read_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (post_id, user_id)
);

alter table public.post_reads
  add column if not exists id uuid default gen_random_uuid(),
  add column if not exists post_id uuid,
  add column if not exists user_id uuid,
  add column if not exists read_at timestamptz default now(),
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

create unique index if not exists post_reads_post_user_unique_idx
  on public.post_reads (post_id, user_id);
create index if not exists post_reads_user_read_idx
  on public.post_reads (user_id, read_at desc);

drop trigger if exists set_post_reads_updated_at on public.post_reads;
create trigger set_post_reads_updated_at
  before update on public.post_reads
  for each row
  execute function public.set_updated_at();

alter table public.post_reads enable row level security;

drop policy if exists "post_reads_select_own" on public.post_reads;
create policy "post_reads_select_own"
  on public.post_reads
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "post_reads_insert_own" on public.post_reads;
create policy "post_reads_insert_own"
  on public.post_reads
  for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "post_reads_update_own" on public.post_reads;
create policy "post_reads_update_own"
  on public.post_reads
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
