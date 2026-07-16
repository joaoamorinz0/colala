import { AuthLayout } from "@/components/layout";
import { CategoryCard, LargeSearchBox } from "@/components/search";
import { EXPERIENCE_CATEGORIES, RECENT_SEARCHES } from "@/features/places";
import { Clock3 } from "lucide-react";

export default function SearchPage() {
  const categories = EXPERIENCE_CATEGORIES.filter(
    (category) => category.id !== "all",
  );

  return (
    <AuthLayout>
      <div className="space-y-14">
        <LargeSearchBox />

        <section>
          <h1 className="text-foreground mb-8 text-3xl font-extrabold">
            Buscas recentes
          </h1>
          <div className="divide-border divide-y">
            {RECENT_SEARCHES.map((search) => (
              <button
                className="text-foreground flex h-20 w-full items-center gap-5 text-left text-2xl"
                key={search}
                type="button"
              >
                <Clock3 className="text-muted-foreground size-6" />
                {search}
              </button>
            ))}
          </div>
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
