import { AuthLayout } from "@/components/layout";
import { PlaceCard } from "@/components/place";
import { CategoryCard, SearchBar } from "@/components/search";
import { EXPERIENCE_CATEGORIES } from "@/features/places";
import { fetchPlaces } from "@/services/places";

type SearchPageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const categories = EXPERIENCE_CATEGORIES.filter(
    (category) => category.id !== "all",
  );
  const places = await fetchPlaces({
    query: q,
    limit: 12,
  });

  return (
    <AuthLayout>
      <div className="space-y-14">
        <section className="space-y-4">
          <form action="/search" method="GET" className="space-y-4">
            <SearchBar
              aria-label="Pesquisar locais"
              autoComplete="off"
              defaultValue={q}
              name="q"
              placeholder="Buscar por nome, cidade ou descrição"
            />
          </form>
          <p className="text-muted-foreground text-sm">
            {q
              ? `Mostrando resultados para "${q}"`
              : "Busque por nome, cidade ou descrição para encontrar locais."}
          </p>
        </section>

        <section>
          <h1 className="text-foreground mb-8 text-3xl font-extrabold">
            Resultados
          </h1>
          {places.length > 0 ? (
            <div className="space-y-4">
              {places.map((place) => (
                <PlaceCard key={place.id} place={place} />
              ))}
            </div>
          ) : (
            <div className="border-border bg-card text-muted-foreground rounded-[1.75rem] border p-6 text-lg">
              Nenhum local encontrado para essa busca.
            </div>
          )}
        </section>

        <section>
          <h2 className="text-foreground mb-8 text-3xl font-extrabold">
            Explorar por categoria
          </h2>
          <div className="grid grid-cols-2 gap-5">
            {categories.map((category) => (
              <CategoryCard
                icon={category.icon}
                key={category.id}
                label={category.label}
              />
            ))}
          </div>
        </section>
      </div>
    </AuthLayout>
  );
}
