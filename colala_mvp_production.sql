-- Colalá MVP production migration
-- Paste this file into the Supabase SQL Editor and run it top to bottom.
-- It is written to be resilient against partially-created schemas.

-- ============================================================================
-- 1. Extensions
-- ============================================================================
-- Required for UUID generation.
create extension if not exists pgcrypto;

-- ============================================================================
-- 2. Functions
-- ============================================================================
-- Shared helpers for admin checks, slugs, updated_at and auth bootstrap.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1
    from public.admins a
    where a.user_id = auth.uid()
  );
$$;

create or replace function public.slugify_text(value text)
returns text
language sql
immutable
as $$
  select trim(
    both '-' from lower(
      regexp_replace(coalesce(value, ''), '[^a-zA-Z0-9]+', '-', 'g')
    )
  );
$$;

create or replace function public.make_unique_slug(base_value text, row_id uuid)
returns text
language sql
immutable
as $$
  select
    case
      when coalesce(public.slugify_text(base_value), '') = '' then 'item'
      else public.slugify_text(base_value)
    end
    || '-' || left(row_id::text, 8);
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.set_category_slug()
returns trigger
language plpgsql
as $$
begin
  if new.slug is null or new.slug = '' then
    new.slug := public.make_unique_slug(new.name, new.id);
  end if;
  return new;
end;
$$;

create or replace function public.set_place_slug()
returns trigger
language plpgsql
as $$
begin
  if new.slug is null or new.slug = '' then
    new.slug := public.make_unique_slug(new.name, new.id);
  end if;
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  base_username text;
  generated_username text;
begin
  base_username := public.slugify_text(
    coalesce(
      new.raw_user_meta_data ->> 'username',
      split_part(coalesce(new.email, 'user'), '@', 1),
      'user'
    )
  );

  if base_username = '' then
    base_username := 'user';
  end if;

  generated_username := base_username || '-' || left(new.id::text, 8);

  insert into public.profiles (
    id,
    name,
    username,
    bio,
    avatar_url,
    city,
    instagram,
    created_at,
    updated_at
  )
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      split_part(coalesce(new.email, 'user'), '@', 1)
    ),
    generated_username,
    null,
    new.raw_user_meta_data ->> 'avatar_url',
    null,
    null,
    now(),
    now()
  )
  on conflict (id) do update set
    name = coalesce(excluded.name, public.profiles.name),
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
    updated_at = now();

  return new;
end;
$$;

-- ============================================================================
-- 3. Tables
-- ============================================================================
-- Core tables for the Colalá MVP.

create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  username text not null,
  bio text,
  avatar_url text,
  city text,
  instagram text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  description text,
  icon text,
  color text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.places (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  slug text not null,
  description text,
  city text,
  neighborhood text,
  address text,
  adress text,
  latitude double precision,
  longitude double precision,
  rating numeric(3,2) default 0,
  price_level smallint,
  opening_hours text,
  instagram text,
  phone text,
  website text,
  cover_image text,
  gallery text[] not null default '{}'::text[],
  featured boolean not null default false,
  work_friendly boolean not null default false,
  wifi boolean not null default false,
  pet_friendly boolean not null default false,
  sunset boolean not null default false,
  category_id uuid references public.categories(id) on delete set null,
  status text not null default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  place_id uuid not null references public.places(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  place_id uuid not null references public.places(id) on delete cascade,
  rating smallint not null,
  comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- 4. Column Safety / Backfill
-- ============================================================================
-- Add missing columns when the database already contains an earlier version.

alter table public.profiles
  add column if not exists bio text;
alter table public.profiles
  add column if not exists city text;
alter table public.profiles
  add column if not exists instagram text;

alter table public.categories
  add column if not exists slug text;
alter table public.categories
  add column if not exists description text;
alter table public.categories
  add column if not exists icon text;
alter table public.categories
  add column if not exists color text;
alter table public.categories
  add column if not exists sort_order integer not null default 0;

alter table public.places
  add column if not exists slug text;
alter table public.places
  add column if not exists neighborhood text;
alter table public.places
  add column if not exists address text;
alter table public.places
  add column if not exists adress text;
alter table public.places
  add column if not exists latitude double precision;
alter table public.places
  add column if not exists longitude double precision;
alter table public.places
  add column if not exists featured boolean not null default false;
alter table public.places
  add column if not exists work_friendly boolean not null default false;
alter table public.places
  add column if not exists wifi boolean not null default false;
alter table public.places
  add column if not exists pet_friendly boolean not null default false;
alter table public.places
  add column if not exists sunset boolean not null default false;
alter table public.places
  add column if not exists category_id uuid;
alter table public.places
  add column if not exists status text not null default 'published';

alter table public.favorites
  add column if not exists updated_at timestamptz not null default now();
alter table public.reviews
  add column if not exists updated_at timestamptz not null default now();

-- ============================================================================
-- 5. Constraints
-- ============================================================================
-- Drop and recreate checks so the migration can be re-run safely.

alter table public.profiles
  drop constraint if exists profiles_username_length_check;
alter table public.profiles
  add constraint profiles_username_length_check
  check (char_length(username) >= 3);

alter table public.categories
  drop constraint if exists categories_name_length_check;
alter table public.categories
  add constraint categories_name_length_check
  check (char_length(trim(name)) >= 2);

alter table public.categories
  drop constraint if exists categories_slug_length_check;
alter table public.categories
  add constraint categories_slug_length_check
  check (char_length(trim(slug)) >= 2);

alter table public.places
  drop constraint if exists places_rating_check;
alter table public.places
  add constraint places_rating_check
  check (rating >= 0 and rating <= 5);

alter table public.places
  drop constraint if exists places_price_level_check;
alter table public.places
  add constraint places_price_level_check
  check (price_level is null or price_level in (1, 2, 3, 4));

alter table public.places
  drop constraint if exists places_status_check;
alter table public.places
  add constraint places_status_check
  check (status in ('published', 'pending', 'rejected'));

alter table public.places
  drop constraint if exists places_latitude_check;
alter table public.places
  add constraint places_latitude_check
  check (latitude is null or latitude between -90 and 90);

alter table public.places
  drop constraint if exists places_longitude_check;
alter table public.places
  add constraint places_longitude_check
  check (longitude is null or longitude between -180 and 180);

alter table public.favorites
  drop constraint if exists favorites_unique_user_place;
alter table public.favorites
  add constraint favorites_unique_user_place
  unique (user_id, place_id);

alter table public.reviews
  drop constraint if exists reviews_unique_user_place;
alter table public.reviews
  add constraint reviews_unique_user_place
  unique (user_id, place_id);

alter table public.reviews
  drop constraint if exists reviews_rating_check;
alter table public.reviews
  add constraint reviews_rating_check
  check (rating between 1 and 5);

-- Unique indexes for user-friendly lookups.
create unique index if not exists profiles_username_unique_idx
  on public.profiles (lower(username));
create unique index if not exists categories_slug_unique_idx
  on public.categories (slug);
create unique index if not exists places_slug_unique_idx
  on public.places (slug);

-- ============================================================================
-- 6. Foreign Keys
-- ============================================================================
-- FKs are declared inline in table definitions above.

-- ============================================================================
-- 7. Indexes
-- ============================================================================
-- Performance for search, filters and discovery feeds.

create index if not exists categories_sort_order_idx
  on public.categories (sort_order asc, created_at desc);
create index if not exists places_city_idx
  on public.places (city);
create index if not exists places_category_id_idx
  on public.places (category_id);
create index if not exists places_featured_idx
  on public.places (featured)
  where featured = true;
create index if not exists places_created_at_idx
  on public.places (created_at desc);
create index if not exists places_latitude_idx
  on public.places (latitude);
create index if not exists places_longitude_idx
  on public.places (longitude);
create index if not exists places_search_idx
  on public.places using gin (
    to_tsvector(
      'simple',
      coalesce(name, '') || ' ' || coalesce(description, '') || ' ' || coalesce(city, '') || ' ' || coalesce(neighborhood, '')
    )
  );
create index if not exists favorites_user_id_idx
  on public.favorites (user_id);
create index if not exists favorites_place_id_idx
  on public.favorites (place_id);
create index if not exists reviews_user_id_idx
  on public.reviews (user_id);
create index if not exists reviews_place_id_idx
  on public.reviews (place_id);
create index if not exists reviews_created_at_idx
  on public.reviews (created_at desc);
create index if not exists reviews_rating_idx
  on public.reviews (rating);
create index if not exists admins_user_id_idx
  on public.admins (user_id);

-- ============================================================================
-- 8. Triggers
-- ============================================================================
-- Keep timestamps, slugs and auth bootstrap in sync automatically.

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists trg_categories_updated_at on public.categories;
create trigger trg_categories_updated_at
before update on public.categories
for each row
execute function public.set_updated_at();

drop trigger if exists trg_places_updated_at on public.places;
create trigger trg_places_updated_at
before update on public.places
for each row
execute function public.set_updated_at();

drop trigger if exists trg_favorites_updated_at on public.favorites;
create trigger trg_favorites_updated_at
before update on public.favorites
for each row
execute function public.set_updated_at();

drop trigger if exists trg_reviews_updated_at on public.reviews;
create trigger trg_reviews_updated_at
before update on public.reviews
for each row
execute function public.set_updated_at();

drop trigger if exists trg_categories_slug on public.categories;
create trigger trg_categories_slug
before insert on public.categories
for each row
execute function public.set_category_slug();

drop trigger if exists trg_places_slug on public.places;
create trigger trg_places_slug
before insert on public.places
for each row
execute function public.set_place_slug();

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

-- ============================================================================
-- 9. Buckets
-- ============================================================================
-- Storage buckets used by the MVP.

insert into storage.buckets (id, name, public)
values
  ('avatars', 'avatars', true),
  ('places', 'places', true),
  ('gallery', 'gallery', true)
on conflict (id) do update
set
  name = excluded.name,
  public = excluded.public;

-- ============================================================================
-- 10. Storage Policies
-- ============================================================================
-- Access control for bucket objects.

alter table storage.objects enable row level security;

drop policy if exists "avatars_public_read" on storage.objects;
create policy "avatars_public_read"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'avatars');

drop policy if exists "avatars_owner_insert" on storage.objects;
create policy "avatars_owner_insert"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'avatars' and owner = auth.uid());

drop policy if exists "avatars_owner_update" on storage.objects;
create policy "avatars_owner_update"
on storage.objects
for update
to authenticated
using (bucket_id = 'avatars' and owner = auth.uid())
with check (bucket_id = 'avatars' and owner = auth.uid());

drop policy if exists "avatars_owner_delete" on storage.objects;
create policy "avatars_owner_delete"
on storage.objects
for delete
to authenticated
using (bucket_id = 'avatars' and owner = auth.uid());

drop policy if exists "places_public_read" on storage.objects;
create policy "places_public_read"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'places');

drop policy if exists "places_admin_insert" on storage.objects;
create policy "places_admin_insert"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'places' and public.is_admin());

drop policy if exists "places_admin_update" on storage.objects;
create policy "places_admin_update"
on storage.objects
for update
to authenticated
using (bucket_id = 'places' and public.is_admin())
with check (bucket_id = 'places' and public.is_admin());

drop policy if exists "places_admin_delete" on storage.objects;
create policy "places_admin_delete"
on storage.objects
for delete
to authenticated
using (bucket_id = 'places' and public.is_admin());

drop policy if exists "gallery_public_read" on storage.objects;
create policy "gallery_public_read"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'gallery');

drop policy if exists "gallery_admin_insert" on storage.objects;
create policy "gallery_admin_insert"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'gallery' and public.is_admin());

drop policy if exists "gallery_admin_update" on storage.objects;
create policy "gallery_admin_update"
on storage.objects
for update
to authenticated
using (bucket_id = 'gallery' and public.is_admin())
with check (bucket_id = 'gallery' and public.is_admin());

drop policy if exists "gallery_admin_delete" on storage.objects;
create policy "gallery_admin_delete"
on storage.objects
for delete
to authenticated
using (bucket_id = 'gallery' and public.is_admin());

-- ============================================================================
-- 11. RLS Policies
-- ============================================================================
-- Table access control for the MVP.

alter table public.admins enable row level security;
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.places enable row level security;
alter table public.favorites enable row level security;
alter table public.reviews enable row level security;

drop policy if exists "admins_self_read" on public.admins;
create policy "admins_self_read"
on public.admins
for select
to authenticated
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "admins_admin_all" on public.admins;
create policy "admins_admin_all"
on public.admins
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin"
on public.profiles
for select
to anon, authenticated
using (id = auth.uid() or public.is_admin() or auth.uid() is null);

drop policy if exists "profiles_insert_own_or_admin" on public.profiles;
create policy "profiles_insert_own_or_admin"
on public.profiles
for insert
to authenticated
with check (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_update_own_or_admin" on public.profiles;
create policy "profiles_update_own_or_admin"
on public.profiles
for update
to authenticated
using (id = auth.uid() or public.is_admin())
with check (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_delete_admin_only" on public.profiles;
create policy "profiles_delete_admin_only"
on public.profiles
for delete
to authenticated
using (public.is_admin());

drop policy if exists "categories_public_read" on public.categories;
create policy "categories_public_read"
on public.categories
for select
to anon, authenticated
using (true);

drop policy if exists "categories_admin_write" on public.categories;
create policy "categories_admin_write"
on public.categories
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "places_public_read" on public.places;
create policy "places_public_read"
on public.places
for select
to anon, authenticated
using (true);

drop policy if exists "places_admin_write" on public.places;
create policy "places_admin_write"
on public.places
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "favorites_select_own_or_admin" on public.favorites;
create policy "favorites_select_own_or_admin"
on public.favorites
for select
to authenticated
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "favorites_insert_own_or_admin" on public.favorites;
create policy "favorites_insert_own_or_admin"
on public.favorites
for insert
to authenticated
with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "favorites_update_own_or_admin" on public.favorites;
create policy "favorites_update_own_or_admin"
on public.favorites
for update
to authenticated
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "favorites_delete_own_or_admin" on public.favorites;
create policy "favorites_delete_own_or_admin"
on public.favorites
for delete
to authenticated
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "reviews_public_read" on public.reviews;
create policy "reviews_public_read"
on public.reviews
for select
to anon, authenticated
using (true);

drop policy if exists "reviews_insert_own_or_admin" on public.reviews;
create policy "reviews_insert_own_or_admin"
on public.reviews
for insert
to authenticated
with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "reviews_update_own_or_admin" on public.reviews;
create policy "reviews_update_own_or_admin"
on public.reviews
for update
to authenticated
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "reviews_delete_own_or_admin" on public.reviews;
create policy "reviews_delete_own_or_admin"
on public.reviews
for delete
to authenticated
using (user_id = auth.uid() or public.is_admin());

-- ============================================================================
-- 12. Seed Optional
-- ============================================================================
-- Add one admin user_id here after creating the first admin account.
-- insert into public.admins (user_id) values ('00000000-0000-0000-0000-000000000000');
