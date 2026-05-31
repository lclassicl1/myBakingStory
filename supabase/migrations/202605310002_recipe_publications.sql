-- Public recipe publication references for myBakingStory.
-- This migration is written to be safe to rerun from the Supabase SQL Editor.

update public.boards
set title = '일상 이야기',
    updated_at = now()
where key = 'free';

update public.boards
set write_permission = 'authenticated',
    updated_at = now()
where key = 'public-recipes';

do $$
declare
  seed_author_id uuid;
  seed_author_name text;
  private_recipes_board_id uuid;
begin
  -- For local testing with a specific account, add an email filter here:
  -- where use_yn = true and email = 'your-email@example.com'
  select id, display_name
  into seed_author_id, seed_author_name
  from public.profiles
  where use_yn = true
  order by created_at desc
  limit 1;

  select id
  into private_recipes_board_id
  from public.boards
  where key = 'private-recipes'
    and use_yn = true
  limit 1;

  if seed_author_id is not null and private_recipes_board_id is not null then
    insert into public.posts (
      board_id,
      author_id,
      author_display_name,
      title,
      content,
      visibility
    )
    select
      private_recipes_board_id,
      seed_author_id,
      coalesce(seed_author_name, '테스트 사용자'),
      '비공개 레시피 테스트 글',
      '로컬 테스트를 위해 migration에서 생성한 나만의 레시피 비공개 글입니다.',
      'owner-only'
    where not exists (
      select 1
      from public.posts
      where board_id = private_recipes_board_id
        and author_id = seed_author_id
        and title = '비공개 레시피 테스트 글'
        and deleted_at is null
    );
  end if;
end $$;

create table if not exists public.recipe_publications (
  id uuid primary key default gen_random_uuid(),
  source_post_id uuid not null unique references public.posts(id) on delete cascade,
  published_at timestamptz not null default now(),
  hidden_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.recipe_publications
  add column if not exists id uuid default gen_random_uuid(),
  add column if not exists source_post_id uuid,
  add column if not exists published_at timestamptz default now(),
  add column if not exists hidden_at timestamptz,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

create unique index if not exists recipe_publications_source_post_unique_idx
  on public.recipe_publications (source_post_id);
create index if not exists recipe_publications_published_idx
  on public.recipe_publications (published_at desc);

drop trigger if exists set_recipe_publications_updated_at on public.recipe_publications;
create trigger set_recipe_publications_updated_at
  before update on public.recipe_publications
  for each row
  execute function public.set_updated_at();

create or replace function public.can_manage_post(target_post_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.posts
    where posts.id = target_post_id
      and posts.deleted_at is null
      and (posts.author_id = auth.uid() or public.is_admin())
  );
$$;

create or replace function public.is_private_recipe_post(target_post_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.posts
    join public.boards on boards.id = posts.board_id
    where posts.id = target_post_id
      and posts.deleted_at is null
      and boards.key = 'private-recipes'
      and boards.use_yn = true
  );
$$;

alter table public.recipe_publications enable row level security;

drop policy if exists "posts_select_by_visibility" on public.posts;
create policy "posts_select_by_visibility"
  on public.posts
  for select
  to authenticated
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
          or (
            boards.key = 'private-recipes'
            and posts.visibility = 'public'
            and exists (
              select 1
              from public.recipe_publications
              where recipe_publications.source_post_id = posts.id
                and recipe_publications.hidden_at is null
            )
          )
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
          or (boards.key = 'private-recipes' and posts.visibility = 'public')
        )
    )
  );

drop policy if exists "recipe_publications_select_authenticated" on public.recipe_publications;
create policy "recipe_publications_select_authenticated"
  on public.recipe_publications
  for select
  to authenticated
  using (true);

drop policy if exists "recipe_publications_insert_author_or_admin" on public.recipe_publications;
create policy "recipe_publications_insert_author_or_admin"
  on public.recipe_publications
  for insert
  to authenticated
  with check (
    public.can_manage_post(source_post_id)
    and public.is_private_recipe_post(source_post_id)
  );

drop policy if exists "recipe_publications_update_author_or_admin" on public.recipe_publications;
create policy "recipe_publications_update_author_or_admin"
  on public.recipe_publications
  for update
  to authenticated
  using (public.can_manage_post(source_post_id))
  with check (
    public.can_manage_post(source_post_id)
    and public.is_private_recipe_post(source_post_id)
  );
