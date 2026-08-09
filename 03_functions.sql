-- ============================================================================
-- 03_functions.sql
-- Shared helper functions used by triggers and RLS policies.
-- Run after 01_tables.sql and before triggers / RLS.
-- ============================================================================

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

