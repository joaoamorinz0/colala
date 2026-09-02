"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "@/providers";
import {
  deleteReview,
  fetchReviewTags,
  fetchPlaceReviewSummary,
  fetchReviewsForPlace,
  fetchUserReviewForPlace,
  saveReview,
  type PlaceReviewSummary,
  type SaveReviewInput,
} from "@/services/reviews.service";
import type { PlaceReview, Review, ReviewTag } from "@/types/review";

export const PLACE_REVIEWS_QUERY_KEY = ["place-review-summary"] as const;
export const USER_PLACE_REVIEW_QUERY_KEY = ["user-place-review"] as const;
export const REVIEW_TAGS_QUERY_KEY = ["review-tags"] as const;
export const PLACE_REVIEW_LIST_QUERY_KEY = ["place-review-list"] as const;

/** Média + quantidade de avaliações de um lugar (leitura pública). */
export function usePlaceReviewSummary(placeId: string) {
  const { client } = useSupabase();

  return useQuery<PlaceReviewSummary>({
    queryKey: [...PLACE_REVIEWS_QUERY_KEY, placeId],
    queryFn: () => {
      if (!client) {
        throw new Error("Supabase client não configurado.");
      }

      return fetchPlaceReviewSummary(client, placeId);
    },
    enabled: Boolean(client),
  });
}

/** Avaliação do usuário logado para o lugar, se existir (pré-carrega o modal). */
export function useUserPlaceReview(placeId: string) {
  const { client, user } = useSupabase();

  return useQuery<Review | null>({
    queryKey: [...USER_PLACE_REVIEW_QUERY_KEY, user?.id, placeId],
    queryFn: () => {
      if (!client || !user) {
        throw new Error("Supabase client ou usuário não configurado.");
      }

      return fetchUserReviewForPlace(client, user.id, placeId);
    },
    enabled: Boolean(client && user),
  });
}

/** Salva (insert se não existir, update se já) a avaliação do usuário. */
export function useSavePlaceReview(placeId: string) {
  const queryClient = useQueryClient();
  const { client, user } = useSupabase();

  return useMutation({
    mutationFn: async (input: SaveReviewInput) => {
      if (!client || !user) {
        throw new Error("Supabase client ou usuário não configurado.");
      }

      return saveReview(client, user.id, placeId, input);
    },
    onSuccess: () => {
      // Recalcula média/quantidade e revalida a avaliação do usuário
      queryClient.invalidateQueries({
        queryKey: [...PLACE_REVIEWS_QUERY_KEY, placeId],
      });
      queryClient.invalidateQueries({
        queryKey: [...PLACE_REVIEW_LIST_QUERY_KEY, placeId],
      });
      queryClient.invalidateQueries({
        queryKey: [...USER_PLACE_REVIEW_QUERY_KEY, user?.id, placeId],
      });
    },
  });
}

export function useDeletePlaceReview(placeId: string) {
  const queryClient = useQueryClient();
  const { client, user } = useSupabase();

  return useMutation({
    mutationFn: async (reviewId: string) => {
      if (!client || !user) {
        throw new Error("Supabase client ou usuário não configurado.");
      }

      return deleteReview(client, reviewId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...PLACE_REVIEWS_QUERY_KEY, placeId],
      });
      queryClient.invalidateQueries({
        queryKey: [...PLACE_REVIEW_LIST_QUERY_KEY, placeId],
      });
      queryClient.invalidateQueries({
        queryKey: [...USER_PLACE_REVIEW_QUERY_KEY, user?.id, placeId],
      });
    },
  });
}

export function useReviewTags() {
  const { client } = useSupabase();

  return useQuery<ReviewTag[]>({
    queryKey: REVIEW_TAGS_QUERY_KEY,
    queryFn: () => {
      if (!client) {
        throw new Error("Supabase client não configurado.");
      }

      return fetchReviewTags(client);
    },
    enabled: Boolean(client),
  });
}

/** Lista de avaliações de um lugar, com autor, tags e fotos (leitura pública). */
export function usePlaceReviews(placeId: string) {
  const { client } = useSupabase();

  return useQuery<PlaceReview[]>({
    queryKey: [...PLACE_REVIEW_LIST_QUERY_KEY, placeId],
    queryFn: () => {
      if (!client) {
        throw new Error("Supabase client não configurado.");
      }

      return fetchReviewsForPlace(client, placeId);
    },
    enabled: Boolean(client),
  });
}
