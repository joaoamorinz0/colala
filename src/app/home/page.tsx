import { AuthLayout } from "@/components/layout";
import { PlaceCard, HeroCard } from "@/components/place";
import { CategoryChip } from "@/components/search/category-chip";
import { LargeSearchBox } from "@/components/search/large-search-box";
import { EXPERIENCE_CATEGORIES } from "@/features/places";
import { fetchPlaces } from "@/services/places";

export default async function HomePage() {
  const [featuredPlace, ...morePlaces] = await fetchPlaces({ limit: 4 });
  const chips = EXPERIENCE_CATEGORIES.slice(0, 4);

  return (
    <AuthLayout>
      <div className="space-y-5 sm:space-y-6 overflow-hidden">
        <header className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-muted-foreground text-sm sm:text-base">Boa tarde</p>
            <p className="text-foreground mt-0.5 text-xl sm:text-2xl font-bold line-clamp-1">João 👋</p>
          </div>
          <button
            className="border-primary bg-primary/8 text-primary flex size-12 sm:size-14 shrink-0 items-center justify-center rounded-full border-3 text-lg sm:text-xl font-bold hover:bg-primary/12 transition-colors"
            type="button"
            aria-label="Profile"
          >
            J
          </button>
        </header>

        <h1 className="text-foreground text-2xl sm:text-3xl font-extrabold leading-tight tracking-tight">
          Onde você quer ir?
        </h1>

        <LargeSearchBox placeholder="Buscar lugares..." showFilter />

        <div className="-mx-[var(--spacing-page-x)] flex gap-2 overflow-x-auto px-[var(--spacing-page-x)] pb-1">
          {chips.map((category, index) => {
            const Icon = category.icon;

            return (
              <CategoryChip
                active={index === 0}
                className="h-10 sm:h-12 shrink-0 rounded-full px-4 sm:px-5 text-xs sm:text-sm"
                icon={<Icon className="size-3.5 sm:size-4" />}
                key={category.id}
              >
                {category.label}
              </CategoryChip>
            );
          })}
        </div>

        {featuredPlace && (
          <section className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-foreground text-lg sm:text-xl font-extrabold">
                🔥 Em alta
              </h2>
              <button
                className="text-primary text-xs sm:text-sm font-semibold hover:underline transition-all"
                type="button"
              >
                Ver tudo
              </button>
            </div>
            <HeroCard place={featuredPlace} />
          </section>
        )}

        {morePlaces.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-foreground text-lg sm:text-xl font-extrabold">
                Recomendações
              </h2>
              <button
                className="text-primary text-xs sm:text-sm font-semibold hover:underline transition-all"
                type="button"
              >
                Ver tudo
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {morePlaces.map((place) => (
                <PlaceCard key={place.id} place={place} />
              ))}
            </div>
          </section>
        )}
      </div>
    </AuthLayout>
  );
}
