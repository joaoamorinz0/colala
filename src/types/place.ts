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
  status: PlaceStatus | null;
};
