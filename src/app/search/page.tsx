import { SearchClient } from "@/components/search/search-client";

type SearchPageProps = {
  searchParams: Promise<{
    q?: string;
    category?: string;
  }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q, category } = await searchParams;

  return (
    <SearchClient initialQuery={q ?? ""} initialCategoryId={category ?? null} />
  );
}
