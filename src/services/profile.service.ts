import type { createSupabaseBrowserClient } from "@/lib/supabase";
import type { Profile } from "@/types/profile";

type SupabaseBrowserClient = NonNullable<
  ReturnType<typeof createSupabaseBrowserClient>
>;

const PROFILE_SELECT_COLUMNS = `
  id,
  name,
  username,
  avatar_url,
  bio,
  city,
  instagram,
  show_city,
  show_instagram,
  created_at,
  updated_at
`;

export async function fetchProfile(
  client: SupabaseBrowserClient,
  userId: string,
): Promise<Profile | null> {
  const { data, error } = await client
    .from("profiles")
    .select(PROFILE_SELECT_COLUMNS)
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("Erro ao carregar perfil:", error.message);
    throw error;
  }

  return data || null;
}

export async function createProfile(
  client: SupabaseBrowserClient,
  userId: string,
  profile: Omit<Partial<Profile>, "id" | "created_at" | "updated_at">,
): Promise<Profile> {
  const payload = {
    id: userId,
    name: profile.name ?? null,
    username: profile.username ?? null,
    avatar_url: profile.avatar_url ?? null,
    bio: profile.bio ?? null,
    city: profile.city ?? null,
    instagram: profile.instagram ?? null,
    show_city: profile.show_city ?? true,
    show_instagram: profile.show_instagram ?? true,
  };

  const { data, error } = await client
    .from("profiles")
    .insert([payload])
    .select(PROFILE_SELECT_COLUMNS)
    .single();

  if (error) {
    console.error("Erro ao criar perfil:", error.message);
    throw error;
  }

  return data;
}

export async function updateProfile(
  client: SupabaseBrowserClient,
  userId: string,
  profile: Partial<Omit<Profile, "id" | "created_at" | "updated_at">>,
): Promise<Profile> {
  const { data, error } = await client
    .from("profiles")
    .update(profile)
    .eq("id", userId)
    .select(PROFILE_SELECT_COLUMNS)
    .single();

  if (error) {
    console.error("Erro ao atualizar perfil:", error.message);
    throw error;
  }

  return data;
}

export async function searchProfiles(
  client: SupabaseBrowserClient,
  query: string,
  limit: number = 10,
): Promise<Profile[]> {
  const trimmed = query.trim();

  if (!trimmed) {
    return [];
  }

  const { data, error } = await client
    .from("profiles")
    .select(PROFILE_SELECT_COLUMNS)
    .or(`name.ilike.%${trimmed}%,username.ilike.%${trimmed}%`)
    .order("username", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("Erro ao buscar perfis:", error.message);
    throw error;
  }

  return (data ?? []) as Profile[];
}

export async function fetchProfileReviewStats(
  client: SupabaseBrowserClient,
  userId: string,
): Promise<{ reviewCount: number; reviewedPlaceCount: number }> {
  const { data, error } = await client
    .from("reviews")
    .select("id,place_id")
    .eq("user_id", userId);

  if (error) {
    console.error("Erro ao carregar avaliações do perfil:", error.message);
    throw error;
  }

  const reviews = data ?? [];
  const reviewedPlaceCount = new Set(reviews.map((review) => review.place_id))
    .size;

  return {
    reviewCount: reviews.length,
    reviewedPlaceCount,
  };
}

export async function uploadProfileAvatar(
  client: SupabaseBrowserClient,
  userId: string,
  file: File,
  bucket: string = "avatars",
): Promise<string> {
  const filePath = `${userId}/${Date.now()}-${file.name}`;
  const { error, data } = await client.storage
    .from(bucket)
    .upload(filePath, file, { upsert: true });

  if (error) {
    throw new Error(`Erro ao fazer upload do avatar: ${error.message}`);
  }

  const { data: publicUrl } = client.storage
    .from(bucket)
    .getPublicUrl(data.path);
  return publicUrl.publicUrl;
}

export async function updateUserMetadata(
  client: SupabaseBrowserClient,
  metadata: Record<string, string | null>,
) {
  const { data, error } = await client.auth.updateUser({ data: metadata });

  if (error) {
    console.error("Erro ao atualizar user metadata:", error.message);
    throw error;
  }

  return data;
}
