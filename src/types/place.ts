export type Place = {
  id: string;
  name: string;
  description: string | null;
  city: string | null;
  price_level: string | number | null;
  instagram: string | null;
  cover_image: string | null;
  created_at: string;
  category_id: string | number | null;
};
