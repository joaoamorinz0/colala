import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Place } from "@/types/place";
import type { Profile } from "@/types/profile";
import type { PublicReview } from "@/types/review";

const PROFILE_SELECT_COLUMNS = `
  id,
  name,
  username,
  avatar_url,
  bio,
  city,
  instagram,
  show_city,
  show_instagram,
  created_at,
  updated_at
`;

const REVIEW_SELECT_COLUMNS = `
  id,
  place_id,
  user_id,
  rating,
  comment,
  created_at,
  updated_at,
  place:places(
    id,
    name,
    description,
    city,
    neighborhood,
    price_level,
    instagram,
    cover_image,
    rating,
    category:categories(id, name, icon)
  )
`;

export async function fetchProfileByUsername(
  username: string,
): Promise<Profile | null> {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    console.error("❌ Supabase client não foi criado.");
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_SELECT_COLUMNS)
    .eq("username", username)
    .maybeSingle();

  if (error) {
    console.error("🔴 Failed to load profile by username:", error);
    return null;
  }

  return data as Profile | null;
}

export async function fetchReviewsByUser(
  userId: string,
): Promise<PublicReview[]> {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    console.error("❌ Supabase client não foi criado.");
    return [];
  }

  const { data, error } = await supabase
    .from("reviews")
    .select(REVIEW_SELECT_COLUMNS)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("🔴 Failed to load user reviews:", error);
    return [];
  }

  return (data ?? []) as unknown as PublicReview[];
}

/**
 * Adapta o `place` aninhado de uma PublicReview para o formato Place
 * consumido pelo HorizontalCard existente no projeto.
 */
export function reviewPlaceToPlace(review: PublicReview): Place {
  const place = review.place;

  return {
    id: place.id,
    name: place.name,
    description: place.description,
    city: place.city,
    neighborhood: place.neighborhood,
    address: null,
    price_level: place.price_level,
    instagram: place.instagram,
    phone: null,
    website: null,
    cover_image: place.cover_image,
    gallery: [],
    created_at: "",
    category_id: place.category?.id ?? null,
    rating: place.rating,
    latitude: null,
    longitude: null,
    opening_hours: null,
    featured: false,
    work_friendly: false,
    pet_friendly: false,
    wifi: false,
    sunset: false,
    status: "published",
    category: place.category
      ? {
          id: place.category.id,
          name: place.category.name,
          icon: place.category.icon,
        }
      : null,
  };
}
