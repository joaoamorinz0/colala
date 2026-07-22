import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Place } from "@/types/place";

const PLACE_SELECT_COLUMNS = `
  id, 
  name, 
  description, 
  city, 
  neighborhood, 
  address, 
  price_level, 
  instagram, 
  phone, 
  website, 
  cover_image, 
  gallery, 
  created_at, 
  category_id, 
  rating, 
  latitude, 
  longitude, 
  opening_hours, 
  featured, 
  work_friendly, 
  pet_friendly, 
  wifi, 
  sunset,
  category:categories(id, name, icon)
`;

type FetchPlacesOptions = {
  query?: string;
  limit?: number;
  categoryId?: string;
};

export async function fetchPlaces({
  query,
  limit,
  categoryId,
}: FetchPlacesOptions = {}): Promise<Place[]> {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    console.error("❌ Supabase client não foi criado.");
    return [];
  }

  let request = supabase
    .from("places")
    .select(PLACE_SELECT_COLUMNS)
    .order("created_at", { ascending: false });

  if (query?.trim()) {
    const searchTerm = query.trim();
    request = request.or(
      `name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%`,
    );
  }

  if (categoryId) {
    request = request.eq("category_id", categoryId);
  }

  if (limit) {
    request = request.limit(limit);
  }

  const { data, error } = await request;

  if (error) {
    console.error("🔴 Failed to load places:", error);
    return [];
  }

  return (data ?? []) as unknown as Place[];
}

export async function fetchPlaceById(id: string): Promise<Place | null> {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    console.error("❌ Supabase client não foi criado.");
    return null;
  }

  const { data, error } = await supabase
    .from("places")
    .select(PLACE_SELECT_COLUMNS)
    .eq("id", id)
    .single();

  if (error) {
    console.error("🔴 Failed to load place by id:", error);
    return null;
  }

  return data as unknown as Place;
}
