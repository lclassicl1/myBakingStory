-- Boards and posts for myBakingStory.
-- This migration is written to be safe to rerun from the Supabase SQL Editor.

create table if not exists public.boards (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  title text not null,
  description text not null,
  visibility text not null default 'public' check (visibility in ('public', 'owner-only')),
  write_permission text not null default 'authenticated' check (write_permission in ('none', 'authenticated', 'admin')),
  display_order integer not null default 0,
  use_yn boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.boards(id) on delete restrict,
  author_id uuid not null references auth.users(id) on delete cascade,
  author_display_name text not null,
  title text not null check (char_length(trim(title)) between 1 and 120),
  content text not null check (char_length(trim(content)) between 1 and 20000),
  visibility text not null default 'public' check (visibility in ('public', 'owner-only')),
  comment_count integer not null default 0 check (comment_count >= 0),
  like_count integer not null default 0 check (like_count >= 0),
  bookmark_count integer not null default 0 check (bookmark_count >= 0),
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.boards
  add column if not exists id uuid default gen_random_uuid(),
  add column if not exists key text,
  add column if not exists title text,
  add column if not exists description text,
  add column if not exists visibility text default 'public',
  add column if not exists write_permission text default 'authenticated',
  add column if not exists display_order integer default 0,
  add column if not exists use_yn boolean default true,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

alter table public.posts
  add column if not exists id uuid default gen_random_uuid(),
  add column if not exists board_id uuid,
  add column if not exists author_id uuid,
  add column if not exists author_display_name text,
  add column if not exists title text,
  add column if not exists content text,
  add column if not exists visibility text default 'public',
  add column if not exists comment_count integer default 0,
  add column if not exists like_count integer default 0,
  add column if not exists bookmark_count integer default 0,
  add column if not exists deleted_at timestamptz,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

create unique index if not exists boards_key_unique_idx on public.boards (key);
create index if not exists boards_use_order_idx on public.boards (use_yn, display_order);
create index if not exists posts_board_created_idx on public.posts (board_id, created_at desc) where deleted_at is null;
create index if not exists posts_author_created_idx on public.posts (author_id, created_at desc) where deleted_at is null;

insert into public.boards (key, title, description, visibility, write_permission, display_order, use_yn)
values
  ('notice', '공지사항', '서비스 소식과 운영 안내', 'public', 'admin', 10, true),
  ('public-recipes', '모두의 레시피', '함께 나누는 베이킹 레시피', 'public', 'none', 20, true),
  ('private-recipes', '나만의 레시피', '내가 기록한 개인 레시피', 'owner-only', 'authenticated', 30, true),
  ('free', '자유게시판', '베이킹 이야기와 일상 대화', 'public', 'authenticated', 40, true),
  ('events', '이벤트 게시판', '진행 중인 이벤트와 발표', 'public', 'none', 50, true),
  ('suggestions', '건의 게시판', '더 나은 서비스를 위한 제안', 'public', 'authenticated', 60, true)
on conflict (key) do update
set title = excluded.title,
    description = excluded.description,
    visibility = excluded.visibility,
    write_permission = excluded.write_permission,
    display_order = excluded.display_order,
    use_yn = excluded.use_yn,
    updated_at = now();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_boards_updated_at on public.boards;
create trigger set_boards_updated_at
  before update on public.boards
  for each row
  execute function public.set_updated_at();

drop trigger if exists set_posts_updated_at on public.posts;
create trigger set_posts_updated_at
  before update on public.posts
  for each row
  execute function public.set_updated_at();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
      and use_yn = true
  );
$$;

alter table public.boards enable row level security;
alter table public.posts enable row level security;

drop policy if exists "boards_select_active" on public.boards;
create policy "boards_select_active"
  on public.boards
  for select
  to anon, authenticated
  using (use_yn = true);

drop policy if exists "posts_select_by_visibility" on public.posts;
create policy "posts_select_by_visibility"
  on public.posts
  for select
  to anon, authenticated
  using (
    deleted_at is null
    and exists (
      select 1
      from public.boards
      where boards.id = posts.board_id
        and boards.use_yn = true
        and (
          boards.visibility = 'public'
          or posts.author_id = auth.uid()
          or public.is_admin()
        )
    )
  );

drop policy if exists "posts_insert_by_board_permission" on public.posts;
create policy "posts_insert_by_board_permission"
  on public.posts
  for insert
  to authenticated
  with check (
    author_id = auth.uid()
    and deleted_at is null
    and exists (
      select 1
      from public.boards
      where boards.id = posts.board_id
        and boards.use_yn = true
        and (
          boards.write_permission = 'authenticated'
          or (boards.write_permission = 'admin' and public.is_admin())
        )
        and (
          boards.visibility = 'public'
          or posts.visibility = 'owner-only'
        )
    )
  );

drop policy if exists "posts_update_author_or_admin" on public.posts;
create policy "posts_update_author_or_admin"
  on public.posts
  for update
  to authenticated
  using (author_id = auth.uid() or public.is_admin())
  with check (author_id = auth.uid() or public.is_admin());

drop policy if exists "posts_delete_admin_only" on public.posts;
create policy "posts_delete_admin_only"
  on public.posts
  for delete
  to authenticated
  using (public.is_admin());
