"use client";

import { useMemo } from "react";
import { BedDouble, Flame, MapPin, Star } from "lucide-react";
import { HorizontalCard, PlacesCarouselSection } from "@/components/place";
import { HomeEventsSection } from "@/components/events/home-events-section";
import { LIST_STACK, SECTION_GAP } from "@/constants/design";
import { calculateDistanceKm, type Coordinates } from "@/lib/distance";
import type { Category } from "@/types/category";
import type { Place } from "@/types/place";

type GeoState =
  | { status: "idle" | "loading" | "denied" }
  | { status: "granted"; coordinates: Coordinates }
  | { status: "error"; message: string };

type GeoGrantedState = Extract<GeoState, { status: "granted" }>;

function isGeoGrantedState(state: GeoState): state is GeoGrantedState {
  return state.status === "granted";
}

function hasCoordinates(place: Place) {
  return (
    typeof place.latitude === "number" && typeof place.longitude === "number"
  );
}

type PlaceWithCoordinates = Place & {
  latitude: number;
  longitude: number;
};

function hasCoordinateData(place: Place): place is PlaceWithCoordinates {
  return hasCoordinates(place);
}

function sortByRecency(places: Place[]) {
  return [...places].sort(
    (left, right) =>
      new Date(right.created_at).getTime() -
      new Date(left.created_at).getTime(),
  );
}

function getDistanceLabel(distanceKm: number) {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }

  return `${distanceKm.toFixed(1)} km`;
}

export type DiscoverySectionsProps = {
  places: Place[];
  categories: Category[];
  geoState: GeoState;
  isLoading: boolean;
};

/**
 * Conteúdo de "descobrir" da tela Discover (estado padrão, sem busca ativa).
 * Reaproveita exatamente as seções da antiga Home:
 * Destaques → Eventos em Brasília → Onde ficar → Próximos/Locais recentes → Novidades.
 */
export function DiscoverySections({
  places,
  categories,
  geoState,
  isLoading,
}: DiscoverySectionsProps) {
  const featuredPlaces = useMemo(
    () => places.filter((place) => place.featured),
    [places],
  );

  const nearbyPlaces = useMemo(() => {
    if (!isGeoGrantedState(geoState)) {
      return [];
    }

    const { coordinates } = geoState;

    return places
      .filter(hasCoordinateData)
      .map((place) => ({
        place,
        distanceKm: calculateDistanceKm(coordinates, {
          latitude: place.latitude,
          longitude: place.longitude,
        }),
      }))
      .sort((left, right) => left.distanceKm - right.distanceKm);
  }, [places, geoState]);

  const recentPlaces = useMemo(() => sortByRecency(places), [places]);

  const estadaCategory = categories.find(
    (category) => category.slug === "estadia" || category.name === "Estadia",
  );

  const estadaCategoryIds = useMemo(() => {
    if (!estadaCategory) return new Set<string>();
    const ids = new Set<string>([String(estadaCategory.id)]);
    categories.forEach((category) => {
      if (category.parent_id === String(estadaCategory.id)) {
        ids.add(String(category.id));
      }
    });
    return ids;
  }, [categories, estadaCategory]);

  const stayPlaces = useMemo(
    () =>
      places.filter((place) =>
        place.category_id
          ? estadaCategoryIds.has(String(place.category_id))
          : false,
      ),
    [places, estadaCategoryIds],
  );

  const nearbyFallbackPlaces = recentPlaces.slice(0, 6);
  const noveltyPlaces = recentPlaces.slice(0, 6);
  const showRecentInsteadOfNearby = geoState.status !== "granted";

  return (
    <>
      <PlacesCarouselSection
        title="Destaques"
        icon={<Star className="text-primary size-5" />}
        places={featuredPlaces}
        isLoading={isLoading}
        emptyMessage="Nenhum destaque disponível no momento."
      />

      <HomeEventsSection />

      <PlacesCarouselSection
        title="Onde ficar"
        icon={<BedDouble className="text-primary size-5" />}
        places={stayPlaces}
      />

      <section className={SECTION_GAP}>
        <div className="flex items-center gap-2">
          <MapPin className="text-primary size-5" />
          <h2 className="text-foreground text-xl font-extrabold tracking-tight">
            {showRecentInsteadOfNearby ? "Locais recentes" : "Próximos de você"}
          </h2>
        </div>

        {isLoading ? (
          <div className="border-border bg-card text-muted-foreground rounded-card-lg p-card border text-sm">
            Carregando locais...
          </div>
        ) : showRecentInsteadOfNearby ? (
          <>
            {geoState.status === "denied" ? (
              <div className="border-border bg-card text-muted-foreground rounded-card-lg p-card border text-sm">
                Localização negada. Mostrando locais recentes.
              </div>
            ) : geoState.status === "error" && "message" in geoState ? (
              <div className="border-border bg-card text-muted-foreground rounded-card-lg p-card border text-sm">
                {geoState.message}
              </div>
            ) : null}

            <div className={LIST_STACK}>
              {nearbyFallbackPlaces.map((place) => (
                <HorizontalCard key={place.id} place={place} />
              ))}
            </div>
          </>
        ) : (
          <>
            {nearbyPlaces.length ? (
              <div className={LIST_STACK}>
                {nearbyPlaces.slice(0, 8).map(({ place, distanceKm }) => (
                  <div key={place.id} className="relative">
                    <HorizontalCard place={place} />
                    <span className="text-muted-foreground absolute top-4 right-4 rounded-full bg-white/90 px-2 py-1 text-xs font-semibold shadow-sm">
                      {getDistanceLabel(distanceKm)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border-border bg-card text-muted-foreground rounded-card-lg p-card border text-sm">
                Não encontramos locais com coordenadas próximas.
              </div>
            )}
          </>
        )}
      </section>

      <section className={SECTION_GAP}>
        <div className="flex items-center gap-2">
          <Flame className="text-primary size-5" />
          <h2 className="text-foreground text-xl font-extrabold tracking-tight">
            Novidades
          </h2>
        </div>
        {isLoading ? (
          <div className="border-border bg-card text-muted-foreground rounded-card-lg p-card border text-sm">
            Carregando novidades...
          </div>
        ) : noveltyPlaces.length ? (
          <div className={LIST_STACK}>
            {noveltyPlaces.map((place) => (
              <HorizontalCard key={place.id} place={place} />
            ))}
          </div>
        ) : (
          <div className="border-border bg-card text-muted-foreground rounded-card-lg p-card border text-sm">
            Nenhum lugar novo encontrado.
          </div>
        )}
      </section>
    </>
  );
}
