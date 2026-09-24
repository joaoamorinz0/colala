export type Collaborator = {
  id: string;
  nome: string;
  name?: string | null;
  slug: string | null;
  instagram: string | null;
  instagram_url: string | null;
  website_url: string | null;
  avatar_url: string | null;
  logo_url: string | null;
  short_description: string | null;
  cor_primaria: string;
  cor_secundaria: string | null;
  fonte: string | null;
  font_family: string | null;
  is_active: boolean | null;
  created_at?: string;
  updated_at?: string | null;
};
