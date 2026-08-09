-- ============================================================================
-- 02_indexes.sql
-- Non-destructive indexes for search, filters and uniqueness lookups.
-- Run after 01_tables.sql.
-- ============================================================================

create unique index if not exists profiles_username_unique_idx
  on public.profiles (lower(username));

create unique index if not exists categories_slug_unique_idx
  on public.categories (slug);

create unique index if not exists places_slug_unique_idx
  on public.places (slug);

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

