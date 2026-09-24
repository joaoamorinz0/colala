-- Preserve public collaborator visibility while restricting every mutation to
-- users recognized by the existing public.is_admin() authorization function.
alter table public.collaborators enable row level security;

drop policy if exists "collaborators_public_read" on public.collaborators;
create policy "collaborators_public_read"
on public.collaborators
for select
to anon, authenticated
using (true);

drop policy if exists "collaborators_admin_write" on public.collaborators;
create policy "collaborators_admin_write"
on public.collaborators
for all
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));
