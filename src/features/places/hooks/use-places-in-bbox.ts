"use client";

import { useQuery } from "@tanstack/react-query";
import { useDebouncedValue } from "@/hooks";
import { fetchPlacesInBbox, type MapBounds } from "@/services/map";
import type { PlaceMapItem } from "@/types/place";

export const PLACES_IN_BBOX_QUERY_KEY = ["places", "bbox"] as const;

const BBOX_DEBOUNCE_MS = 400;
// 3 casas decimais ≈ 110m — micro-movimentos do mapa não refazem a query.
const BOUNDS_PRECISION = 3;

type UsePlacesInBboxOptions = {
  bounds: MapBounds | null;
  categoryId?: string | null;
  priceLevel?: number | null;
  search?: string | null;
};

function roundBounds(value: number): number {
  const factor = 10 ** BOUNDS_PRECISION;
  return Math.round(value * factor) / factor;
}

function normalizeOptional(value: string | null | undefined): string | null {
  return value?.trim() || null;
}

export function usePlacesInBbox({
  bounds,
  categoryId,
  priceLevel,
  search,
}: UsePlacesInBboxOptions) {
  const debouncedBounds = useDebouncedValue(bounds, BBOX_DEBOUNCE_MS);

  const queryKey = [
    ...PLACES_IN_BBOX_QUERY_KEY,
    debouncedBounds
      ? {
          north: roundBounds(debouncedBounds.north),
          south: roundBounds(debouncedBounds.south),
          east: roundBounds(debouncedBounds.east),
          west: roundBounds(debouncedBounds.west),
        }
      : null,
    normalizeOptional(categoryId),
    priceLevel ?? null,
    normalizeOptional(search),
  ] as const;

  return useQuery<PlaceMapItem[]>({
    queryKey,
    queryFn: () => {
      if (!debouncedBounds) {
        return [];
      }

      return fetchPlacesInBbox(debouncedBounds, {
        categoryId: normalizeOptional(categoryId),
        priceLevel: priceLevel ?? null,
        search: normalizeOptional(search),
      });
    },
    enabled: Boolean(debouncedBounds),
    staleTime: 30_000,
  });
}
