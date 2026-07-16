import { AuthLayout } from "@/components/layout";
import { FavoritePlaceRow } from "@/components/place";
import { MOCK_EXPERIENCES } from "@/features/places";

export default function FavoritesPage() {
  const favorites = MOCK_EXPERIENCES.slice(0, 2);

  return (
    <AuthLayout>
      <div className="space-y-12 pt-10">
        <header>
          <h1 className="text-foreground text-5xl font-extrabold tracking-tight">
            Favoritos
          </h1>
          <p className="text-muted-foreground mt-3 text-2xl">
            {favorites.length} lugares
          </p>
        </header>

        <section>
          <h2 className="text-muted-foreground mb-7 text-xl font-semibold tracking-[0.18em] uppercase">
            Seus lugares salvos
          </h2>
          <div className="space-y-6">
            {favorites.map((experience) => (
              <FavoritePlaceRow experience={experience} key={experience.id} />
            ))}
          </div>
        </section>
      </div>
    </AuthLayout>
  );
}
