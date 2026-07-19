import { createClient } from '@/lib/supabase/client';
import { Category } from '@/types/admin';

const CATEGORIES_TABLE = 'categories';

export const categoriesService = {
  async getAll(): Promise<Category[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from(CATEGORIES_TABLE)
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Category> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from(CATEGORIES_TABLE)
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(name: string, description?: string): Promise<Category> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from(CATEGORIES_TABLE)
      .insert([
        {
          name,
          description,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, name: string, description?: string): Promise<Category> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from(CATEGORIES_TABLE)
      .update({
        name,
        description,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase
      .from(CATEGORIES_TABLE)
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};
