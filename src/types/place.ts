export type PlaceStatus = "published" | "pending" | "rejected";

export type Place = {
  id: string;
  name: string;
  description: string | null;
  city: string | null;
  neighborhood: string | null;
  address: string | null;
  price_level: number | null;
  instagram: string | null;
  phone: string | null;
  website: string | null;
  cover_image: string | null;
  gallery: string[] | null;
  created_at: string;
  category_id: string | null;
  category?: {
    id: string;
    name: string;
    icon: string | null;
  } | null;
  rating: number | null;
  latitude: number | null;
  longitude: number | null;
  opening_hours: string | null;
  featured: boolean | null;
  work_friendly: boolean | null;
  pet_friendly: boolean | null;
  wifi: boolean | null;
  sunset: boolean | null;
  accepts_book_club: boolean | null;
  status: PlaceStatus | null;
};

/**
 * Retorno da função RPC `get_places_in_bbox` do Supabase.
 * Representa um local com dados prontos para renderização no mapa.
 */
export type PlaceMapItem = {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  city: string | null;
  neighborhood: string | null;
  address: string | null;
  latitude: number;
  longitude: number;
  price_level: number | null;
  category_id: string | null;
  category_name: string | null;
  category_icon: string | null;
  cover_image: string | null;
  rating: number | null;
  featured: boolean | null;
  total_count: number;
};
