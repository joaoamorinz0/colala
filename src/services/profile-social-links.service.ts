import type { createSupabaseBrowserClient } from "@/lib/supabase";
import type { ProfileSocialLink } from "@/types/profile-social-link";

type SupabaseBrowserClient = NonNullable<
  ReturnType<typeof createSupabaseBrowserClient>
>;

const SOCIAL_LINKS_TABLE = "profile_social_links";

const SOCIAL_LINK_SELECT = `
  id,
  user_id,
  url,
  created_at
`;

export async function fetchProfileSocialLinks(
  client: SupabaseBrowserClient,
  userId: string,
): Promise<ProfileSocialLink[]> {
  const { data, error } = await client
    .from(SOCIAL_LINKS_TABLE)
    .select(SOCIAL_LINK_SELECT)
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error(
      "[profile-social-links] Erro ao carregar links:",
      error.message,
    );
    throw error;
  }

  return (data ?? []) as ProfileSocialLink[];
}

export async function addProfileSocialLink(
  client: SupabaseBrowserClient,
  userId: string,
  url: string,
): Promise<ProfileSocialLink | null> {
  const { data, error } = await client
    .from(SOCIAL_LINKS_TABLE)
    .insert([{ user_id: userId, url }])
    .select(SOCIAL_LINK_SELECT)
    .single();

  if (error) {
    console.error(
      "[profile-social-links] Erro ao adicionar link:",
      error.message,
    );
    throw error;
  }

  return data as ProfileSocialLink | null;
}

export async function updateProfileSocialLink(
  client: SupabaseBrowserClient,
  id: string,
  url: string,
): Promise<ProfileSocialLink | null> {
  const { data, error } = await client
    .from(SOCIAL_LINKS_TABLE)
    .update({ url })
    .eq("id", id)
    .select(SOCIAL_LINK_SELECT)
    .single();

  if (error) {
    console.error(
      "[profile-social-links] Erro ao atualizar link:",
      error.message,
    );
    throw error;
  }

  return data as ProfileSocialLink | null;
}

export async function deleteProfileSocialLink(
  client: SupabaseBrowserClient,
  id: string,
): Promise<void> {
  const { error } = await client.from(SOCIAL_LINKS_TABLE).delete().eq("id", id);

  if (error) {
    console.error(
      "[profile-social-links] Erro ao remover link:",
      error.message,
    );
    throw error;
  }
}
