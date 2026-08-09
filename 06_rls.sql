-- ============================================================================
-- 06_rls.sql
-- Row Level Security policies for the application tables.
-- Run after 03_functions.sql and after 01_tables.sql.
-- ============================================================================

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
using (
  user_id = auth.uid()
  or exists (
    select 1 from public.admins a where a.user_id = auth.uid()
  )
);

drop policy if exists "admins_admin_all" on public.admins;
create policy "admins_admin_all"
on public.admins
for all
to authenticated
using (
  exists (
    select 1 from public.admins a where a.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.admins a where a.user_id = auth.uid()
  )
);

drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin"
on public.profiles
for select
to authenticated
using (
  id = auth.uid()
  or exists (
    select 1 from public.admins a where a.user_id = auth.uid()
  )
);

drop policy if exists "profiles_insert_own_or_admin" on public.profiles;
create policy "profiles_insert_own_or_admin"
on public.profiles
for insert
to authenticated
with check (
  id = auth.uid()
  or exists (
    select 1 from public.admins a where a.user_id = auth.uid()
  )
);

drop policy if exists "profiles_update_own_or_admin" on public.profiles;
create policy "profiles_update_own_or_admin"
on public.profiles
for update
to authenticated
using (
  id = auth.uid()
  or exists (
    select 1 from public.admins a where a.user_id = auth.uid()
  )
)
with check (
  id = auth.uid()
  or exists (
    select 1 from public.admins a where a.user_id = auth.uid()
  )
);

drop policy if exists "profiles_delete_admin_only" on public.profiles;
create policy "profiles_delete_admin_only"
on public.profiles
for delete
to authenticated
using (
  exists (
    select 1 from public.admins a where a.user_id = auth.uid()
  )
);

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
using (
  exists (
    select 1 from public.admins a where a.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.admins a where a.user_id = auth.uid()
  )
);

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
using (
  exists (
    select 1 from public.admins a where a.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.admins a where a.user_id = auth.uid()
  )
);

drop policy if exists "favorites_select_own_or_admin" on public.favorites;
create policy "favorites_select_own_or_admin"
on public.favorites
for select
to authenticated
using (
  user_id = auth.uid()
  or exists (
    select 1 from public.admins a where a.user_id = auth.uid()
  )
);

drop policy if exists "favorites_insert_own_or_admin" on public.favorites;
create policy "favorites_insert_own_or_admin"
on public.favorites
for insert
to authenticated
with check (
  user_id = auth.uid()
  or exists (
    select 1 from public.admins a where a.user_id = auth.uid()
  )
);

drop policy if exists "favorites_update_own_or_admin" on public.favorites;
create policy "favorites_update_own_or_admin"
on public.favorites
for update
to authenticated
using (
  user_id = auth.uid()
  or exists (
    select 1 from public.admins a where a.user_id = auth.uid()
  )
)
with check (
  user_id = auth.uid()
  or exists (
    select 1 from public.admins a where a.user_id = auth.uid()
  )
);

drop policy if exists "favorites_delete_own_or_admin" on public.favorites;
create policy "favorites_delete_own_or_admin"
on public.favorites
for delete
to authenticated
using (
  user_id = auth.uid()
  or exists (
    select 1 from public.admins a where a.user_id = auth.uid()
  )
);

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
with check (
  user_id = auth.uid()
  or exists (
    select 1 from public.admins a where a.user_id = auth.uid()
  )
);

drop policy if exists "reviews_update_own_or_admin" on public.reviews;
create policy "reviews_update_own_or_admin"
on public.reviews
for update
to authenticated
using (
  user_id = auth.uid()
  or exists (
    select 1 from public.admins a where a.user_id = auth.uid()
  )
)
with check (
  user_id = auth.uid()
  or exists (
    select 1 from public.admins a where a.user_id = auth.uid()
  )
);

drop policy if exists "reviews_delete_own_or_admin" on public.reviews;
create policy "reviews_delete_own_or_admin"
on public.reviews
for delete
to authenticated
using (
  user_id = auth.uid()
  or exists (
    select 1 from public.admins a where a.user_id = auth.uid()
  )
);

