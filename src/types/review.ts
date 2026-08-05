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
