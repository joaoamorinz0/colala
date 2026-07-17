"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useSupabase } from "@/providers";
import { fetchPlaces } from "@/services";
import type { Place } from "@/types/place";

export const PLACES_QUERY_KEY = ["places"] as const;

export function usePlaces() {
  const { client, status: clientStatus } = useSupabase();

  const query = useQuery<Place[]>({
    queryKey: PLACES_QUERY_KEY,
    queryFn: () => {
      if (!client) {
        throw new Error("Supabase client não configurado.");
      }

      return fetchPlaces(client);
    },
    enabled: Boolean(client),
  });

  useEffect(() => {
    console.log("[usePlaces] client status:", clientStatus);
    console.log("[usePlaces] query status:", query.status, {
      isFetching: query.isFetching,
    });
    console.log("[usePlaces] data:", query.data);

    if (query.error) {
      console.error("[usePlaces] error:", query.error);
    }
  }, [clientStatus, query.status, query.isFetching, query.data, query.error]);

  return {
    ...query,
    clientStatus,
  };
}
