import type { createSupabaseBrowserClient } from "@/lib/supabase";
import type { Place } from "@/types/place";
import type { Category } from "@/types/category";
import type { Review } from "@/types/review";

type SupabaseBrowserClient = NonNullable<
  ReturnType<typeof createSupabaseBrowserClient>
>;

// PLACES MANAGEMENT
export async function createPlace(
  client: SupabaseBrowserClient,
  place: Omit<Place, "id" | "created_at">,
): Promise<Place> {
  const { data, error } = await client
    .from("places")
    .insert([place])
    .select()
    .single();

  if (error) {
    throw new Error(`Erro ao criar local: ${error.message}`);
  }

  return data;
}

export async function updatePlace(
  client: SupabaseBrowserClient,
  id: string,
  place: Partial<Omit<Place, "id" | "created_at">>,
): Promise<Place> {
  const { data, error } = await client
    .from("places")
    .update(place)
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) {
    throw new Error(`Erro ao atualizar local: ${error.message}`);
  }

  if (!data) {
    throw new Error(
      "Local atualizado, mas não retornado — possível bloqueio de RLS na leitura.",
    );
  }

  return data;
}

export async function deletePlace(
  client: SupabaseBrowserClient,
  id: string,
): Promise<void> {
  const { error } = await client.from("places").delete().eq("id", id);

  if (error) {
    throw new Error(`Erro ao deletar local: ${error.message}`);
  }
}

export async function getPlaceById(
  client: SupabaseBrowserClient,
  id: string,
): Promise<Place> {
  const { data, error } = await client
    .from("places")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(`Erro ao buscar local: ${error.message}`);
  }

  return data;
}

export async function getAllPlaces(
  client: SupabaseBrowserClient,
): Promise<Place[]> {
  const { data, error } = await client
    .from("places")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Erro ao buscar locais: ${error.message}`);
  }

  return data || [];
}

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

// CATEGORIES MANAGEMENT
export async function createCategory(
  client: SupabaseBrowserClient,
  category: Omit<Category, "id" | "created_at">,
): Promise<Category> {
  const { data, error } = await client
    .from("categories")
    .insert([category])
    .select(CATEGORY_SELECT)
    .single();

  if (error) {
    throw new Error(`Erro ao criar categoria: ${error.message}`);
  }

  return data;
}

export async function updateCategory(
  client: SupabaseBrowserClient,
  id: string | number,
  category: Partial<Omit<Category, "id" | "created_at">>,
): Promise<Category> {
  const { data, error } = await client
    .from("categories")
    .update(category)
    .eq("id", id)
    .select(CATEGORY_SELECT)
    .single();

  if (error) {
    throw new Error(`Erro ao atualizar categoria: ${error.message}`);
  }

  return data;
}

/**
 * Exclui uma categoria. Bloqueia a operação se a categoria ainda possuir
 * subcategorias, para preservar a hierarquia pai/filho.
 */
export async function deleteCategory(
  client: SupabaseBrowserClient,
  id: string | number,
): Promise<void> {
  const { data: children } = await client
    .from("categories")
    .select("id")
    .eq("parent_id", id);

  if (children && children.length > 0) {
    throw new Error(
      "Esta categoria possui subcategorias. Exclua ou mova as subcategorias antes de excluí-la.",
    );
  }

  const { error } = await client.from("categories").delete().eq("id", id);

  if (error) {
    throw new Error(`Erro ao deletar categoria: ${error.message}`);
  }
}

export async function getCategoryById(
  client: SupabaseBrowserClient,
  id: string | number,
): Promise<Category> {
  const { data, error } = await client
    .from("categories")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(`Erro ao buscar categoria: ${error.message}`);
  }

  return data;
}

export async function getAllCategories(
  client: SupabaseBrowserClient,
): Promise<Category[]> {
  const { data, error } = await client
    .from("categories")
    .select(CATEGORY_SELECT)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`Erro ao buscar categorias: ${error.message}`);
  }

  return (data ?? []) as Category[];
}

// IMAGE UPLOAD
export async function uploadImage(
  client: SupabaseBrowserClient,
  file: File,
  bucket: string = "places",
): Promise<string> {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const fileName = `${bucket}/${Date.now()}-${safeName}`;
  const { error, data } = await client.storage
    .from(bucket)
    .upload(fileName, file, {
      upsert: true,
      contentType: file.type,
    });

  if (error) {
    throw new Error(`Erro ao fazer upload da imagem: ${error.message}`);
  }

  const { data: publicUrl } = client.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return publicUrl.publicUrl;
}

export async function deleteImage(
  client: SupabaseBrowserClient,
  filePath: string,
  bucket: string = "places",
): Promise<void> {
  const { error } = await client.storage.from(bucket).remove([filePath]);

  if (error) {
    throw new Error(`Erro ao deletar imagem: ${error.message}`);
  }
}

// REVIEWS MANAGEMENT
const REVIEWS_TABLE = "reviews";

export async function getAllReviews(
  client: SupabaseBrowserClient,
): Promise<Review[]> {
  const { data, error } = await client
    .from(REVIEWS_TABLE)
    .select("id,place_id,user_id,rating,comment,created_at,updated_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Erro ao buscar avaliações: ${error.message}`);
  }

  return (data ?? []) as Review[];
}

export async function createReview(
  client: SupabaseBrowserClient,
  review: Omit<Review, "id" | "created_at" | "updated_at" | "place">,
): Promise<Review> {
  const { data, error } = await client
    .from(REVIEWS_TABLE)
    .insert([review])
    .select("id,place_id,user_id,rating,comment,created_at,updated_at")
    .single();

  if (error) {
    throw new Error(`Erro ao criar avaliação: ${error.message}`);
  }

  return data as Review;
}

export async function updateReview(
  client: SupabaseBrowserClient,
  id: string,
  review: Partial<Omit<Review, "id" | "created_at" | "updated_at" | "place">>,
): Promise<Review> {
  const { data, error } = await client
    .from(REVIEWS_TABLE)
    .update(review)
    .eq("id", id)
    .select("id,place_id,user_id,rating,comment,created_at,updated_at")
    .single();

  if (error) {
    throw new Error(`Erro ao atualizar avaliação: ${error.message}`);
  }

  return data as Review;
}

export async function deleteReview(
  client: SupabaseBrowserClient,
  id: string,
): Promise<void> {
  const { error } = await client.from(REVIEWS_TABLE).delete().eq("id", id);

  if (error) {
    throw new Error(`Erro ao deletar avaliação: ${error.message}`);
  }
}
