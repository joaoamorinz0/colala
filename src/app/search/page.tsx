import { AuthLayout } from "@/components/layout";
import { PlaceCard } from "@/components/place";
import { CategoryCard, SearchBar } from "@/components/search";
import { LIST_STACK, SECTION_GAP, SECTION_STACK } from "@/constants/design";
import { EXPERIENCE_CATEGORIES } from "@/features/places";
import { fetchPlaces } from "@/services/places";
import { cn } from "@/lib/utils";

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
      <div className={SECTION_STACK}>
        <section className={SECTION_GAP}>
          <form action="/search" method="GET">
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

        <section className={SECTION_GAP}>
          <h1 className="text-foreground text-xl font-extrabold tracking-tight">
            Resultados
          </h1>
          {places.length > 0 ? (
            <div className={LIST_STACK}>
              {places.map((place) => (
                <PlaceCard key={place.id} place={place} />
              ))}
            </div>
          ) : (
            <div className="border-border bg-card text-muted-foreground rounded-card-lg p-card border text-sm">
              Nenhum local encontrado para essa busca.
            </div>
          )}
        </section>

        <section className={SECTION_GAP}>
          <h2 className="text-foreground text-xl font-extrabold tracking-tight">
            Explorar por categoria
          </h2>
          <div className={cn("gap-stack-md grid grid-cols-2")}>
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
