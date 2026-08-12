"use client";

import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "@/providers";
import { fetchPlaces } from "@/services/places.service";
import type { Place } from "@/types/place";

export const SEARCH_PLACES_QUERY_KEY = ["search-places"] as const;

type UseSearchPlacesOptions = {
  query: string;
  categoryId: string | null;
};

export function useSearchPlaces({ query, categoryId }: UseSearchPlacesOptions) {
  const { client } = useSupabase();

  return useQuery<Place[]>({
    queryKey: [SEARCH_PLACES_QUERY_KEY, query.trim(), categoryId],
    queryFn: () => {
      if (!client) {
        throw new Error("Supabase client não configurado.");
      }

      return fetchPlaces(client, { query, categoryId, limit: 20 });
    },
    enabled: Boolean(client),
  });
}
