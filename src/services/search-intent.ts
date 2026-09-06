import type { createSupabaseBrowserClient } from "@/lib/supabase";

export type NaturalSearchIntent = {
  category_slugs?: string[];
  subcategory_slugs?: string[];
  tag_slugs?: string[];
  keywords?: string[];
};

type SupabaseBrowserClient = NonNullable<
  ReturnType<typeof createSupabaseBrowserClient>
>;

function normalizeSlugs(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 12);
}

function normalizeIntent(payload: unknown): NaturalSearchIntent | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const record = payload as Record<string, unknown>;
  const categorySlugs = normalizeSlugs(record.category_slugs);
  const subcategorySlugs = normalizeSlugs(record.subcategory_slugs);
  const tagSlugs = normalizeSlugs(record.tag_slugs);
  const keywords = normalizeSlugs(record.keywords);

  const normalized: NaturalSearchIntent = {
    category_slugs: categorySlugs,
    subcategory_slugs: subcategorySlugs,
    tag_slugs: tagSlugs,
    keywords,
  };

  const hasAny =
    categorySlugs.length > 0 ||
    subcategorySlugs.length > 0 ||
    tagSlugs.length > 0 ||
    keywords.length > 0;

  return hasAny ? normalized : null;
}

export async function parseSearchIntent(
  client: SupabaseBrowserClient,
  query: string,
): Promise<NaturalSearchIntent | null> {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) {
    return null;
  }

  const invokePromise = (async () => {
    try {
      const { data, error } = await client.functions.invoke(
        "parse-search-query",
        {
          body: { query: trimmed },
        },
      );

      if (error) {
        throw error;
      }

      const normalized = normalizeIntent(data);
      return normalized;
    } catch (error) {
      console.warn("[search-intent] edge function failed:", error);
      return null;
    }
  })();

  const timeoutPromise = new Promise<null>((resolve) => {
    setTimeout(() => resolve(null), 3500);
  });

  return Promise.race([invokePromise, timeoutPromise]);
}
