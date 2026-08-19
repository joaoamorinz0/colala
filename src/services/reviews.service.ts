import type { createSupabaseBrowserClient } from "@/lib/supabase";
import type { Place } from "@/types/place";
import type { PublicReview, Review } from "@/types/review";

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

const REVIEW_WITH_PLACE_SELECT_COLUMNS = `
  id,
  place_id,
  user_id,
  rating,
  comment,
  created_at,
  updated_at,
  place:places(
    id,
    name,
    description,
    city,
    neighborhood,
    price_level,
    instagram,
    cover_image,
    rating,
    category:categories(id, name, icon)
  )
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

/**
 * Adapta o `place` aninhado de uma PublicReview para o formato Place
 * consumido pelos cards de perfil (HorizontalCard, RecentPlaceCard).
 */
export function reviewPlaceToPlace(review: PublicReview): Place {
  const place = review.place;

  return {
    id: place.id,
    name: place.name,
    description: place.description,
    city: place.city,
    neighborhood: place.neighborhood,
    address: null,
    price_level: place.price_level,
    instagram: place.instagram,
    phone: null,
    website: null,
    cover_image: place.cover_image,
    gallery: [],
    created_at: "",
    category_id: place.category?.id ?? null,
    rating: place.rating,
    latitude: null,
    longitude: null,
    opening_hours: null,
    featured: false,
    work_friendly: false,
    pet_friendly: false,
    wifi: false,
    sunset: false,
    accepts_book_club: null,
    status: "published",
    category: place.category
      ? {
          id: place.category.id,
          name: place.category.name,
          icon: place.category.icon,
        }
      : null,
  };
}

/**
 * Retorna os lugares mais recentemente avaliados pelo usuário,
 * com capa, categoria e rating do place (join aninhado).
 * Leitura é pública via RLS.
 */
export async function fetchRecentReviewedPlaces(
  client: SupabaseBrowserClient,
  userId: string,
  limit: number = 5,
): Promise<Place[]> {
  const { data, error } = await client
    .from("reviews")
    .select(REVIEW_WITH_PLACE_SELECT_COLUMNS)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error(
      "[reviews] Erro ao carregar lugares avaliados:",
      error.message,
    );
    throw error;
  }

  return ((data ?? []) as unknown as PublicReview[]).map(reviewPlaceToPlace);
}
