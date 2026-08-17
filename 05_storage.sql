-- ============================================================================
-- 05_storage.sql
-- Storage buckets and object policies.
-- Run after 01_tables.sql and 03_functions.sql.
-- ============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', true, 10485760, array['image/jpeg', 'image/png', 'image/webp']::text[]),
  ('places', 'places', true),
  ('gallery', 'gallery', true)
on conflict (id) do update
set
  name = excluded.name,
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

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
with check (
  bucket_id = 'places'
  and exists (
    select 1
    from public.admins a
    where a.user_id = auth.uid()
  )
);

drop policy if exists "places_admin_update" on storage.objects;
create policy "places_admin_update"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'places'
  and exists (
    select 1
    from public.admins a
    where a.user_id = auth.uid()
  )
)
with check (
  bucket_id = 'places'
  and exists (
    select 1
    from public.admins a
    where a.user_id = auth.uid()
  )
);

drop policy if exists "places_admin_delete" on storage.objects;
create policy "places_admin_delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'places'
  and exists (
    select 1
    from public.admins a
    where a.user_id = auth.uid()
  )
);

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
with check (
  bucket_id = 'gallery'
  and exists (
    select 1
    from public.admins a
    where a.user_id = auth.uid()
  )
);

drop policy if exists "gallery_admin_update" on storage.objects;
create policy "gallery_admin_update"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'gallery'
  and exists (
    select 1
    from public.admins a
    where a.user_id = auth.uid()
  )
)
with check (
  bucket_id = 'gallery'
  and exists (
    select 1
    from public.admins a
    where a.user_id = auth.uid()
  )
);

drop policy if exists "gallery_admin_delete" on storage.objects;
create policy "gallery_admin_delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'gallery'
  and exists (
    select 1
    from public.admins a
    where a.user_id = auth.uid()
  )
);
