import type { createSupabaseBrowserClient } from "@/lib/supabase";
import type { ProfileInterest } from "@/types/profile-interest";

type SupabaseBrowserClient = NonNullable<
  ReturnType<typeof createSupabaseBrowserClient>
>;

const PROFILE_INTEREST_SELECT_COLUMNS = `
  user_id,
  category_id,
  category:categories(id, name, icon, color)
`;

export type RawProfileInterestCategory = {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
};

export type RawProfileInterestRow = {
  user_id: string;
  category_id: string;
  category: RawProfileInterestCategory[] | RawProfileInterestCategory | null;
};

function normalizeCategory(
  category: RawProfileInterestCategory[] | RawProfileInterestCategory | null,
): RawProfileInterestCategory | null {
  if (Array.isArray(category)) {
    return category[0] ?? null;
  }
  return category;
}

/**
 * Normaliza as linhas cruas do PostgREST (join pode vir como array)
 * para o formato ProfileInterest consumido pela UI.
 */
export function normalizeProfileInterestsRows(
  rows: RawProfileInterestRow[],
): ProfileInterest[] {
  return rows
    .map((row) => ({
      user_id: row.user_id,
      category_id: row.category_id,
      category: normalizeCategory(row.category),
    }))
    .filter(
      (interest): interest is ProfileInterest => interest.category !== null,
    );
}

/**
 * Lista as categorias que o usuário marcou como interesse,
 * com os dados da categoria via join (leitura pública via RLS).
 */
export async function fetchProfileInterests(
  client: SupabaseBrowserClient,
  userId: string,
): Promise<ProfileInterest[]> {
  const { data, error } = await client
    .from("profile_interests")
    .select(PROFILE_INTEREST_SELECT_COLUMNS)
    .eq("user_id", userId)
    .order("category_id", { ascending: true });

  if (error) {
    console.error(
      "[profile-interests] Erro ao carregar interesses:",
      error.message,
    );
    throw error;
  }

  return normalizeProfileInterestsRows(
    (data ?? []) as unknown as RawProfileInterestRow[],
  );
}

export async function addProfileInterest(
  client: SupabaseBrowserClient,
  userId: string,
  categoryId: string,
): Promise<void> {
  const { error } = await client
    .from("profile_interests")
    .insert([{ user_id: userId, category_id: categoryId }]);

  if (error) {
    console.error(
      "[profile-interests] Erro ao adicionar interesse:",
      error.message,
    );
    throw error;
  }
}

export async function removeProfileInterest(
  client: SupabaseBrowserClient,
  userId: string,
  categoryId: string,
): Promise<void> {
  const { error } = await client
    .from("profile_interests")
    .delete()
    .eq("user_id", userId)
    .eq("category_id", categoryId);

  if (error) {
    console.error(
      "[profile-interests] Erro ao remover interesse:",
      error.message,
    );
    throw error;
  }
}
