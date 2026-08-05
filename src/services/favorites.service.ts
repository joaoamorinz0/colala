import type { createSupabaseBrowserClient } from "@/lib/supabase";
import type { Place } from "@/types/place";

type SupabaseBrowserClient = NonNullable<
  ReturnType<typeof createSupabaseBrowserClient>
>;

type FavoriteWithPlace = {
  place_id: string;
  places: Place;
};

export async function fetchUserFavorites(
  client: SupabaseBrowserClient,
  userId: string,
): Promise<Place[]> {
  const { data, error } = await client
    .from("favorites")
    .select("place_id, places(*)")
    .eq("user_id", userId);

  if (error) {
    console.error("Erro ao carregar favoritos:", error.message);
    throw error;
  }

  return (
    (data as unknown as FavoriteWithPlace[])
      ?.map((fav) => fav.places)
      .filter(Boolean) ?? []
  );
}

export async function isFavoritedByUser(
  client: SupabaseBrowserClient,
  userId: string,
  placeId: string,
): Promise<boolean> {
  const { data, error } = await client
    .from("favorites")
    .select("id")
    .eq("user_id", userId)
    .eq("place_id", placeId)
    .maybeSingle();

  if (error) {
    console.error("Erro ao verificar favorito:", error.message);
    throw error;
  }

  return Boolean(data);
}

export async function addFavorite(
  client: SupabaseBrowserClient,
  userId: string,
  placeId: string,
): Promise<void> {
  const { error } = await client
    .from("favorites")
    .insert([{ user_id: userId, place_id: placeId }]);

  if (error) {
    console.error("Erro ao adicionar favorito:", error.message);
    throw error;
  }
}

export async function removeFavorite(
  client: SupabaseBrowserClient,
  userId: string,
  placeId: string,
): Promise<void> {
  const { error } = await client
    .from("favorites")
    .delete()
    .eq("user_id", userId)
    .eq("place_id", placeId);

  if (error) {
    console.error("Erro ao remover favorito:", error.message);
    throw error;
  }
}
