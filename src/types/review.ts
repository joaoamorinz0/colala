export type ReviewTag = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  sort_order: number | null;
};

export type ReviewPhoto = {
  id: string;
  review_id: string;
  url: string;
  sort_order: number | null;
  created_at: string;
};

export type ReviewTagFrequency = {
  tag: ReviewTag;
  count: number;
  percentage: number;
};

export type PlacePopularTag = {
  place_id: string;
  place_tag_id: string | null;
  place_tag_name: string;
  place_tag_slug: string | null;
  place_tag_icon: string | null;
  popularity: number | null;
  review_count: number | null;
};

export type Review = {
  id: string;
  place_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
  place?: {
    id: string;
    name: string;
  } | null;
  review_tags?: ReviewTag[] | null;
  review_photos?: ReviewPhoto[] | null;
};

/**
 * Perfil resumido do autor da avaliação, exibido na página do local.
 */
export type ReviewAuthor = {
  id: string;
  name: string | null;
  username: string | null;
  avatar_url: string | null;
};

/**
 * Avaliação completa exibida na página do local, com autor, tags e fotos.
 */
export type PlaceReview = {
  id: string;
  place_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
  author: ReviewAuthor | null;
  review_tags: ReviewTag[];
  review_photos: ReviewPhoto[];
};

export type PlaceReviewCardData = PlaceReview & {
  place?: PublicReview["place"];
  author: {
    id: string;
    name: string | null;
    username: string | null;
    avatar_url: string | null;
  } | null;
};

/**
 * Avaliação pública renderizada no perfil público de um usuário.
 * Inclui o place com dados suficientes para reutilizar os cards existentes
 * (HorizontalCard) sem depender de perfil/nome de quem avaliou.
 */
export type PublicReview = {
  id: string;
  place_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
  place: {
    id: string;
    name: string;
    description: string | null;
    city: string | null;
    neighborhood: string | null;
    price_level: number | null;
    instagram: string | null;
    cover_image: string | null;
    rating: number | null;
    category: {
      id: string;
      name: string;
      icon: string | null;
    } | null;
  };
  review_tags: ReviewTag[];
  review_photos: ReviewPhoto[];
};
