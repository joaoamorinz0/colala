import { AuthLayout } from "@/components/layout";
<<<<<<< HEAD
import { PlaceCard } from "@/components/place";
import { CategoryChip } from "@/components/search/category-chip";
import { LargeSearchBox } from "@/components/search/large-search-box";
import { EXPERIENCE_CATEGORIES } from "@/features/places";
import { fetchPlaces } from "@/services/places";

export default async function HomePage() {
  const [featuredPlace, ...morePlaces] = await fetchPlaces({ limit: 4 });
=======
import { CategoryChip } from "@/components/search/category-chip";
import { LargeSearchBox } from "@/components/search/large-search-box";
import { EXPERIENCE_CATEGORIES, FeaturedPlaces } from "@/features/places";

export default function HomePage() {
>>>>>>> origin/devin/1784247793-supabase-places-integration
  const chips = EXPERIENCE_CATEGORIES.slice(0, 4);

  return (
    <AuthLayout>
      <div className="space-y-8 overflow-hidden">
        <header className="flex items-start justify-between">
          <div>
            <p className="text-muted-foreground text-xl">Boa tarde</p>
            <p className="text-foreground mt-2 text-3xl font-bold">João 👋</p>
          </div>
          <button
            className="border-primary bg-primary/8 text-primary flex size-16 items-center justify-center rounded-full border-4 text-2xl font-bold"
            type="button"
          >
            J
          </button>
        </header>

        <h1 className="text-foreground max-w-sm text-5xl leading-[1.08] font-extrabold tracking-tight">
          Onde você quer ir hoje?
        </h1>

        <LargeSearchBox placeholder="Buscar lugares..." showFilter />

        <div className="-mx-5 flex gap-3 overflow-x-auto px-5 pb-1">
          {chips.map((category, index) => {
            const Icon = category.icon;

            return (
              <CategoryChip
                active={index === 0}
                className="h-14 shrink-0 rounded-full px-6 text-lg"
                icon={<Icon className="size-5" />}
                key={category.id}
              >
                {category.label}
              </CategoryChip>
            );
          })}
        </div>

        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-foreground text-3xl font-extrabold">
              🔥 Em alta hoje
            </h2>
            <button
              className="text-primary text-lg font-semibold"
              type="button"
            >
              Ver tudo
            </button>
          </div>
<<<<<<< HEAD
          {featuredPlace ? (
            <PlaceCard place={featuredPlace} />
          ) : (
            <div className="border-border bg-card text-muted-foreground rounded-[1.75rem] border p-6 text-lg">
              Nenhum local encontrado. Verifique a conexão com o Supabase.
            </div>
          )}
=======
          <FeaturedPlaces />
>>>>>>> origin/devin/1784247793-supabase-places-integration
        </section>

        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-foreground text-3xl font-extrabold">
              Mais lugares
            </h2>
            <button
              className="text-primary text-lg font-semibold"
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
