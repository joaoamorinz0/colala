"use client";

import { EmptyState } from "@/components/layout";
import { FavoritePlaceRow } from "@/components/place";
import { SkeletonCard } from "@/components/ui/skeleton-card";
import { LIST_STACK } from "@/constants/design";
import { useFavorites } from "@/features/places/hooks/use-favorites";
import { placeToExperience } from "@/features/places/utils/place-to-experience";
import { cn } from "@/lib/utils";

export function FavoritePlaces() {
  const { data, isLoading, isError, error } = useFavorites();

  if (isLoading) {
    return (
      <div className={cn(LIST_STACK)}>
        <SkeletonCard lines={2} />
        <SkeletonCard lines={2} />
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        title="Não foi possível carregar os favoritos"
        description={
          error instanceof Error ? error.message : "Erro desconhecido."
        }
      />
    );
  }

  const places = data ?? [];

  if (places.length === 0) {
    return (
      <EmptyState
        title="Nenhum lugar salvo"
        description="Você ainda não tem favoritos. Explore novos lugares e adicione seus favoritos!"
      />
    );
  }

  return (
    <div className={cn(LIST_STACK)}>
      {places.map((place) => (
        <FavoritePlaceRow
          experience={placeToExperience(place)}
          key={place.id}
        />
      ))}
    </div>
  );
}
