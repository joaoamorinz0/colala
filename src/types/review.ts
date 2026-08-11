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
};
