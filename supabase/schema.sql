-- Solar Installer Lead-Tracker demo schema.
-- Run this once in your Supabase project's SQL editor (Studio -> SQL Editor -> New query).
-- Safe to re-run: uses IF NOT EXISTS / OR REPLACE / DROP ... IF EXISTS where sensible.

-- ============================================================================
-- profiles: maps a username to an auth.users row so users can log in with
-- either their email or their username.
-- ============================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (id = auth.uid());

-- No insert/update/delete policies for regular users: profile rows are only
-- ever written by the handle_new_user trigger below (as the table owner,
-- which bypasses RLS), not directly by clients.

-- Populate profiles automatically whenever a new auth user is created —
-- whether that's the app's own sign-up (which can pass a chosen username as
-- user metadata: supabase.auth.signUp({ email, password, options: { data: {
-- username } } })) or a user added manually in Studio (Authentication ->
-- Add user), which sets no metadata at all.
--
-- `profiles.username` is NOT NULL, so if no username was supplied this must
-- fall back to something rather than insert null — otherwise this trigger
-- fails, which rolls back the entire user creation with a generic "Database
-- error creating new user". The fallback is derived from the user's id, so
-- it's always unique and never fails. Update it to something friendlier
-- afterward with:
--   update public.profiles set username = 'testuser1' where id = '<uid>';
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'username', 'user_' || replace(new.id::text, '-', ''))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Resolves a username to the email Supabase Auth needs for
-- signInWithPassword(). Callable by anonymous (not-yet-authenticated)
-- requests, since it runs before login. Returns only the email — never any
-- other profile/user data — and returns null for an unknown username so the
-- app can show one generic "invalid credentials" message either way.
create or replace function public.login_lookup_email(p_username text)
returns text
language sql
security definer
set search_path = public
stable
as $$
  select u.email
  from public.profiles p
  join auth.users u on u.id = p.id
  where p.username = p_username
  limit 1;
$$;

revoke all on function public.login_lookup_email(text) from public;
grant execute on function public.login_lookup_email(text) to anon, authenticated;

-- ============================================================================
-- leads
-- ============================================================================
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  email text,
  phone text,
  source text,
  stage text not null default 'new' check (stage in ('new', 'contacted', 'signed')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists leads_user_id_idx on public.leads (user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists leads_set_updated_at on public.leads;
create trigger leads_set_updated_at
  before update on public.leads
  for each row execute function public.set_updated_at();

alter table public.leads enable row level security;

-- This is the actual security boundary for "each user sees only their own
-- leads, even via a direct API call": every operation is scoped to rows
-- where user_id = auth.uid(). WITH CHECK also blocks inserting/updating a
-- row to point at someone else's user_id, even if a client tried to send one.
drop policy if exists "leads_select_own" on public.leads;
create policy "leads_select_own"
  on public.leads for select
  using (user_id = auth.uid());

drop policy if exists "leads_insert_own" on public.leads;
create policy "leads_insert_own"
  on public.leads for insert
  with check (user_id = auth.uid());

drop policy if exists "leads_update_own" on public.leads;
create policy "leads_update_own"
  on public.leads for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "leads_delete_own" on public.leads;
create policy "leads_delete_own"
  on public.leads for delete
  using (user_id = auth.uid());
