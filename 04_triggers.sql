-- ============================================================================
-- 04_triggers.sql
-- Trigger definitions for timestamps, slugs and auth profile bootstrap.
-- Run after 03_functions.sql.
-- ============================================================================

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

