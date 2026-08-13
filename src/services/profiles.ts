import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ProfileInterest } from "@/types/profile-interest";
import type { Profile } from "@/types/profile";
import type { PublicReview } from "@/types/review";
import {
  normalizeProfileInterestsRows,
  type RawProfileInterestRow,
} from "@/services/profile-interests.service";

const PROFILE_INTEREST_SELECT_COLUMNS = `
  user_id,
  category_id,
  category:categories(id, name, icon, color)
`;

const PROFILE_SELECT_COLUMNS = `
  id,
  name,
  username,
  avatar_url,
  cover_image,
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

export async function fetchProfileInterestsByUser(
  userId: string,
): Promise<ProfileInterest[]> {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    console.error("❌ Supabase client não foi criado.");
    return [];
  }

  const { data, error } = await supabase
    .from("profile_interests")
    .select(PROFILE_INTEREST_SELECT_COLUMNS)
    .eq("user_id", userId)
    .order("category_id", { ascending: true });

  if (error) {
    console.error("🔴 Failed to load user interests:", error);
    return [];
  }

  return normalizeProfileInterestsRows(
    (data ?? []) as unknown as RawProfileInterestRow[],
  );
}

export { reviewPlaceToPlace } from "@/services/reviews.service";
