"use client";

import { EmptyState } from "@/components/layout";
import { FeaturedPlaceCard } from "@/components/place";
import { SkeletonCard } from "@/components/ui/skeleton-card";
import { MOCK_EXPERIENCES } from "@/features/places/constants";
import { usePlaces } from "@/features/places/hooks/use-places";
import { placeToExperience } from "@/features/places/utils/place-to-experience";

export function FeaturedPlaces() {
  const { data, isLoading, isError, error, clientStatus } = usePlaces();

  if (clientStatus === "not-configured") {
    const fallback = MOCK_EXPERIENCES[0];

    return fallback ? <FeaturedPlaceCard experience={fallback} /> : null;
  }

  if (isLoading) {
    return <SkeletonCard className="min-h-[34rem]" lines={3} />;
  }

  if (isError) {
    return (
      <EmptyState
        title="Não foi possível carregar os lugares"
        description={
          error instanceof Error ? error.message : "Erro desconhecido."
        }
      />
    );
  }

  const places = data ?? [];
  const featured = places[0];

  if (!featured) {
    return (
      <EmptyState
        title="Nenhum lugar encontrado"
        description="A consulta ao Supabase retornou 0 registros. Verifique se a tabela places tem dados e se o RLS permite SELECT para a chave publishable."
      />
    );
  }

  return <FeaturedPlaceCard experience={placeToExperience(featured)} />;
}
