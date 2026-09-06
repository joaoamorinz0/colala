"use client";

import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "@/providers";
import { fetchPlaces } from "@/services/places.service";
import { parseSearchIntent } from "@/services/search-intent";
import type { Place } from "@/types/place";

export const SEARCH_PLACES_QUERY_KEY = ["search-places"] as const;

export type SearchPlacesFilters = {
  query: string;
  categoryId: string | null;
  subcategoryIds?: string[];
  workFriendly?: boolean;
  petFriendly?: boolean;
  wifi?: boolean;
  acceptsBookClub?: boolean;
};

export function useSearchPlaces(filters: SearchPlacesFilters) {
  const { client } = useSupabase();
  const {
    query,
    categoryId,
    subcategoryIds,
    workFriendly,
    petFriendly,
    wifi,
    acceptsBookClub,
  } = filters;

  return useQuery<Place[]>({
    queryKey: [
      SEARCH_PLACES_QUERY_KEY,
      query.trim(),
      categoryId,
      subcategoryIds,
      workFriendly,
      petFriendly,
      wifi,
      acceptsBookClub,
    ],
    queryFn: async () => {
      if (!client) {
        throw new Error("Supabase client não configurado.");
      }

      const naturalLanguageIntent =
        query.trim().length >= 2
          ? await parseSearchIntent(client, query)
          : null;

      return fetchPlaces(client, {
        query,
        categoryId,
        subcategoryIds,
        workFriendly,
        petFriendly,
        wifi,
        acceptsBookClub,
        naturalLanguageIntent,
        limit: 50,
      });
    },
    enabled: Boolean(client),
  });
}
