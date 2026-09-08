"use client";

import { useEffect, useMemo, useState } from "react";
import { Filter } from "lucide-react";
import { AuthLayout } from "@/components/layout";
import { CategoryChip } from "@/components/search/category-chip";
import {
  FilterSheet,
  type FilterSheetState,
} from "@/components/search/filter-sheet";
import { SearchBar } from "@/components/search/search-bar";
import { DiscoverySections } from "@/components/discover/discovery-sections";
import { SearchResults } from "@/components/discover/search-results";
import { SECTION_STACK } from "@/constants/design";
import type { Coordinates } from "@/lib/distance";
import { cn } from "@/lib/utils";
import { useSupabase } from "@/providers";
import { categoriesService } from "@/services/categories";
import { useSearchPlaces, type SearchPlacesFilters } from "@/features/search";
import { useDebouncedValue, useUserGeolocation } from "@/hooks";
import type { Category } from "@/types/category";

const EMPTY_FILTERS: FilterSheetState = {
  workFriendly: false,
  petFriendly: false,
  wifi: false,
  acceptsBookClub: false,
  activeCategoryId: null,
  activeSubcategoryId: null,
};

function countActiveFilters(filters: FilterSheetState): number {
  let count = 0;
  if (filters.activeCategoryId !== null) count++;
  if (filters.activeSubcategoryId !== null) count++;
  if (filters.workFriendly) count++;
  if (filters.petFriendly) count++;
  if (filters.wifi) count++;
  if (filters.acceptsBookClub) count++;
  return count;
}

function isGrantedState(
  geoState: ReturnType<typeof useUserGeolocation>,
): geoState is { status: "granted"; coordinates: Coordinates } {
  return geoState.status === "granted";
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Bom dia";
  if (hour >= 12 && hour < 18) return "Boa tarde";
  if (hour >= 18 && hour < 22) return "Boa noite";
  return "Boa madrugada";
}

export function DiscoverClient() {
  const { client } = useSupabase();
  const [query, setQuery] = useState("");
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
        if (!cancelled) {
          setCategories(data);
        }
      })
      .catch((error) => {
        console.error("[discover] failed to load categories:", error);
      });

    return () => {
      cancelled = true;
    };
  }, [client]);

  const mainCategories = useMemo(
    () => categories.filter((category) => category.parent_id === null),
    [categories],
  );

  const subcategoryIds = useMemo(() => {
    const categoryId = appliedFilters.activeCategoryId;
    if (!categoryId) return undefined;
    if (appliedFilters.activeSubcategoryId)
      return [appliedFilters.activeSubcategoryId];
    const childIds = categories
      .filter((category) => category.parent_id === categoryId)
      .map((category) => String(category.id));
    return [categoryId, ...childIds];
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
  const places = placesQuery.data ?? [];

  const hasFilter = countActiveFilters(appliedFilters) > 0;
  const hasActiveSearch = debouncedQuery.trim().length > 0 || hasFilter;

  const isLoadingPlaces =
    placesQuery.isLoading || (hasActiveSearch && placesQuery.isFetching);

  const userCoordinates = isGrantedState(geoState)
    ? geoState.coordinates
    : null;

  const handleCategoryChipClick = (categoryId: string) => {
    setAppliedFilters((prev) => ({
      ...prev,
      activeCategoryId:
        prev.activeCategoryId === categoryId ? null : categoryId,
      activeSubcategoryId: null,
    }));
  };

  const initialFilterState: FilterSheetState = useMemo(
    () => ({ ...appliedFilters }),
    [appliedFilters],
  );

  return (
    <AuthLayout>
      <div className={SECTION_STACK}>
        {/* Cabeçalho fixo acima da busca (aparece apenas no estado padrão) */}
        <div className="-mx-page-x bg-background/90 px-page-x pt-page-y sticky top-0 z-20 backdrop-blur-xl">
          {!hasActiveSearch ? (
            <div className="pb-2">
              <p className="text-muted-foreground text-sm">{getGreeting()}</p>

              <h1 className="text-foreground mt-1 text-2xl font-extrabold">
                Pra onde vamos hoje?
              </h1>

              <p className="text-muted-foreground mt-1 text-sm">
                O Google Maps mostra como chegar. O Colalá mostra onde vale a
                pena ir.
              </p>
            </div>
          ) : null}

          {/* Barra de busca fixa no topo */}
          <div className="border-border/60 pb-stack-sm border-b pt-2">
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <SearchBar
                  aria-label="Buscar lugares"
                  autoComplete="off"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Buscar lugares..."
                  className="shadow-sm"
                />
              </div>
              <button
                type="button"
                onClick={() => setSheetOpen(true)}
                className={cn(
                  "relative flex size-11 shrink-0 items-center justify-center rounded-xl border shadow-sm transition-colors",
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
          </div>
        </div>

        {/* Chips de categoria (abaixo da busca) */}
        <div
          className="-mx-page-x px-page-x flex scrollbar-none gap-2 overflow-x-auto pb-0.5"
          style={{
            WebkitMaskImage:
              "linear-gradient(to right, black 0%, black calc(100% - 24px), transparent 100%)",
            maskImage:
              "linear-gradient(to right, black 0%, black calc(100% - 24px), transparent 100%)",
          }}
        >
          {mainCategories.map((category) => {
            const categoryId = String(category.id);
            const isActive = appliedFilters.activeCategoryId === categoryId;

            return (
              <CategoryChip
                key={categoryId}
                active={isActive}
                onClick={() => handleCategoryChipClick(categoryId)}
              >
                {category.icon ? <span>{category.icon}</span> : null}
                {category.name}
              </CategoryChip>
            );
          })}
        </div>

        {/* Resumo dos filtros ativos (só quando há filtro) */}
        {hasFilter ? (
          <div className="-mx-page-x px-page-x flex scrollbar-none gap-2 overflow-x-auto pb-0.5">
            {appliedFilters.activeCategoryId !== null ? (
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
            ) : null}
            {appliedFilters.activeSubcategoryId !== null ? (
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
            ) : null}
            {appliedFilters.workFriendly ? (
              <ActiveFilterChip
                label="💻 Work friendly"
                onRemove={() =>
                  setAppliedFilters((prev) => ({
                    ...prev,
                    workFriendly: false,
                  }))
                }
              />
            ) : null}
            {appliedFilters.petFriendly ? (
              <ActiveFilterChip
                label="🐾 Pet friendly"
                onRemove={() =>
                  setAppliedFilters((prev) => ({
                    ...prev,
                    petFriendly: false,
                  }))
                }
              />
            ) : null}
            {appliedFilters.wifi ? (
              <ActiveFilterChip
                label="📶 Wi-Fi"
                onRemove={() =>
                  setAppliedFilters((prev) => ({
                    ...prev,
                    wifi: false,
                  }))
                }
              />
            ) : null}
            {appliedFilters.acceptsBookClub ? (
              <ActiveFilterChip
                label="📚 Clube do livro"
                onRemove={() =>
                  setAppliedFilters((prev) => ({
                    ...prev,
                    acceptsBookClub: false,
                  }))
                }
              />
            ) : null}
            <button
              type="button"
              onClick={() => setAppliedFilters(EMPTY_FILTERS)}
              className="text-primary shrink-0 text-xs font-semibold"
            >
              Limpar tudo
            </button>
          </div>
        ) : null}

        {/* Conteúdo alterna entre descoberta e resultados de busca */}
        <div
          key={hasActiveSearch ? "search" : "discover"}
          className="animate-fade-up"
        >
          {hasActiveSearch ? (
            <SearchResults
              places={places}
              isLoading={isLoadingPlaces}
              userCoordinates={userCoordinates}
              query={debouncedQuery}
            />
          ) : (
            <DiscoverySections
              places={places}
              categories={categories}
              geoState={geoState}
              isLoading={placesQuery.isLoading}
            />
          )}
        </div>
      </div>

      {/* Filter bottom sheet */}
      <FilterSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onApply={setAppliedFilters}
        initial={initialFilterState}
        categories={categories}
      />
    </AuthLayout>
  );
}

function getCategoryName(categories: Category[], id: string): string {
  return categories.find((category) => String(category.id) === id)?.name ?? id;
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
