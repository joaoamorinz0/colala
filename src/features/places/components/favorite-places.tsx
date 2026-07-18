"use client";

import { EmptyState } from "@/components/layout";
import { FavoritePlaceRow } from "@/components/place";
import { SkeletonCard } from "@/components/ui/skeleton-card";
import { LIST_STACK } from "@/constants/design";
import { MOCK_EXPERIENCES } from "@/features/places/constants";
import { usePlaces } from "@/features/places/hooks/use-places";
import { placeToExperience } from "@/features/places/utils/place-to-experience";
import { cn } from "@/lib/utils";

export function FavoritePlaces() {
  const { data, isLoading, isError, error, clientStatus } = usePlaces();

  if (clientStatus === "not-configured") {
    return (
      <div className={cn(LIST_STACK)}>
        {MOCK_EXPERIENCES.slice(0, 2).map((experience) => (
          <FavoritePlaceRow experience={experience} key={experience.id} />
        ))}
      </div>
    );
  }

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
        description="A consulta ao Supabase retornou 0 registros. Verifique se a tabela places tem dados e se o RLS permite SELECT para a chave publishable."
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
