"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/providers";
import { useToast } from "@/components/ui/toast";
import { addVisitIntent, isIntentByUser, removeVisitIntent } from "@/services";

export const VISIT_INTENT_QUERY_KEY = ["visit-intent"] as const;
export const VISIT_INTENTS_QUERY_KEY = ["visit-intents"] as const;

export function useVisitIntent(placeId: string) {
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { client, user } = useSupabase();

  const query = useQuery<boolean>({
    queryKey: [...VISIT_INTENT_QUERY_KEY, user?.id, placeId],
    queryFn: () => {
      if (!client || !user) {
        throw new Error("Supabase client ou usuário não configurado.");
      }

      return isIntentByUser(client, user.id, placeId);
    },
    enabled: Boolean(client && user),
  });

  const toggleMutation = useMutation({
    mutationFn: async () => {
      if (!client || !user) {
        throw new Error("Supabase client ou usuário não configurado.");
      }

      const isActive = query.data;

      if (isActive) {
        await removeVisitIntent(client, user.id, placeId);
      } else {
        await addVisitIntent(client, user.id, placeId);
      }

      return !isActive;
    },
    onMutate: async () => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: [...VISIT_INTENT_QUERY_KEY, user?.id, placeId],
      });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData<boolean>([
        ...VISIT_INTENT_QUERY_KEY,
        user?.id,
        placeId,
      ]);

      // Optimistically update
      queryClient.setQueryData(
        [...VISIT_INTENT_QUERY_KEY, user?.id, placeId],
        (old: boolean | undefined) => !old,
      );

      return { previousData };
    },
    onError: (_error, _variables, context) => {
      // Rollback to the previous value
      if (context?.previousData !== undefined) {
        queryClient.setQueryData(
          [...VISIT_INTENT_QUERY_KEY, user?.id, placeId],
          context.previousData,
        );
      }

      toast.show("Não foi possível atualizar. Tente novamente.", "error");
    },
    onSuccess: (newValue) => {
      // Revalida a lista de planos (página /planos)
      queryClient.invalidateQueries({
        queryKey: [...VISIT_INTENTS_QUERY_KEY, user?.id],
      });

      toast.show(
        newValue ? "Adicionado aos seus planos!" : "Removido dos seus planos.",
        "success",
      );
    },
  });

  const handleToggle = () => {
    if (!user) {
      router.push(
        `/login?redirectTo=${encodeURIComponent(`/place/${placeId}`)}`,
      );
      return;
    }

    toggleMutation.mutate();
  };

  return {
    isActive: query.data ?? false,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    toggle: handleToggle,
    isToggling: toggleMutation.isPending,
  };
}
