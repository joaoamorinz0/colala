import { AuthLayout } from "@/components/layout";
import { PlaceCard } from "@/components/place";
import { CategoryChip } from "@/components/search/category-chip";
import { LargeSearchBox } from "@/components/search/large-search-box";
import { EXPERIENCE_CATEGORIES } from "@/features/places";
import { fetchPlaces } from "@/services/places";

export default async function HomePage() {
  const [featuredPlace, ...morePlaces] = await fetchPlaces({ limit: 4 });
  const chips = EXPERIENCE_CATEGORIES.slice(0, 4);

  return (
    <AuthLayout>
      <div className="space-y-6 sm:space-y-8 overflow-hidden">
        <header className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <p className="text-muted-foreground text-lg sm:text-xl">Boa tarde</p>
            <p className="text-foreground mt-1 sm:mt-2 text-2xl sm:text-3xl font-bold line-clamp-1">João 👋</p>
          </div>
          <button
            className="border-primary bg-primary/8 text-primary flex size-14 sm:size-16 shrink-0 items-center justify-center rounded-full border-4 text-xl sm:text-2xl font-bold"
            type="button"
            aria-label="Profile"
          >
            J
          </button>
        </header>

        <h1 className="text-foreground max-w-sm text-4xl sm:text-5xl leading-[1.08] font-extrabold tracking-tight">
          Onde você quer ir hoje?
        </h1>

        <LargeSearchBox placeholder="Buscar lugares..." showFilter />

        <div className="-mx-[var(--spacing-page-x)] flex gap-3 overflow-x-auto px-[var(--spacing-page-x)] pb-1">
          {chips.map((category, index) => {
            const Icon = category.icon;

            return (
              <CategoryChip
                active={index === 0}
                className="h-12 sm:h-14 shrink-0 rounded-full px-5 sm:px-6 text-base sm:text-lg"
                icon={<Icon className="size-4 sm:size-5" />}
                key={category.id}
              >
                {category.label}
              </CategoryChip>
            );
          })}
        </div>

        <section className="space-y-4 sm:space-y-5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-foreground text-2xl sm:text-3xl font-extrabold">
              🔥 Em alta hoje
            </h2>
            <button
              className="text-primary text-sm sm:text-lg font-semibold shrink-0"
              type="button"
            >
              Ver tudo
            </button>
          </div>
          {featuredPlace ? (
            <PlaceCard place={featuredPlace} />
          ) : (
            <div className="border-border bg-card text-muted-foreground rounded-[1.75rem] border p-6 text-lg">
              Nenhum local encontrado. Verifique a conexão com o Supabase.
            </div>
          )}
        </section>

        <section className="space-y-4 sm:space-y-5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-foreground text-2xl sm:text-3xl font-extrabold">
              Mais lugares
            </h2>
            <button
              className="text-primary text-sm sm:text-lg font-semibold shrink-0"
              type="button"
            >
              Ver tudo
            </button>
          </div>
          <div className="space-y-4">
            {morePlaces.map((place) => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </div>
        </section>
      </div>
    </AuthLayout>
  );
}
