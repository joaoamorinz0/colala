create table if not exists public.collaborators (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  name text,
  slug text,
  instagram text,
  instagram_url text,
  website_url text,
  avatar_url text,
  logo_url text,
  short_description text,
  cor_primaria text not null default '#0F2A33',
  cor_secundaria text not null default '#D85A30',
  fonte text,
  font_family text not null default 'inter',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.collaborators
  add column if not exists nome text;
alter table public.collaborators
  add column if not exists name text;
alter table public.collaborators
  add column if not exists slug text;
alter table public.collaborators
  add column if not exists instagram text;
alter table public.collaborators
  add column if not exists instagram_url text;
alter table public.collaborators
  add column if not exists website_url text;
alter table public.collaborators
  add column if not exists avatar_url text;
alter table public.collaborators
  add column if not exists logo_url text;
alter table public.collaborators
  add column if not exists short_description text;
alter table public.collaborators
  add column if not exists cor_primaria text not null default '#0F2A33';
alter table public.collaborators
  add column if not exists cor_secundaria text not null default '#D85A30';
alter table public.collaborators
  add column if not exists fonte text;
alter table public.collaborators
  add column if not exists font_family text not null default 'inter';
alter table public.collaborators
  add column if not exists is_active boolean not null default true;
alter table public.collaborators
  add column if not exists created_at timestamptz not null default now();
alter table public.collaborators
  add column if not exists updated_at timestamptz not null default now();

alter table public.events
  add column if not exists collaborator_id uuid;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'collaborators_nome_check'
  ) then
    alter table public.collaborators
      add constraint collaborators_nome_check
      check (char_length(trim(nome)) >= 2);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'events_collaborator_id_fkey'
  ) then
    alter table public.events
      add constraint events_collaborator_id_fkey
      foreign key (collaborator_id) references public.collaborators(id) on delete set null;
  end if;
end $$;

create index if not exists idx_collaborators_is_active
  on public.collaborators (is_active);

create index if not exists idx_events_collaborator_id
  on public.events (collaborator_id);
