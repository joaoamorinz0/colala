import { createSupabaseBrowserClient } from "@/lib/supabase";
import type { PlaceMapItem } from "@/types/place";

export type MapBounds = {
  north: number;
  south: number;
  east: number;
  west: number;
};

export type FetchPlacesInBboxOptions = {
  categoryId?: string | null;
  priceLevel?: number | null;
  search?: string | null;
  limit?: number;
  offset?: number;
};

export async function fetchPlacesInBbox(
  bounds: MapBounds,
  options: FetchPlacesInBboxOptions = {},
): Promise<PlaceMapItem[]> {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) {
    throw new Error("Cliente Supabase não inicializado.");
  }

  const { data, error } = await supabase.rpc("get_places_in_bbox", {
    min_lat: bounds.south,
    min_lng: bounds.west,
    max_lat: bounds.north,
    max_lng: bounds.east,
    p_category_id: options.categoryId?.trim() || null,
    p_price_level: options.priceLevel ?? null,
    p_search: options.search?.trim() || null,
    p_limit: options.limit ?? 200,
    p_offset: options.offset ?? 0,
  });

  if (error) {
    console.error("🔴 Falha ao buscar locais na área visível do mapa:", error);
    throw new Error(
      `Erro ao buscar locais na área visível do mapa: ${error.message}`,
    );
  }

  return (data ?? []) as PlaceMapItem[];
}
