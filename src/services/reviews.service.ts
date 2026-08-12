import type { createSupabaseBrowserClient } from "@/lib/supabase";
import type { Review } from "@/types/review";

type SupabaseBrowserClient = NonNullable<
  ReturnType<typeof createSupabaseBrowserClient>
>;

const REVIEW_SELECT_COLUMNS = `
  id,
  place_id,
  user_id,
  rating,
  comment,
  created_at,
  updated_at
`;

export type PlaceReviewSummary = {
  average: number | null;
  count: number;
};

export type SaveReviewInput = {
  rating: number;
  comment: string | null;
};

/**
 * Agrega as avaliações de um lugar (média + quantidade).
 * Leitura é pública via RLS, então não depende do usuário logado.
 */
export async function fetchPlaceReviewSummary(
  client: SupabaseBrowserClient,
  placeId: string,
): Promise<PlaceReviewSummary> {
  const { data, error } = await client
    .from("reviews")
    .select("rating")
    .eq("place_id", placeId);

  if (error) {
    console.error(
      "[reviews] Erro ao carregar resumo de avaliações:",
      error.message,
    );
    throw error;
  }

  const ratings = (data ?? []).map((row) => Number(row.rating));

  if (ratings.length === 0) {
    return { average: null, count: 0 };
  }

  const total = ratings.reduce((sum, rating) => sum + rating, 0);

  return {
    average: total / ratings.length,
    count: ratings.length,
  };
}

/**
 * Retorna a avaliação do usuário para o lugar, se existir.
 * unique(user_id, place_id) garante no máximo um registro por par.
 */
export async function fetchUserReviewForPlace(
  client: SupabaseBrowserClient,
  userId: string,
  placeId: string,
): Promise<Review | null> {
  const { data, error } = await client
    .from("reviews")
    .select(REVIEW_SELECT_COLUMNS)
    .eq("user_id", userId)
    .eq("place_id", placeId)
    .maybeSingle();

  if (error) {
    console.error(
      "[reviews] Erro ao carregar avaliação do usuário:",
      error.message,
    );
    throw error;
  }

  return (data as Review | null) ?? null;
}

/**
 * Cria ou atualiza a avaliação do usuário para o lugar.
 * Atualiza se já existir (checado via select antes); senão insere.
 */
export async function saveReview(
  client: SupabaseBrowserClient,
  userId: string,
  placeId: string,
  input: SaveReviewInput,
): Promise<Review> {
  const existing = await fetchUserReviewForPlace(client, userId, placeId);

  if (existing) {
    const { data, error } = await client
      .from("reviews")
      .update({ rating: input.rating, comment: input.comment })
      .eq("id", existing.id)
      .select(REVIEW_SELECT_COLUMNS)
      .single();

    if (error) {
      console.error("[reviews] Erro ao atualizar avaliação:", error.message);
      throw error;
    }

    return data as Review;
  }

  const { data, error } = await client
    .from("reviews")
    .insert([
      {
        user_id: userId,
        place_id: placeId,
        rating: input.rating,
        comment: input.comment,
      },
    ])
    .select(REVIEW_SELECT_COLUMNS)
    .single();

  if (error) {
    console.error("[reviews] Erro ao criar avaliação:", error.message);
    throw error;
  }

  return data as Review;
}
