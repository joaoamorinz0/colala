-- ============================================================================
-- 07_seed.sql
-- Optional seed data for the Colalá MVP.
-- Keep this file safe to run on any environment.
-- ============================================================================

-- No mandatory seed rows are required for the MVP.
-- Add a first admin user manually after creating the account:
-- insert into public.admins (user_id) values ('YOUR-ADMIN-USER-UUID');

-- ============================================================================
-- Experiências de teste
-- ============================================================================

with experiences_parent as (
  select id
  from public.categories
  where slug = 'experiencias'
  limit 1
),
feiras as (
  select c.id
  from public.categories c
  join experiences_parent p on p.id is not null
  where c.parent_id = p.id
    and c.slug = 'feiras'
  limit 1
),
musica as (
  select c.id
  from public.categories c
  join experiences_parent p on p.id is not null
  where c.parent_id = p.id
    and c.slug = 'musica'
  limit 1
)
insert into public.events (
  id,
  name,
  description,
  cover_image,
  category_id,
  place_id,
  location_name,
  address,
  city,
  start_date,
  start_time,
  end_date,
  end_time,
  is_recurring,
  recurrence_frequency,
  recurrence_day_of_week,
  recurrence_day_of_month,
  recurrence_end_date,
  price,
  is_free,
  organizer_name,
  organizer_instagram,
  instagram,
  website,
  phone,
  additional_info,
  status
)
select
  gen_random_uuid(),
  'Feira Colalá Teste',
  'Evento de teste para validar a aba Experiências.',
  null,
  feiras.id,
  null,
  'Espaço Teste',
  'SCS Quadra 1, Brasília - DF',
  'Brasília',
  '2026-09-05',
  '10:00:00',
  null,
  null,
  false,
  null,
  null,
  null,
  null,
  null,
  true,
  'Equipe Colalá',
  '@colala',
  '@colala',
  'https://colala.com.br',
  null,
  'Use este registro para validar filtros e card.',
  'published'
from feiras
where exists (select 1 from experiences_parent)
on conflict do nothing;

with experiences_parent as (
  select id
  from public.categories
  where slug = 'experiencias'
  limit 1
),
musica as (
  select c.id
  from public.categories c
  join experiences_parent p on p.id is not null
  where c.parent_id = p.id
    and c.slug = 'musica'
  limit 1
)
insert into public.events (
  id,
  name,
  description,
  cover_image,
  category_id,
  place_id,
  location_name,
  address,
  city,
  start_date,
  start_time,
  end_date,
  end_time,
  is_recurring,
  recurrence_frequency,
  recurrence_day_of_week,
  recurrence_day_of_month,
  recurrence_end_date,
  price,
  is_free,
  organizer_name,
  organizer_instagram,
  instagram,
  website,
  phone,
  additional_info,
  status
)
select
  gen_random_uuid(),
  'Sarau Música Teste',
  'Segundo evento de teste para validar a subcategoria Música.',
  null,
  musica.id,
  null,
  'Casa Experimental',
  'CLN 213, Brasília - DF',
  'Brasília',
  '2026-09-12',
  '19:30:00',
  null,
  null,
  false,
  null,
  null,
  null,
  null,
  45.00,
  false,
  'Coletivo Colalá',
  '@coletivocolala',
  '@coletivocolala',
  'https://colala.com.br',
  null,
  'Use este registro para validar filtros e card.',
  'published'
from musica
where exists (select 1 from experiences_parent)
on conflict do nothing;
