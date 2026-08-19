"use client";

import { useEffect, useMemo, useState } from "react";
import { Filter } from "lucide-react";
import { AuthLayout, EmptyState } from "@/components/layout";
import { PlaceCard } from "@/components/place";
import { ProfileSearchRow } from "@/components/profile";
import { SearchBar } from "@/components/search/search-bar";
import { SkeletonCard } from "@/components/ui/skeleton-card";
import { LIST_STACK, SECTION_GAP, SECTION_STACK } from "@/constants/design";
import { cn } from "@/lib/utils";
import { useSupabase } from "@/providers";
import { categoriesService } from "@/services/categories";
import type { Category } from "@/types/category";
import type { Place } from "@/types/place";
import { FilterSheet, type FilterSheetState } from "./filter-sheet";
import { useSearchPlaces, useSearchProfiles } from "@/features/search";
import { useDebouncedValue, useUserGeolocation } from "@/hooks";
import { calculateDistanceKm } from "@/lib/distance";
import type { SearchPlacesFilters } from "@/features/search";

type SearchTab = "places" | "people";

export type SearchClientProps = {
  initialQuery: string;
  initialCategoryId: string | null;
};

const EMPTY_FILTERS: FilterSheetState = {
  workFriendly: false,
  petFriendly: false,
  wifi: false,
  acceptsBookClub: false,
  activeCategoryId: null,
  activeSubcategoryId: null,
};

function isGrantedState(
  geoState: ReturnType<typeof useUserGeolocation>,
): geoState is {
  status: "granted";
  coordinates: { latitude: number; longitude: number };
} {
  return geoState.status === "granted";
}

function countActiveFilters(f: FilterSheetState): number {
  let count = 0;
  if (f.activeCategoryId !== null) count++;
  if (f.activeSubcategoryId !== null) count++;
  if (f.workFriendly) count++;
  if (f.petFriendly) count++;
  if (f.wifi) count++;
  if (f.acceptsBookClub) count++;
  return count;
}

export function SearchClient({
  initialQuery,
  initialCategoryId,
}: SearchClientProps) {
  const { client } = useSupabase();
  const [query, setQuery] = useState(initialQuery);
  const [tab, setTab] = useState<SearchTab>("places");
  const [categories, setCategories] = useState<Category[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] =
    useState<FilterSheetState>(EMPTY_FILTERS);
  const debouncedQuery = useDebouncedValue(query, 300);
  const geoState = useUserGeolocation();

  useEffect(() => {
    if (!client) return;
    let cancelled = false;
    categoriesService
      .getAll()
      .then((data) => {
        if (!cancelled) setCategories(data);
      })
      .catch((error) => {
        console.error("[search] failed to load categories:", error);
      });
    return () => {
      cancelled = true;
    };
  }, [client]);

  const mainCategories = useMemo(
    () => categories.filter((c) => c.parent_id === null),
    [categories],
  );

  const subcategoryIds = useMemo(() => {
    const catId = appliedFilters.activeCategoryId;
    if (!catId) return undefined;
    if (appliedFilters.activeSubcategoryId)
      return [appliedFilters.activeSubcategoryId];
    const childIds = categories
      .filter((c) => c.parent_id === catId)
      .map((c) => String(c.id));
    return [catId, ...childIds];
  }, [
    appliedFilters.activeCategoryId,
    appliedFilters.activeSubcategoryId,
    categories,
  ]);

  const searchFilters: SearchPlacesFilters = useMemo(
    () => ({
      query: debouncedQuery,
      categoryId: appliedFilters.activeCategoryId,
      subcategoryIds,
      workFriendly: appliedFilters.workFriendly || undefined,
      petFriendly: appliedFilters.petFriendly || undefined,
      wifi: appliedFilters.wifi || undefined,
      acceptsBookClub: appliedFilters.acceptsBookClub || undefined,
    }),
    [
      debouncedQuery,
      appliedFilters.activeCategoryId,
      appliedFilters.workFriendly,
      appliedFilters.petFriendly,
      appliedFilters.wifi,
      appliedFilters.acceptsBookClub,
      subcategoryIds,
    ],
  );

  const placesQuery = useSearchPlaces(searchFilters);
  const profilesQuery = useSearchProfiles(debouncedQuery);

  const userCoordinates = isGrantedState(geoState)
    ? geoState.coordinates
    : null;

  const places = placesQuery.data ?? [];
  const profiles = profilesQuery.data ?? [];

  const isLoadingPlaces =
    placesQuery.isLoading ||
    (debouncedQuery.trim().length > 0 && placesQuery.isFetching);
  const isLoadingProfiles =
    profilesQuery.isLoading ||
    (debouncedQuery.trim().length > 0 && profilesQuery.isFetching);

  const hasActiveSearch = debouncedQuery.trim().length > 0;
  const hasFilter = countActiveFilters(appliedFilters) > 0;

  const initialFilterState: FilterSheetState = useMemo(
    () => ({
      ...appliedFilters,
      activeCategoryId: appliedFilters.activeCategoryId,
      activeSubcategoryId: appliedFilters.activeSubcategoryId,
    }),
    [appliedFilters],
  );

  return (
    <AuthLayout>
      <div className={SECTION_STACK}>
        <section className={SECTION_GAP}>
          {/* Barra de busca + ícone de filtro */}
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <SearchBar
                aria-label="Pesquisar"
                autoComplete="off"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar lugares ou pessoas..."
              />
            </div>
            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              className={cn(
                "relative flex size-11 shrink-0 items-center justify-center rounded-xl border transition-colors",
                hasFilter
                  ? "border-primary/60 bg-primary/10 text-primary"
                  : "border-border bg-card text-card-foreground hover:bg-muted",
              )}
              aria-label="Filtros"
            >
              <Filter className="size-5" />
              {hasFilter ? (
                <span className="bg-primary absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full text-[10px] font-bold text-white">
                  {countActiveFilters(appliedFilters)}
                </span>
              ) : null}
            </button>
          </div>

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

          {/* Active filter chips (resumo visual) */}
          {hasFilter && (
            <div className="-mx-page-x px-page-x flex scrollbar-none gap-2 overflow-x-auto pb-0.5">
              {appliedFilters.activeCategoryId !== null && (
                <ActiveFilterChip
                  label={getCategoryName(
                    categories,
                    appliedFilters.activeCategoryId,
                  )}
                  onRemove={() =>
                    setAppliedFilters((prev) => ({
                      ...prev,
                      activeCategoryId: null,
                      activeSubcategoryId: null,
                    }))
                  }
                />
              )}
              {appliedFilters.activeSubcategoryId !== null && (
                <ActiveFilterChip
                  label={getCategoryName(
                    categories,
                    appliedFilters.activeSubcategoryId,
                  )}
                  onRemove={() =>
                    setAppliedFilters((prev) => ({
                      ...prev,
                      activeSubcategoryId: null,
                    }))
                  }
                />
              )}
              {appliedFilters.workFriendly && (
                <ActiveFilterChip
                  label="💻 Work friendly"
                  onRemove={() =>
                    setAppliedFilters((prev) => ({
                      ...prev,
                      workFriendly: false,
                    }))
                  }
                />
              )}
              {appliedFilters.petFriendly && (
                <ActiveFilterChip
                  label="🐾 Pet friendly"
                  onRemove={() =>
                    setAppliedFilters((prev) => ({
                      ...prev,
                      petFriendly: false,
                    }))
                  }
                />
              )}
              {appliedFilters.wifi && (
                <ActiveFilterChip
                  label="📶 Wi-Fi"
                  onRemove={() =>
                    setAppliedFilters((prev) => ({
                      ...prev,
                      wifi: false,
                    }))
                  }
                />
              )}
              {appliedFilters.acceptsBookClub && (
                <ActiveFilterChip
                  label="📚 Clube do livro"
                  onRemove={() =>
                    setAppliedFilters((prev) => ({
                      ...prev,
                      acceptsBookClub: false,
                    }))
                  }
                />
              )}
              <button
                type="button"
                onClick={() => setAppliedFilters(EMPTY_FILTERS)}
                className="text-primary shrink-0 text-xs font-semibold"
              >
                Limpar tudo
              </button>
            </div>
          )}
        </section>

        {/* Results */}
        {tab === "places" ? (
          <section className={SECTION_GAP}>
            <h1 className="text-foreground text-xl font-extrabold tracking-tight">
              {hasActiveSearch || hasFilter ? "Resultados" : "Descubra lugares"}
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
                description="Tente mudar o termo da busca, selecionar outra categoria ou ajustar os filtros."
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

      {/* Filter bottom sheet */}
      <FilterSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onApply={(state) => setAppliedFilters(state)}
        initial={initialFilterState}
        categories={categories}
      />
    </AuthLayout>
  );
}

function getCategoryName(categories: Category[], id: string): string {
  return categories.find((c) => String(c.id) === id)?.name ?? id;
}

function ActiveFilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="border-primary/40 bg-primary/5 text-primary inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border pr-1.5 pl-3 text-xs font-semibold">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="text-primary/60 hover:text-primary ml-0.5"
      >
        ×
      </button>
    </span>
  );
}
