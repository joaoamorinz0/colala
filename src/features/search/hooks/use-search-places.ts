"use client";

import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "@/providers";
import { fetchPlaces } from "@/services/places.service";
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
    queryFn: () => {
      if (!client) {
        throw new Error("Supabase client não configurado.");
      }

      return fetchPlaces(client, {
        query,
        categoryId,
        subcategoryIds,
        workFriendly,
        petFriendly,
        wifi,
        acceptsBookClub,
        limit: 50,
      });
    },
    enabled: Boolean(client),
  });
}
