-- ============================================================================
-- 01_tables.sql
-- Core schema objects for the Colalá MVP.
-- Safe to run multiple times on a partially provisioned database.
-- ============================================================================

create extension if not exists pgcrypto;

create table if not exists public.admins (
  user_id uuid primary key,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key,
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
  user_id uuid,
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
  category_id uuid,
  status text not null default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  place_id uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  place_id uuid not null,
  rating smallint not null,
  comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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
alter table public.categories
  add column if not exists updated_at timestamptz not null default now();
alter table public.categories
  add column if not exists created_at timestamptz not null default now();

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
alter table public.places
  add column if not exists updated_at timestamptz not null default now();
alter table public.places
  add column if not exists created_at timestamptz not null default now();

alter table public.favorites
  add column if not exists updated_at timestamptz not null default now();
alter table public.reviews
  add column if not exists updated_at timestamptz not null default now();

-- Foreign keys
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'admins_user_id_fkey'
  ) then
    alter table public.admins
      add constraint admins_user_id_fkey
      foreign key (user_id) references auth.users(id) on delete cascade;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_id_fkey'
  ) then
    alter table public.profiles
      add constraint profiles_id_fkey
      foreign key (id) references auth.users(id) on delete cascade;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'places_user_id_fkey'
  ) then
    alter table public.places
      add constraint places_user_id_fkey
      foreign key (user_id) references auth.users(id) on delete set null;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'places_category_id_fkey'
  ) then
    alter table public.places
      add constraint places_category_id_fkey
      foreign key (category_id) references public.categories(id) on delete set null;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'favorites_user_id_fkey'
  ) then
    alter table public.favorites
      add constraint favorites_user_id_fkey
      foreign key (user_id) references auth.users(id) on delete cascade;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'favorites_place_id_fkey'
  ) then
    alter table public.favorites
      add constraint favorites_place_id_fkey
      foreign key (place_id) references public.places(id) on delete cascade;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'reviews_user_id_fkey'
  ) then
    alter table public.reviews
      add constraint reviews_user_id_fkey
      foreign key (user_id) references auth.users(id) on delete cascade;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'reviews_place_id_fkey'
  ) then
    alter table public.reviews
      add constraint reviews_place_id_fkey
      foreign key (place_id) references public.places(id) on delete cascade;
  end if;
end $$;

-- Check constraints
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'profiles_username_length_check') then
    alter table public.profiles add constraint profiles_username_length_check check (char_length(username) >= 3);
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'categories_name_length_check') then
    alter table public.categories add constraint categories_name_length_check check (char_length(trim(name)) >= 2);
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'categories_slug_length_check') then
    alter table public.categories add constraint categories_slug_length_check check (char_length(trim(slug)) >= 2);
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'places_rating_check') then
    alter table public.places add constraint places_rating_check check (rating >= 0 and rating <= 5);
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'places_price_level_check') then
    alter table public.places add constraint places_price_level_check check (price_level is null or price_level in (1, 2, 3, 4));
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'places_status_check') then
    alter table public.places add constraint places_status_check check (status in ('published', 'pending', 'rejected'));
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'favorites_unique_user_place') then
    alter table public.favorites add constraint favorites_unique_user_place unique (user_id, place_id);
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'reviews_unique_user_place') then
    alter table public.reviews add constraint reviews_unique_user_place unique (user_id, place_id);
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'reviews_rating_check') then
    alter table public.reviews add constraint reviews_rating_check check (rating between 1 and 5);
  end if;
end $$;
