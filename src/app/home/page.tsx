"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AuthLayout } from "@/components/layout";
import { SectionHeader } from "@/components/layout/section-header";
import { HeroCard, HorizontalCard } from "@/components/place";
import { CategoryChip } from "@/components/search/category-chip";
import { LargeSearchBox } from "@/components/search/large-search-box";
import { LIST_STACK, SECTION_GAP, SECTION_STACK } from "@/constants/design";
import { EXPERIENCE_CATEGORIES } from "@/features/places";
import { cn } from "@/lib/utils";
import { calculateDistanceKm, type Coordinates } from "@/lib/distance";
import { useSupabase } from "@/providers";
import { fetchPlaces } from "@/services/places.service";
import type { Place } from "@/types/place";

type GeoState =
  | { status: "idle" | "loading" | "granted" | "denied" | "error" }
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

export default function HomePage() {
  const { client } = useSupabase();
  const [geoState, setGeoState] = useState<GeoState>({ status: "idle" });

  const placesQuery = useQuery({
    queryKey: ["home-places"],
    queryFn: async () => {
      if (!client) {
        throw new Error("Supabase não configurado");
      }

      return fetchPlaces(client);
    },
    enabled: Boolean(client),
  });

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setGeoState({
        status: "error",
        message: "Geolocalização não disponível neste dispositivo.",
      });
      return;
    }

    setGeoState({ status: "loading" });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGeoState({
          status: "granted",
          coordinates: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
        });
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED || error.code === 1) {
          setGeoState({ status: "denied" });
          return;
        }

        setGeoState({
          status: "error",
          message:
            error.message || "Não foi possível obter sua localização agora.",
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5 * 60 * 1000,
      },
    );
  }, []);

  const allPlaces = useMemo(() => placesQuery.data ?? [], [placesQuery.data]);

  const featuredPlaces = useMemo(
    () => allPlaces.filter((place) => place.featured),
    [allPlaces],
  );

  const nearbyPlaces = useMemo(() => {
    if (!isGeoGrantedState(geoState)) {
      return [];
    }

    const { coordinates } = geoState;

    return allPlaces
      .filter(hasCoordinateData)
      .map((place) => ({
        place,
        distanceKm: calculateDistanceKm(coordinates, {
          latitude: place.latitude,
          longitude: place.longitude,
        }),
      }))
      .sort((left, right) => left.distanceKm - right.distanceKm);
  }, [allPlaces, geoState]);

  const recentPlaces = useMemo(() => sortByRecency(allPlaces), [allPlaces]);

  const chips = EXPERIENCE_CATEGORIES.slice(0, 4);
  const featuredPlace = featuredPlaces[0] ?? null;
  const nearbyFallbackPlaces = recentPlaces.slice(0, 6);
  const noveltyPlaces = recentPlaces.slice(0, 6);
  const showRecentInsteadOfNearby = geoState.status !== "granted";

  return (
    <AuthLayout>
      <div className={cn(SECTION_STACK, "overflow-hidden")}>
        <header className="gap-stack-md flex flex-col items-start justify-between">
          <div className="min-w-0">
            <p className="text-muted-foreground text-sm">Olá</p>
            <p className="text-foreground mt-1 text-2xl font-bold tracking-tight">
              Bem-vindo ao Colalá
            </p>
          </div>
        </header>

        <h1 className="text-foreground max-w-[16rem] text-[2rem] leading-[1.12] font-extrabold tracking-tight">
          Descubra o melhor perto de você
        </h1>

        <LargeSearchBox placeholder="Buscar lugares..." showFilter />

        <div className="-mx-page-x gap-stack-sm px-page-x flex scrollbar-none overflow-x-auto pb-0.5">
          {chips.map((category, index) => {
            const Icon = category.icon;

            return (
              <CategoryChip
                active={index === 0}
                icon={<Icon className="size-4" />}
                key={category.id}
              >
                {category.label}
              </CategoryChip>
            );
          })}
        </div>

        <section className={SECTION_GAP}>
          <SectionHeader title="⭐ Destaques" />
          {placesQuery.isLoading ? (
            <div className="border-border bg-card text-muted-foreground rounded-card-lg p-card border text-sm">
              Carregando destaques...
            </div>
          ) : featuredPlace ? (
            <HeroCard place={featuredPlace} />
          ) : (
            <div className="border-border bg-card text-muted-foreground rounded-card-lg p-card border text-sm">
              Nenhum destaque disponível no momento.
            </div>
          )}
        </section>

        <section className={SECTION_GAP}>
          <SectionHeader
            title={
              showRecentInsteadOfNearby
                ? "📍 Locais recentes"
                : "📍 Próximos de você"
            }
          />

          {placesQuery.isLoading ? (
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
          <SectionHeader title="🔥 Novidades" />
          {placesQuery.isLoading ? (
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
      </div>
    </AuthLayout>
  );
}
