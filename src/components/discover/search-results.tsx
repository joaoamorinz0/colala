"use client";

import { EmptyState } from "@/components/layout";
import { PlaceCard } from "@/components/place";
import { SkeletonCard } from "@/components/ui/skeleton-card";
import { LIST_STACK, SECTION_GAP } from "@/constants/design";
import { calculateDistanceKm, type Coordinates } from "@/lib/distance";
import type { Place } from "@/types/place";

type UserCoordinates = Coordinates | null;

export type SearchResultsProps = {
  places: Place[];
  isLoading: boolean;
  userCoordinates: UserCoordinates;
  query: string;
};

function getDistanceKm(
  place: Place,
  userCoordinates: UserCoordinates,
): number | undefined {
  if (
    !userCoordinates ||
    typeof place.latitude !== "number" ||
    typeof place.longitude !== "number"
  ) {
    return undefined;
  }

  return calculateDistanceKm(userCoordinates, {
    latitude: place.latitude,
    longitude: place.longitude,
  });
}

/**
 * Lista de resultados de busca/filtro da tela Discover.
 * Reaproveita a mesma lógica de exibição da antiga tela de Search
 * (PlaceCard + distância). Os carrosséis de descoberta ficam de fora aqui.
 */
export function SearchResults({
  places,
  isLoading,
  userCoordinates,
  query,
}: SearchResultsProps) {
  const trimmedQuery = query.trim();

  return (
    <section className={SECTION_GAP}>
      <h1 className="text-foreground text-xl font-extrabold tracking-tight">
        {trimmedQuery ? `Resultados para "${trimmedQuery}"` : "Resultados"}
      </h1>

      {isLoading ? (
        <div className={LIST_STACK}>
          <SkeletonCard lines={3} />
          <SkeletonCard lines={3} />
          <SkeletonCard lines={3} />
        </div>
      ) : places.length > 0 ? (
        <div className={LIST_STACK}>
          {places.map((place) => (
            <PlaceCard
              key={place.id}
              place={place}
              distanceKm={getDistanceKm(place, userCoordinates)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Nenhum lugar encontrado"
          description="Tente mudar o termo da busca, selecionar outra categoria ou ajustar os filtros."
        />
      )}
    </section>
  );
}
