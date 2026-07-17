import { AuthLayout } from "@/components/layout";
import { FavoritePlaces } from "@/features/places";

export default function FavoritesPage() {
  return (
    <AuthLayout>
      <div className="space-y-12 pt-10">
        <header>
          <h1 className="text-foreground text-5xl font-extrabold tracking-tight">
            Favoritos
          </h1>
          <p className="text-muted-foreground mt-3 text-2xl">Seus lugares</p>
        </header>

        <section>
          <h2 className="text-muted-foreground mb-7 text-xl font-semibold tracking-[0.18em] uppercase">
            Seus lugares salvos
          </h2>
          <FavoritePlaces />
        </section>
      </div>
    </AuthLayout>
  );
}
