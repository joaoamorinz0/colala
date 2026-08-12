"use client";

import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "@/providers";
import { searchProfiles } from "@/services/profile.service";
import type { Profile } from "@/types/profile";

export const SEARCH_PROFILES_QUERY_KEY = ["search-profiles"] as const;

export function useSearchProfiles(query: string) {
  const { client } = useSupabase();

  return useQuery<Profile[]>({
    queryKey: [SEARCH_PROFILES_QUERY_KEY, query.trim()],
    queryFn: () => {
      if (!client) {
        throw new Error("Supabase client não configurado.");
      }

      return searchProfiles(client, query);
    },
    enabled: Boolean(client) && query.trim().length > 0,
  });
}
