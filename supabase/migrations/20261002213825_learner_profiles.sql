-- Learner profiles, filled in by the onboarding flow after sign-up.
-- One row per auth user. Learners can only read and change their own row.

create schema if not exists private;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text check (char_length(display_name) between 1 and 60),
  -- Object path inside the `avatars` bucket, e.g. '<user id>/avatar-1696262400.webp'.
  avatar_path text check (char_length(avatar_path) <= 200),
  bio text check (char_length(bio) <= 280),
  experience text check (experience in ('new', 'some', 'professional')),
  goals text[] not null default '{}' check (
    cardinality(goals) <= 6
    and goals <@ array['first-job', 'career-switch', 'level-up', 'side-project', 'interviews', 'freelance']
  ),
  goal_note text check (char_length(goal_note) <= 280),
  -- Null until the learner finishes onboarding; the app sends them back until it is set.
  onboarded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Learner profile from onboarding: avatar, bio and goals.';

create function private.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function private.set_updated_at();

alter table public.profiles enable row level security;

create policy "Learners can read their own profile"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "Learners can create their own profile"
  on public.profiles for insert
  to authenticated
  with check ((select auth.uid()) = id);

create policy "Learners can update their own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- New tables are not always exposed to the Data API, so grant explicitly.
-- No delete: the row goes away with the auth user (on delete cascade).
revoke all on public.profiles from anon, authenticated;
grant select, insert, update on public.profiles to authenticated;

-- Avatars: public to read (shown on the site), writable only inside the learner's own folder.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 2097152, array['image/png', 'image/jpeg', 'image/webp', 'image/gif'])
on conflict (id) do nothing;

create policy "Learners can upload their own avatar"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- Upserts and the cleanup of old avatars need select, update and delete too.
create policy "Learners can see their own avatar files"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Learners can replace their own avatar"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Learners can delete their own avatar"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
