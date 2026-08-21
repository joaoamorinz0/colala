-- ============================================================================
-- Account deletion (self-service)
--
-- RPC "security definer" que remove todos os dados associados à conta do
-- usuário logado, incluindo imagens no Storage ("avatars"), e por fim o
-- registro em auth.users.
--
-- NOTA DE SEGURANÇA:
-- - RLS continua ativo em todas as tabelas; nada é desabilitado aqui.
-- - A função roda com privilégios de quem a criou (postgres) para poder
--   remover o registro em auth.users e os objetos no bucket "avatars".
-- - Apenas remove dados do usuário autenticado (auth.uid()).
-- - Avaliações/favoritos/"quero ir"/interesses de outros usuários não são
--   tocados. Lugares criados pelo usuário permanecem (places.user_id é
--   ON DELETE SET NULL), pois podem ter avaliações de terceiros.
-- ============================================================================

create or replace function public.delete_account()
returns void
language plpgsql
security definer
set search_path = public, auth, storage
as $$
declare
  target_user_id uuid := auth.uid();
begin
  if target_user_id is null then
    raise exception 'Usário não autenticado';
  end if;

  -- Imagens (avatar e capa) ficam no bucket "avatars" sob o folder do usuário.
  delete from storage.objects
  where bucket_id = 'avatars'
    and owner = target_user_id;

  -- Dados relacionados (mais tabelas que o schema atual: visit_intents,
  -- profile_interests e profile_social_links não possuem FK registrada nos
  -- arquivos .sql do repo, então a remoção é feita explicitamente aqui).
  delete from public.profile_interests where user_id = target_user_id;
  delete from public.visit_intents where user_id = target_user_id;
  delete from public.profile_social_links where user_id = target_user_id;
  delete from public.favorites where user_id = target_user_id;
  delete from public.reviews where user_id = target_user_id;
  delete from public.admins where user_id = target_user_id;

  -- Perfil (FK profiles.id -> auth.users(id) ON DELETE CASCADE, mas
  -- removemos explicitamente antes para clareza).
  delete from public.profiles where id = target_user_id;

  -- Remove o usuário do Supabase Auth. As FKs ON DELETE CASCADE das tabelas
  -- com relação direta a auth.users garantem consistência.
  delete from auth.users where id = target_user_id;
end;
$$;

-- Permitir que qualquer usuário autenticado execute a própria exclusão.
revoke execute on function public.delete_account() from anon;
revoke execute on function public.delete_account() from public;
grant execute on function public.delete_account() to authenticated;
