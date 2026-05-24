-- User profile table for myBakingStory.
-- Passwords are intentionally not stored here. Supabase Auth stores password
-- hashes in the private auth schema.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  display_name text not null,
  role text not null default 'user' check (role in ('user', 'admin')),
  member_grade text not null default 'basic',
  member_points integer not null default 0 check (member_points >= 0),
  use_yn boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- If the table was created manually before this script was run, CREATE TABLE IF
-- NOT EXISTS will not add missing columns. Keep the table compatible with the
-- signup trigger without requiring the user to drop/recreate it.
alter table public.profiles
  add column if not exists id uuid,
  add column if not exists email text,
  add column if not exists display_name text,
  add column if not exists role text default 'user',
  add column if not exists member_grade text default 'basic',
  add column if not exists member_points integer default 0,
  add column if not exists use_yn boolean default true,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

update public.profiles
set
  role = coalesce(role, 'user'),
  member_grade = coalesce(member_grade, 'basic'),
  member_points = coalesce(member_points, 0),
  use_yn = coalesce(use_yn, true),
  created_at = coalesce(created_at, now()),
  updated_at = coalesce(updated_at, now())
where
  role is null
  or member_grade is null
  or member_points is null
  or use_yn is null
  or created_at is null
  or updated_at is null;

create unique index if not exists profiles_email_unique_idx
  on public.profiles (email)
  where email is not null;

comment on table public.profiles is 'Application-level user profile data linked to Supabase Auth users.';
comment on column public.profiles.id is 'References auth.users.id.';
comment on column public.profiles.email is 'Login identifier. Kept in sync from auth.users.email.';
comment on column public.profiles.display_name is 'User display name or nickname.';
comment on column public.profiles.role is 'Authorization role. user or admin.';
comment on column public.profiles.member_grade is 'Membership grade for future grade system.';
comment on column public.profiles.member_points is 'Membership points for future grade automation.';
comment on column public.profiles.use_yn is 'Whether the user account is active in the app.';

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  metadata_name text;
  fallback_name text;
begin
  metadata_name = coalesce(
    nullif(new.raw_user_meta_data ->> 'nickname', ''),
    nullif(new.raw_user_meta_data ->> 'name', ''),
    nullif(new.raw_user_meta_data ->> 'full_name', '')
  );

  fallback_name = split_part(coalesce(new.email, 'user'), '@', 1);

  insert into public.profiles (
    id,
    email,
    display_name,
    role,
    member_grade,
    member_points,
    use_yn
  )
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(metadata_name, fallback_name),
    'user',
    'basic',
    0,
    true
  )
  on conflict (id) do update
    set email = excluded.email,
        display_name = excluded.display_name,
        updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_create_profile on auth.users;
create trigger on_auth_user_created_create_profile
  after insert on auth.users
  for each row
  execute function public.handle_new_user_profile();

insert into public.profiles (
  id,
  email,
  display_name,
  role,
  member_grade,
  member_points,
  use_yn
)
select
  users.id,
  coalesce(users.email, ''),
  coalesce(
    nullif(users.raw_user_meta_data ->> 'nickname', ''),
    nullif(users.raw_user_meta_data ->> 'name', ''),
    nullif(users.raw_user_meta_data ->> 'full_name', ''),
    split_part(coalesce(users.email, 'user'), '@', 1)
  ),
  'user',
  'basic',
  0,
  true
from auth.users as users
on conflict (id) do nothing;
