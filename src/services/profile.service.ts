import type { createSupabaseBrowserClient } from "@/lib/supabase";
import type { Profile } from "@/types/profile";

type SupabaseBrowserClient = NonNullable<
  ReturnType<typeof createSupabaseBrowserClient>
>;

export async function fetchProfile(
  client: SupabaseBrowserClient,
  userId: string,
): Promise<Profile | null> {
  const { data, error } = await client
    .from("profiles")
    .select("id,name,username,avatar_url,bio,created_at,updated_at")
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
  };

  const { data, error } = await client
    .from("profiles")
    .insert([payload])
    .select("id,name,username,avatar_url,bio,created_at,updated_at")
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
    .select("id,name,username,avatar_url,bio,created_at,updated_at")
    .single();

  if (error) {
    console.error("Erro ao atualizar perfil:", error.message);
    throw error;
  }

  return data;
}

export async function uploadProfileAvatar(
  client: SupabaseBrowserClient,
  file: File,
  bucket: string = "places",
): Promise<string> {
  const fileName = `${Date.now()}-${file.name}`;
  const { error, data } = await client.storage
    .from(bucket)
    .upload(fileName, file);

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
