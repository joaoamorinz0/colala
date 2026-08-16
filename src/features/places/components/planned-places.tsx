"use client";

import { EmptyState } from "@/components/layout";
import { MasonryPlaceCard } from "@/components/place";
import { SkeletonCard } from "@/components/ui/skeleton-card";
import { LIST_STACK } from "@/constants/design";
import { useVisitIntents } from "@/features/places/hooks/use-visit-intents";
import { cn } from "@/lib/utils";

export function PlannedPlaces() {
  const { data, isLoading, isError, error } = useVisitIntents();

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
        title="Não foi possível carregar seus planos"
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
        title="Nenhum lugar na sua lista"
        description='Toque em "Quero ir" na página de um lugar para adicioná-lo aos seus planos.'
      />
    );
  }

  return (
    <div className="columns-2 gap-3 sm:columns-3">
      {places.map((place, index) => (
        <MasonryPlaceCard key={place.id} place={place} index={index} />
      ))}
    </div>
  );
}
