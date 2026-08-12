"use client";

import { useEffect, useState } from "react";
import { AuthLayout } from "@/components/layout";
import { EmptyState } from "@/components/layout";
import { PlaceCard } from "@/components/place";
import { ProfileSearchRow } from "@/components/profile";
import { SearchBar } from "@/components/search/search-bar";
import { SkeletonCard } from "@/components/ui/skeleton-card";
import { LIST_STACK, SECTION_GAP, SECTION_STACK } from "@/constants/design";
import { useSearchPlaces, useSearchProfiles } from "@/features/search";
import { useDebouncedValue, useUserGeolocation } from "@/hooks";
import { calculateDistanceKm } from "@/lib/distance";
import { cn } from "@/lib/utils";
import { useSupabase } from "@/providers";
import { categoriesService } from "@/services/categories";
import type { Category } from "@/types/category";
import type { Place } from "@/types/place";

type SearchTab = "places" | "people";

export type SearchClientProps = {
  initialQuery: string;
  initialCategoryId: string | null;
};

function isGrantedState(
  geoState: ReturnType<typeof useUserGeolocation>,
): geoState is {
  status: "granted";
  coordinates: { latitude: number; longitude: number };
} {
  return geoState.status === "granted";
}

export function SearchClient({
  initialQuery,
  initialCategoryId,
}: SearchClientProps) {
  const { client } = useSupabase();
  const [query, setQuery] = useState(initialQuery);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(
    initialCategoryId,
  );
  const [tab, setTab] = useState<SearchTab>("places");
  const [categories, setCategories] = useState<Category[]>([]);
  const debouncedQuery = useDebouncedValue(query, 300);
  const geoState = useUserGeolocation();

  const placesQuery = useSearchPlaces({
    query: debouncedQuery,
    categoryId: activeCategoryId,
  });
  const profilesQuery = useSearchProfiles(debouncedQuery);

  const userCoordinates = isGrantedState(geoState)
    ? geoState.coordinates
    : null;

  useEffect(() => {
    if (!client) return;

    let cancelled = false;

    categoriesService
      .getAll()
      .then((data) => {
        if (!cancelled) {
          setCategories(data);
        }
      })
      .catch((error) => {
        console.error("[search] failed to load categories:", error);
      });

    return () => {
      cancelled = true;
    };
  }, [client]);

  const places = placesQuery.data ?? [];
  const profiles = profilesQuery.data ?? [];

  const isLoadingPlaces =
    placesQuery.isLoading ||
    (debouncedQuery.trim().length > 0 && placesQuery.isFetching);
  const isLoadingProfiles =
    profilesQuery.isLoading ||
    (debouncedQuery.trim().length > 0 && profilesQuery.isFetching);

  const hasActiveSearch = debouncedQuery.trim().length > 0;
  const hasCategoryFilter = activeCategoryId !== null;

  return (
    <AuthLayout>
      <div className={SECTION_STACK}>
        {/* Form de busca */}
        <section className={SECTION_GAP}>
          <SearchBar
            aria-label="Pesquisar"
            autoComplete="off"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar lugares ou pessoas..."
          />
          <p className="text-muted-foreground text-sm">
            {hasActiveSearch
              ? `Mostrando resultados para "${debouncedQuery}"`
              : "Busque por lugares (nome, cidade ou descrição) ou pessoas (nome ou usuário)."}
          </p>

          {/* Tabs */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setTab("places")}
              className={cn(
                "h-10 flex-1 rounded-full border text-sm font-semibold transition-colors",
                tab === "places"
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-card-foreground hover:bg-muted",
              )}
            >
              Lugares
            </button>
            <button
              type="button"
              onClick={() => setTab("people")}
              className={cn(
                "h-10 flex-1 rounded-full border text-sm font-semibold transition-colors",
                tab === "people"
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-card-foreground hover:bg-muted",
              )}
            >
              Pessoas
            </button>
          </div>

          {/* Filtro por categoria (apenas Lugares) */}
          {tab === "places" && categories.length > 0 && (
            <div className="-mx-page-x px-page-x flex scrollbar-none gap-2 overflow-x-auto pb-0.5">
              <button
                type="button"
                onClick={() => setActiveCategoryId(null)}
                className={cn(
                  "inline-flex h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors",
                  activeCategoryId === null
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-card-foreground hover:bg-muted",
                )}
              >
                Todas
              </button>
              {categories.map((category) => (
                <button
                  key={String(category.id)}
                  type="button"
                  onClick={() => setActiveCategoryId(String(category.id))}
                  className={cn(
                    "inline-flex h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors",
                    activeCategoryId === String(category.id)
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-card-foreground hover:bg-muted",
                  )}
                >
                  {category.icon ? <span>{category.icon}</span> : null}
                  {category.name}
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Resultados */}
        {tab === "places" ? (
          <section className={SECTION_GAP}>
            <h1 className="text-foreground text-xl font-extrabold tracking-tight">
              {hasCategoryFilter || hasActiveSearch
                ? "Resultados"
                : "Descubra lugares"}
            </h1>

            {isLoadingPlaces ? (
              <div className={LIST_STACK}>
                <SkeletonCard lines={3} />
                <SkeletonCard lines={3} />
                <SkeletonCard lines={3} />
              </div>
            ) : places.length > 0 ? (
              <div className={LIST_STACK}>
                {places.map((place: Place) => {
                  const distanceKm =
                    userCoordinates &&
                    typeof place.latitude === "number" &&
                    typeof place.longitude === "number"
                      ? calculateDistanceKm(userCoordinates, {
                          latitude: place.latitude,
                          longitude: place.longitude,
                        })
                      : undefined;

                  return (
                    <PlaceCard
                      key={place.id}
                      place={place}
                      distanceKm={distanceKm}
                    />
                  );
                })}
              </div>
            ) : (
              <EmptyState
                title="Nenhum lugar encontrado"
                description="Tente mudar o termo da busca ou selecionar outra categoria."
              />
            )}
          </section>
        ) : (
          <section className={SECTION_GAP}>
            <h1 className="text-foreground text-xl font-extrabold tracking-tight">
              Pessoas
            </h1>

            {isLoadingProfiles ? (
              <div className={LIST_STACK}>
                <SkeletonCard lines={2} />
                <SkeletonCard lines={2} />
              </div>
            ) : debouncedQuery.trim().length === 0 ? (
              <EmptyState
                title="Busque por pessoas"
                description="Digite um nome ou usuário para encontrar perfis públicos."
              />
            ) : profiles.length > 0 ? (
              <div className={LIST_STACK}>
                {profiles.map((profile) => (
                  <ProfileSearchRow key={profile.id} profile={profile} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="Nenhuma pessoa encontrada"
                description={`Nenhum perfil corresponde a "${debouncedQuery}".`}
              />
            )}
          </section>
        )}
      </div>
    </AuthLayout>
  );
}
