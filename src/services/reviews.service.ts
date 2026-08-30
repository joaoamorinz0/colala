import type { createSupabaseBrowserClient } from "@/lib/supabase";
import type { Place } from "@/types/place";
import type {
  PublicReview,
  PlaceReview,
  PlacePopularTag,
  ReviewAuthor,
  Review,
  ReviewPhoto,
  ReviewTag,
  ReviewTagFrequency,
} from "@/types/review";
import type { Profile } from "@/types/profile";

type SupabaseBrowserClient = NonNullable<
  ReturnType<typeof createSupabaseBrowserClient>
>;

type ReviewRow = {
  rating: number | string;
};

type ReviewTagLinkPayloadRow = {
  tag?: ReviewTag | ReviewTag[] | null;
  review_tags?: ReviewTag | ReviewTag[] | null;
};

type ReviewTagLinkRow = ReviewTagLinkPayloadRow;

type ReviewWithRelations = Review & {
  review_tags?:
    Array<ReviewTagLinkRow | ReviewTagLinkPayloadRow> | ReviewTag[] | null;
  review_photos?: ReviewPhoto[] | null;
};

type PlacePopularTagRow = {
  place_id: string;
  place_tag_id?: string | null;
  tag_id?: string | null;
  place_tag_name?: string | null;
  tag_name?: string | null;
  name?: string | null;
  place_tag_slug?: string | null;
  tag_slug?: string | null;
  slug?: string | null;
  place_tag_icon?: string | null;
  tag_icon?: string | null;
  icon?: string | null;
  popularity?: number | null;
  percentage?: number | null;
  review_count?: number | null;
  count?: number | null;
};

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

const REVIEW_TAGS_SELECT_COLUMNS = `
  id,
  name,
  slug,
  icon,
  sort_order
`;

const REVIEW_WITH_DETAILS_SELECT_COLUMNS = `
  id,
  place_id,
  user_id,
  rating,
  comment,
  created_at,
  updated_at,
  review_tags:review_tag_links(
    tag:review_tags(
      id,
      name,
      slug,
      icon,
      sort_order
    )
  ),
  review_photos(
    id,
    review_id,
    url,
    sort_order,
    created_at
  )
`;

const PLACE_REVIEW_SELECT_COLUMNS = `
  id,
  place_id,
  user_id,
  rating,
  comment,
  created_at,
  updated_at,
  review_tags:review_tag_links(
    tag:review_tags(
      id,
      name,
      slug,
      icon,
      sort_order
    )
  ),
  review_photos(
    id,
    review_id,
    url,
    sort_order,
    created_at
  )
`;

export type PlaceReviewSummary = {
  average: number | null;
  count: number;
};

export type SaveReviewInput = {
  rating: number;
  comment: string | null;
  tagIds: string[];
  photoUrls: string[];
};

export async function deleteReview(
  client: SupabaseBrowserClient,
  reviewId: string,
): Promise<void> {
  const { error } = await client.from("reviews").delete().eq("id", reviewId);

  if (error) {
    throw new Error(`Erro ao deletar avaliação: ${error.message}`);
  }
}

export async function fetchReviewTags(
  client: SupabaseBrowserClient,
): Promise<ReviewTag[]> {
  const { data, error } = await client
    .from("review_tags")
    .select(REVIEW_TAGS_SELECT_COLUMNS)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    console.error("[reviews] Erro ao carregar tags:", error.message);
    throw error;
  }

  return (data ?? []) as ReviewTag[];
}

function normalizeReviewTags(
  rows: ReviewTagLinkPayloadRow[] | null | undefined,
): ReviewTag[] {
  return (rows ?? [])
    .map((row) => {
      const tag = row?.tag ?? row?.review_tags ?? row;
      return Array.isArray(tag) ? (tag[0] ?? null) : (tag ?? null);
    })
    .filter((tag): tag is ReviewTag => Boolean(tag));
}

function normalizeReviewPhotos(
  rows: ReviewPhoto[] | null | undefined,
): ReviewPhoto[] {
  return (rows ?? []).slice().sort((a, b) => {
    const aOrder = a.sort_order ?? 0;
    const bOrder = b.sort_order ?? 0;
    if (aOrder !== bOrder) return aOrder - bOrder;
    return a.created_at.localeCompare(b.created_at);
  });
}

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

  const ratings = ((data ?? []) as ReviewRow[]).map((row) =>
    Number(row.rating),
  );

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
    .select(REVIEW_WITH_DETAILS_SELECT_COLUMNS)
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

  const review = (data as ReviewWithRelations | null) ?? null;

  if (!review) return null;

  return {
    ...review,
    review_tags: normalizeReviewTags(
      review.review_tags as ReviewTagLinkPayloadRow[],
    ),
    review_photos: normalizeReviewPhotos(review.review_photos ?? []),
  };
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

    await syncReviewRelations(
      client,
      existing.id,
      input.tagIds,
      input.photoUrls,
    );
    return {
      ...(data as Review),
      review_tags: await fetchReviewTagsForReview(client, existing.id),
      review_photos: await fetchReviewPhotosForReview(client, existing.id),
    };
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

  const saved = data as Review;
  await syncReviewRelations(client, saved.id, input.tagIds, input.photoUrls);
  return {
    ...saved,
    review_tags: await fetchReviewTagsForReview(client, saved.id),
    review_photos: await fetchReviewPhotosForReview(client, saved.id),
  };
}

async function syncReviewRelations(
  client: SupabaseBrowserClient,
  reviewId: string,
  tagIds: string[],
  photoUrls: string[],
) {
  const normalizedTagIds = Array.from(new Set(tagIds.filter(Boolean)));
  const normalizedPhotoUrls = photoUrls.filter(Boolean);

  const [{ error: deleteTagsError }, { error: deletePhotosError }] =
    await Promise.all([
      client.from("review_tag_links").delete().eq("review_id", reviewId),
      client.from("review_photos").delete().eq("review_id", reviewId),
    ]);

  if (deleteTagsError) {
    throw new Error(
      `Erro ao atualizar tags da avaliação: ${deleteTagsError.message}`,
    );
  }
  if (deletePhotosError) {
    throw new Error(
      `Erro ao atualizar fotos da avaliação: ${deletePhotosError.message}`,
    );
  }

  if (normalizedTagIds.length > 0) {
    const tagRows = normalizedTagIds.map((tagId) => ({
      review_id: reviewId,
      tag_id: tagId,
    }));

    const { error } = await client.from("review_tag_links").insert(tagRows);
    if (error) {
      throw new Error(`Erro ao salvar tags da avaliação: ${error.message}`);
    }
  }

  if (normalizedPhotoUrls.length > 0) {
    const photoRows = normalizedPhotoUrls.map((url, index) => ({
      review_id: reviewId,
      url,
      sort_order: index,
    }));

    const { error } = await client.from("review_photos").insert(photoRows);
    if (error) {
      throw new Error(`Erro ao salvar fotos da avaliação: ${error.message}`);
    }
  }
}

async function fetchReviewTagsForReview(
  client: SupabaseBrowserClient,
  reviewId: string,
): Promise<ReviewTag[]> {
  const { data, error } = await client
    .from("review_tag_links")
    .select(
      `
      tag:review_tags(
        id,
        name,
        slug,
        icon,
        sort_order
      )
    `,
    )
    .eq("review_id", reviewId);

  if (error) {
    throw new Error(`Erro ao carregar tags da avaliação: ${error.message}`);
  }

  return normalizeReviewTags(
    data as Array<ReviewTagLinkRow | ReviewTagLinkPayloadRow>,
  );
}

async function fetchReviewPhotosForReview(
  client: SupabaseBrowserClient,
  reviewId: string,
): Promise<ReviewPhoto[]> {
  const { data, error } = await client
    .from("review_photos")
    .select("id, review_id, url, sort_order, created_at")
    .eq("review_id", reviewId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Erro ao carregar fotos da avaliação: ${error.message}`);
  }

  return normalizeReviewPhotos((data ?? []) as ReviewPhoto[]);
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

export async function fetchReviewsForPlace(
  client: SupabaseBrowserClient,
  placeId: string,
): Promise<PlaceReview[]> {
  const { data, error } = await client
    .from("reviews")
    .select(PLACE_REVIEW_SELECT_COLUMNS)
    .eq("place_id", placeId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(
      "[reviews] Erro ao carregar reviews do local:",
      error.message,
    );
    throw error;
  }

  const reviews = ((data ?? []) as unknown as ReviewWithRelations[]).map(
    (review) => ({
      ...review,
      review_tags: normalizeReviewTags(
        review.review_tags as ReviewTagLinkPayloadRow[],
      ),
      review_photos: normalizeReviewPhotos(review.review_photos ?? []),
    }),
  );

  const userIds = Array.from(new Set(reviews.map((review) => review.user_id)));
  const authorMap = await fetchAuthorsByIds(client, userIds);

  return reviews.map((review) => ({
    ...review,
    author: authorMap.get(review.user_id) ?? null,
  }));
}

async function fetchAuthorsByIds(
  client: SupabaseBrowserClient,
  userIds: string[],
): Promise<Map<string, ReviewAuthor>> {
  if (userIds.length === 0) return new Map();

  const { data, error } = await client
    .from("profiles")
    .select("id, name, username, avatar_url")
    .in("id", userIds);

  if (error) {
    console.error("[reviews] Erro ao carregar autores:", error.message);
    throw error;
  }

  const map = new Map<string, ReviewAuthor>();
  for (const profile of (data ?? []) as Profile[]) {
    map.set(profile.id, {
      id: profile.id,
      name: profile.name,
      username: profile.username,
      avatar_url: profile.avatar_url,
    });
  }

  return map;
}

export async function fetchPlaceReviewTagsFrequency(
  client: SupabaseBrowserClient,
  placeId: string,
): Promise<ReviewTagFrequency[]> {
  const { data, error } = await client
    .from("review_tag_links")
    .select(
      `
      tag:review_tags(
        id,
        name,
        slug,
        icon,
        sort_order
      ),
      review_id,
      reviews!inner(place_id)
    `,
    )
    .eq("reviews.place_id", placeId);

  if (error) {
    console.error(
      "[reviews] Erro ao carregar frequência de tags:",
      error.message,
    );
    throw error;
  }

  const total = data?.length ?? 0;
  if (total === 0) return [];

  const counts = new Map<string, { tag: ReviewTag; count: number }>();
  for (const row of (data ?? []) as ReviewTagLinkPayloadRow[]) {
    const rawTag = row?.tag ?? row?.review_tags ?? null;
    const tag = Array.isArray(rawTag) ? (rawTag[0] ?? null) : rawTag;
    if (!tag) continue;
    const existing = counts.get(tag.id);
    if (existing) existing.count += 1;
    else counts.set(tag.id, { tag, count: 1 });
  }

  return Array.from(counts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)
    .map(({ tag, count }) => ({
      tag,
      count,
      percentage: Math.round((count / total) * 100),
    }));
}

export async function fetchPlacePopularTags(
  client: SupabaseBrowserClient,
  placeId: string,
  limit: number = 3,
): Promise<PlacePopularTag[]> {
  const { data, error } = await client
    .from("place_popular_tags")
    .select("*")
    .eq("place_id", placeId);

  if (error) {
    console.error("[reviews] Erro ao carregar tags populares:", error.message);
    return [];
  }

  return ((data ?? []) as PlacePopularTagRow[])
    .map((row) => ({
      place_id: row.place_id,
      place_tag_id: row.place_tag_id ?? row.tag_id ?? null,
      place_tag_name: row.place_tag_name ?? row.tag_name ?? row.name ?? "",
      place_tag_slug: row.place_tag_slug ?? row.tag_slug ?? row.slug ?? null,
      place_tag_icon: row.place_tag_icon ?? row.tag_icon ?? row.icon ?? null,
      popularity:
        typeof row.popularity === "number"
          ? row.popularity
          : typeof row.percentage === "number"
            ? row.percentage
            : null,
      review_count:
        typeof row.review_count === "number"
          ? row.review_count
          : typeof row.count === "number"
            ? row.count
            : null,
    }))
    .sort((a, b) => {
      const aCount = a.review_count ?? 0;
      const bCount = b.review_count ?? 0;
      if (aCount !== bCount) return bCount - aCount;
      const aPop = a.popularity ?? 0;
      const bPop = b.popularity ?? 0;
      return bPop - aPop;
    })
    .slice(0, limit);
}
