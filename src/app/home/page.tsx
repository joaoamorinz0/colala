import { AuthLayout } from "@/components/layout";
import { CategoryChip } from "@/components/search/category-chip";
import { LargeSearchBox } from "@/components/search/large-search-box";
import { EXPERIENCE_CATEGORIES, FeaturedPlaces } from "@/features/places";

export default function HomePage() {
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
          <FeaturedPlaces />
        </section>

        <section className="space-y-5 opacity-40">
          <div className="flex items-center justify-between">
            <h2 className="text-foreground text-3xl font-extrabold">
              ☕ Cafés para trabalhar
            </h2>
            <button
              className="text-primary text-lg font-semibold"
              type="button"
            >
              Ver tudo
            </button>
          </div>
        </section>
      </div>
    </AuthLayout>
  );
}
