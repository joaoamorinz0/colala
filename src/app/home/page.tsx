import { AuthLayout } from "@/components/layout";
import { SectionHeader } from "@/components/layout/section-header";
import { HeroCard, HorizontalCard } from "@/components/place";
import { CategoryChip } from "@/components/search/category-chip";
import { LargeSearchBox } from "@/components/search/large-search-box";
import { LIST_STACK, SECTION_GAP, SECTION_STACK } from "@/constants/design";
import { EXPERIENCE_CATEGORIES } from "@/features/places";
import { fetchPlaces } from "@/services/places";
import { cn } from "@/lib/utils";

export default async function HomePage() {
  const [featuredPlace, ...morePlaces] = await fetchPlaces({ limit: 4 });
  const chips = EXPERIENCE_CATEGORIES.slice(0, 4);

  return (
    <AuthLayout>
      <div className={cn(SECTION_STACK, "overflow-hidden")}>
        <header className="gap-stack-md flex items-start justify-between">
          <div className="min-w-0">
            <p className="text-muted-foreground text-sm">Boa tarde</p>
            <p className="text-foreground mt-1 text-2xl font-bold tracking-tight">
              João 👋
            </p>
          </div>
          <button
            className="border-primary bg-primary/10 text-primary flex size-12 shrink-0 items-center justify-center rounded-full border-2 text-lg font-bold"
            type="button"
          >
            J
          </button>
        </header>

        <h1 className="text-foreground max-w-[16rem] text-[2rem] leading-[1.12] font-extrabold tracking-tight">
          Onde você quer ir hoje?
        </h1>

        <LargeSearchBox placeholder="Buscar lugares..." showFilter />

        <div className="-mx-page-x gap-stack-sm px-page-x flex scrollbar-none overflow-x-auto pb-0.5">
          {chips.map((category, index) => {
            const Icon = category.icon;

            return (
              <CategoryChip
                active={index === 0}
                icon={<Icon className="size-4" />}
                key={category.id}
              >
                {category.label}
              </CategoryChip>
            );
          })}
        </div>

        <section className={SECTION_GAP}>
          <SectionHeader
            action={
              <button
                className="text-primary text-sm font-semibold"
                type="button"
              >
                Ver tudo
              </button>
            }
            title="🔥 Em alta hoje"
          />
          {featuredPlace ? (
            <HeroCard place={featuredPlace} />
          ) : (
            <div className="border-border bg-card text-muted-foreground rounded-card-lg p-card border text-sm">
              Nenhum local encontrado. Verifique a conexão com o Supabase.
            </div>
          )}
        </section>

        <section className={SECTION_GAP}>
          <SectionHeader
            action={
              <button
                className="text-primary text-sm font-semibold"
                type="button"
              >
                Ver tudo
              </button>
            }
            title="Mais lugares"
          />
          <div className={LIST_STACK}>
            {morePlaces.map((place) => (
              <HorizontalCard key={place.id} place={place} />
            ))}
          </div>
        </section>
      </div>
    </AuthLayout>
  );
}
