import type { createSupabaseBrowserClient } from "@/lib/supabase";
import type { Place } from "@/types/place";

type SupabaseBrowserClient = NonNullable<
  ReturnType<typeof createSupabaseBrowserClient>
>;

type VisitIntentWithPlace = {
  place_id: string;
  places: Place;
};

/**
 * Lista os lugares que o usuário marcou como "quero ir",
 * com os dados completos do place via join.
 */
export async function fetchUserVisitIntents(
  client: SupabaseBrowserClient,
  userId: string,
): Promise<Place[]> {
  const { data, error } = await client
    .from("visit_intents")
    .select("place_id, places(*)")
    .eq("user_id", userId);

  if (error) {
    console.error(
      "[visit-intents] Erro ao carregar intenções de visita:",
      error.message,
    );
    throw error;
  }

  return (
    (data as unknown as VisitIntentWithPlace[])
      ?.map((intent) => intent.places)
      .filter(Boolean) ?? []
  );
}

export async function isIntentByUser(
  client: SupabaseBrowserClient,
  userId: string,
  placeId: string,
): Promise<boolean> {
  const { data, error } = await client
    .from("visit_intents")
    .select("id")
    .eq("user_id", userId)
    .eq("place_id", placeId)
    .maybeSingle();

  if (error) {
    console.error(
      "[visit-intents] Erro ao verificar intenção de visita:",
      error.message,
    );
    throw error;
  }

  return Boolean(data);
}

export async function addVisitIntent(
  client: SupabaseBrowserClient,
  userId: string,
  placeId: string,
): Promise<void> {
  const { error } = await client
    .from("visit_intents")
    .insert([{ user_id: userId, place_id: placeId }]);

  if (error) {
    console.error(
      "[visit-intents] Erro ao adicionar intenção de visita:",
      error.message,
    );
    throw error;
  }
}

export async function removeVisitIntent(
  client: SupabaseBrowserClient,
  userId: string,
  placeId: string,
): Promise<void> {
  const { error } = await client
    .from("visit_intents")
    .delete()
    .eq("user_id", userId)
    .eq("place_id", placeId);

  if (error) {
    console.error(
      "[visit-intents] Erro ao remover intenção de visita:",
      error.message,
    );
    throw error;
  }
}
