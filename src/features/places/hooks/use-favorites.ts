"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "@/providers";
import {
  addFavorite,
  fetchUserFavorites,
  isFavoritedByUser,
  removeFavorite,
} from "@/services";
import type { Place } from "@/types/place";

export const FAVORITES_QUERY_KEY = ["favorites"] as const;

export function useFavorites() {
  const { client, user } = useSupabase();

  const query = useQuery<Place[]>({
    queryKey: [...FAVORITES_QUERY_KEY, user?.id],
    queryFn: () => {
      if (!client || !user) {
        throw new Error("Supabase client ou usuário não configurado.");
      }

      return fetchUserFavorites(client, user.id);
    },
    enabled: Boolean(client && user),
  });

  return {
    ...query,
  };
}

export function useFavoriteStatus(placeId: string) {
  const { client, user } = useSupabase();
  const queryClient = useQueryClient();

  const query = useQuery<boolean>({
    queryKey: [...FAVORITES_QUERY_KEY, user?.id, placeId],
    queryFn: () => {
      if (!client || !user) {
        throw new Error("Supabase client ou usuário não configurado.");
      }

      return isFavoritedByUser(client, user.id, placeId);
    },
    enabled: Boolean(client && user),
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      if (!client || !user) {
        throw new Error("Supabase client ou usuário não configurado.");
      }

      const isFavored = query.data;

      if (isFavored) {
        await removeFavorite(client, user.id, placeId);
      } else {
        await addFavorite(client, user.id, placeId);
      }

      return !isFavored;
    },
    onMutate: async () => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: [...FAVORITES_QUERY_KEY, user?.id, placeId],
      });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData<boolean>([
        ...FAVORITES_QUERY_KEY,
        user?.id,
        placeId,
      ]);

      // Optimistically update to the new value
      queryClient.setQueryData(
        [...FAVORITES_QUERY_KEY, user?.id, placeId],
        (old: boolean | undefined) => !old,
      );

      return { previousData };
    },
    onError: (_error, _variables, context) => {
      // Rollback to the previous value on error
      if (context?.previousData !== undefined) {
        queryClient.setQueryData(
          [...FAVORITES_QUERY_KEY, user?.id, placeId],
          context.previousData,
        );
      }
    },
    onSuccess: () => {
      // Invalidate and refetch the full favorites list
      queryClient.invalidateQueries({
        queryKey: [...FAVORITES_QUERY_KEY, user?.id],
      });
    },
  });

  return {
    isFavored: query.data ?? false,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    toggleFavorite: toggleFavoriteMutation.mutate,
    isToggling: toggleFavoriteMutation.isPending,
  };
}
