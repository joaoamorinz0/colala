import { createSupabaseBrowserClient } from "@/lib/supabase";
import type { Category } from "@/types/category";

const CATEGORIES_TABLE = "categories";

const CATEGORY_SELECT = `
  id,
  name,
  description,
  icon,
  color,
  slug,
  sort_order,
  parent_id,
  created_at,
  updated_at
`;

export type CategoryInput = {
  name: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  slug?: string | null;
  sort_order?: number | null;
  parent_id?: string | null;
};

export const categoriesService = {
  /** Retorna todas as categorias, principais e subcategorias, ordenadas. */
  async getAll(): Promise<Category[]> {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return [];
    const { data, error } = await supabase
      .from(CATEGORIES_TABLE)
      .select(CATEGORY_SELECT)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });

    if (error) throw error;
    return (data ?? []) as Category[];
  },

  /** Apenas categorias principais (parent_id = null). */
  async getMainCategories(): Promise<Category[]> {
    const all = await this.getAll();
    return all.filter((category) => category.parent_id === null);
  },

  /** Subcategorias cujo pai é `parentId`. */
  async getSubcategories(parentId: string): Promise<Category[]> {
    const all = await this.getAll();
    return all.filter((category) => category.parent_id === parentId);
  },

  async getById(id: string): Promise<Category | null> {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return null;
    const { data, error } = await supabase
      .from(CATEGORIES_TABLE)
      .select(CATEGORY_SELECT)
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    return (data as Category | null) ?? null;
  },

  async create(input: CategoryInput): Promise<Category | null> {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) throw new Error("Supabase client not initialized");

    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from(CATEGORIES_TABLE)
      .insert([
        {
          name: input.name,
          description: input.description ?? null,
          icon: input.icon ?? null,
          color: input.color ?? null,
          slug: input.slug ?? null,
          sort_order: input.sort_order ?? null,
          parent_id: input.parent_id ?? null,
          created_at: now,
          updated_at: now,
        },
      ])
      .select(CATEGORY_SELECT)
      .single();

    if (error) throw error;
    return (data as Category | null) ?? null;
  },

  async update(
    id: string | number,
    input: Partial<CategoryInput>,
  ): Promise<Category | null> {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) throw new Error("Supabase client not initialized");

    const { data, error } = await supabase
      .from(CATEGORIES_TABLE)
      .update({
        ...input,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select(CATEGORY_SELECT)
      .single();

    if (error) throw error;
    return (data as Category | null) ?? null;
  },

  /**
   * Remove uma categoria. Bloqueia a exclusão quando a categoria ainda
   * possui subcategorias, para não quebrar a hierarquia.
   */
  async delete(id: string | number): Promise<void> {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) throw new Error("Supabase client not initialized");

    const { data: children } = await supabase
      .from(CATEGORIES_TABLE)
      .select("id")
      .eq("parent_id", id);

    if (children && children.length > 0) {
      throw new Error(
        "Esta categoria possui subcategorias. Exclua ou mova as subcategorias antes de excluí-la.",
      );
    }

    const { error } = await supabase
      .from(CATEGORIES_TABLE)
      .delete()
      .eq("id", id);

    if (error) throw error;
  },
};
