import { AuthLayout } from "@/components/layout";
import { SECTION_STACK } from "@/constants/design";
import { FavoritePlaces } from "@/features/places";

export default function FavoritesPage() {
  return (
    <AuthLayout>
      <div className={SECTION_STACK}>
        <header>
          <h1 className="text-foreground text-[2rem] font-extrabold tracking-tight">
            Favoritos
          </h1>
          <p className="text-muted-foreground mt-1 text-base">Seus lugares</p>
        </header>

        <section className="space-y-stack-md">
          <h2 className="text-muted-foreground text-xs font-semibold tracking-[0.14em] uppercase">
            Seus lugares salvos
          </h2>
          <FavoritePlaces />
        </section>
      </div>
    </AuthLayout>
  );
}
