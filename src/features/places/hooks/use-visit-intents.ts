"use client";

import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "@/providers";
import { fetchUserVisitIntents } from "@/services";
import type { Place } from "@/types/place";

export const VISIT_INTENTS_QUERY_KEY = ["visit-intents"] as const;

export function useVisitIntents() {
  const { client, user } = useSupabase();

  return useQuery<Place[]>({
    queryKey: [...VISIT_INTENTS_QUERY_KEY, user?.id],
    queryFn: () => {
      if (!client || !user) {
        throw new Error("Supabase client ou usuário não configurado.");
      }

      return fetchUserVisitIntents(client, user.id);
    },
    enabled: Boolean(client && user),
  });
}
