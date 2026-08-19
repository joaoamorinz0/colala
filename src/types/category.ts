export type Category = {
  id: string | number;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  /** Categoria pai (null = categoria principal). */
  parent_id: string | null;
  slug: string | null;
  sort_order: number | null;
  created_at?: string;
  updated_at?: string | null;
};
