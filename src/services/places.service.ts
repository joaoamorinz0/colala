import type { createSupabaseBrowserClient } from "@/lib/supabase";
import type { Place } from "@/types/place";

type SupabaseBrowserClient = NonNullable<
  ReturnType<typeof createSupabaseBrowserClient>
>;

const PLACES_TABLE = "places";
const PLACES_COLUMNS = `
  id,
  name,
  description,
  city,
  neighborhood,
  address,
  price_level,
  instagram,
  phone,
  website,
  cover_image,
  gallery,
  created_at,
  category_id,
  rating,
  latitude,
  longitude,
  opening_hours,
  featured,
  work_friendly,
  pet_friendly,
  wifi,
  sunset,
  accepts_book_club,
  category:categories(id, name, icon)
`;

export type NaturalLanguageIntent = {
  category_slugs?: string[];
  subcategory_slugs?: string[];
  tag_slugs?: string[];
  keywords?: string[];
};

export type FetchPlacesClientOptions = {
  query?: string;
  categoryId?: string | null;
  subcategoryIds?: string[];
  workFriendly?: boolean;
  petFriendly?: boolean;
  wifi?: boolean;
  acceptsBookClub?: boolean;
  naturalLanguageIntent?: NaturalLanguageIntent | null;
  limit?: number;
};

const STOPWORDS = new Set([
  "pra",
  "para",
  "com",
  "sem",
  "uma",
  "um",
  "do",
  "da",
  "de",
  "e",
  "a",
  "o",
  "em",
  "no",
  "na",
  "que",
  "por",
  "ao",
  "os",
  "as",
  "os",
  "pro",
]);

// Normaliza texto para busca: minúsculas + sem acentos.
// Ex.: "Romântico" -> "romantico", para casar com tag_slugs.
function normalizeSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

// Divide a query em tokens relevantes (remove stopwords e tokens curtos).
// Ex.: "cafeterias pra trabalhar" -> ["cafeterias", "trabalhar"].
function tokenizeSearchText(value: string): string[] {
  return value
    .toLowerCase()
    .replace(/[!?.,;:()\-]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2 && !STOPWORDS.has(token));
}

export async function fetchPlaces(
  client: SupabaseBrowserClient,
  {
    query,
    categoryId,
    subcategoryIds,
    workFriendly,
    petFriendly,
    wifi,
    acceptsBookClub,
    naturalLanguageIntent,
    limit,
  }: FetchPlacesClientOptions = {},
): Promise<Place[]> {
  const tagSlugs = (naturalLanguageIntent?.tag_slugs ?? []).map((slug) =>
    slug.toLowerCase(),
  );
  const hasTagIntent = tagSlugs.length > 0;

  // Tags de um lugar NÃO são atributos fixos: vêm do consenso das avaliações.
  // A view `place_popular_tags` agrega (place_id, tag_slug, tag_percentage)
  // para tags com >=3 reviews e >=50% de concordância. Então um lugar só
  // "ganha" a tag popular quando a comunidade valida via reviews.
  let placeIdsWithTag: string[] = [];
  if (hasTagIntent) {
    const { data: placeTagRows, error: placeTagError } = await client
      .from("place_popular_tags")
      .select("place_id")
      .in("tag_slug", tagSlugs);

    if (!placeTagError && placeTagRows) {
      placeIdsWithTag = (placeTagRows as Array<{ place_id: string }>)
        .map((row) => String(row.place_id))
        .filter((id) => id.length > 0);
    }
  }

  let request = client
    .from(PLACES_TABLE)
    .select(PLACES_COLUMNS)
    .eq("status", "published")
    .order("created_at", { ascending: false });

  // Busca textual somente quando NÃO há intent (a IA falhou/timeout).
  // Quando há intent, os keywords/tag_slugs dele guiam a busca textual, e
  // buscar pela query inteira ("cafeterias pra trabalhar") zeraria tudo.
  if (query?.trim() && !naturalLanguageIntent) {
    const tokens = tokenizeSearchText(query.trim());
    if (tokens.length > 0) {
      const conditions = tokens
        .map(
          (token) =>
            `name.ilike.%${token}%,description.ilike.%${token}%,city.ilike.%${token}%`,
        )
        .join(",");
      request = request.or(conditions);
    }
  }

  // Subcategoria específica: filtra pela lista exata de IDs.
  // Se subcategoryIds for vazio mas categoryId existir, filtra só pela
  // categoria principal (places sem subcategoria).
  if (subcategoryIds && subcategoryIds.length > 0) {
    request = request.in("category_id", subcategoryIds);
  } else if (categoryId) {
    request = request.eq("category_id", categoryId);
  }

  if (workFriendly) {
    request = request.eq("work_friendly", true);
  }
  if (petFriendly) {
    request = request.eq("pet_friendly", true);
  }
  if (wifi) {
    request = request.eq("wifi", true);
  }
  if (acceptsBookClub) {
    request = request.eq("accepts_book_club", true);
  }

  if (limit) {
    request = request.limit(limit);
  }

  const { data, error } = await request;

  if (error) {
    console.error("[places] fetch error:", error);
    throw error;
  }

  const rows = (data ?? []) as unknown as Place[];

  if (!naturalLanguageIntent) {
    return rows;
  }

  const categoryIdsFromIntent = new Set<string>();
  const categorySlugs = [
    ...(naturalLanguageIntent.category_slugs ?? []),
    ...(naturalLanguageIntent.subcategory_slugs ?? []),
  ];

  if (categorySlugs.length > 0) {
    const { data: categoryRows, error: categoryError } = await client
      .from("categories")
      .select("id, slug")
      .in("slug", categorySlugs);

    if (!categoryError && categoryRows) {
      for (const category of categoryRows as Array<{
        id: string;
        slug: string;
      }>) {
        categoryIdsFromIntent.add(String(category.id));
      }
    }
  }

  const keywords = (naturalLanguageIntent.keywords ?? []).map((keyword) =>
    keyword.toLowerCase(),
  );

  const matchesKeywords = (place: Place): boolean => {
    if (keywords.length === 0) return true;
    const haystack = [place.name, place.description, place.city, place.address]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return keywords.some((keyword) => haystack.includes(keyword));
  };

  const matchesTag = (place: Place): boolean => {
    if (!hasTagIntent) return true;
    // Filtro por tag real (consenso das reviews).
    if (placeIdsWithTag.length > 0) {
      return placeIdsWithTag.includes(place.id);
    }
    // Fallback textual: nenhum lugar validado com a tag (poucos reviews),
    // usa os tag_slugs como termos de busca para não devolver vazio.
    const haystack = normalizeSearchText(
      [place.name, place.description, place.city, place.address]
        .filter(Boolean)
        .join(" "),
    );
    return tagSlugs.some((slug) =>
      haystack.includes(normalizeSearchText(slug)),
    );
  };

  const matchesCategory = (place: Place): boolean => {
    const placeCategoryId = place.category_id
      ? String(place.category_id)
      : null;

    if (categoryIdsFromIntent.size === 0) return true;
    if (!placeCategoryId) return false;
    return categoryIdsFromIntent.has(placeCategoryId);
  };

  const filterByCriteria = (useKeywords: boolean, useTag: boolean): Place[] =>
    rows.filter((place) => {
      if (!matchesCategory(place)) return false;
      if (useKeywords && !matchesKeywords(place)) return false;
      if (useTag && !matchesTag(place)) return false;
      return true;
    });

  // Filtra do mais restritivo para o mais permissivo (recurso em camadas),
  // para nunca devolver vazio quando há uma categoria clara (ex.: "cafeterias
  // pra trabalhar" deve mostrar cafeterias, mesmo sem tag/keyword validada).
  let filtered = filterByCriteria(true, true);
  if (filtered.length === 0) {
    filtered = filterByCriteria(true, false);
  }
  if (filtered.length === 0 && categoryIdsFromIntent.size > 0) {
    filtered = filterByCriteria(false, false);
  }

  return filtered;
}
