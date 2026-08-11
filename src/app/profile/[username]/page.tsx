import { notFound } from "next/navigation";
import { Navbar } from "@/components/navigation/navbar";
import { HorizontalCard } from "@/components/place";
import { ProfileHeader, PublicReviewCard } from "@/components/profile";
import { APP_SHELL, PAGE_X } from "@/constants/design";
import { cn } from "@/lib/utils";
import {
  fetchProfileByUsername,
  fetchReviewsByUser,
  reviewPlaceToPlace,
} from "@/services/profiles";

// ─── Types ─────────────────────────────────────────────────────────────────────
type PublicProfilePageProps = {
  params: Promise<{ username: string }>;
};

// ─── Metadata ──────────────────────────────────────────────────────────────────
export async function generateMetadata({ params }: PublicProfilePageProps) {
  const { username } = await params;
  const profile = await fetchProfileByUsername(username);

  return {
    title: profile?.name ? `${profile.name} (@${profile.username})` : username,
    description:
      profile?.bio ??
      `Perfil público de @${username} no Colalá. Veja avaliações e lugares favoritos.`,
  };
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default async function PublicProfilePage({
  params,
}: PublicProfilePageProps) {
  const { username } = await params;
  const profile = await fetchProfileByUsername(username);

  if (!profile) {
    notFound();
  }

  const reviews = await fetchReviewsByUser(profile.id);
  const uniquePlaces = reviews.filter(
    (review, index, all) =>
      all.findIndex((item) => item.place_id === review.place_id) === index,
  );

  return (
    <div className={cn(APP_SHELL, "bg-background relative min-h-dvh")}>
      <div className={cn(PAGE_X, "pt-8 pb-36")}>
        {/* ── Header (respeita toggles de privacidade) ── */}
        <ProfileHeader
          profile={profile}
          reviewCount={reviews.length}
          reviewedPlaceCount={uniquePlaces.length}
          showCity={profile.show_city !== false}
          showInstagram={profile.show_instagram !== false}
        />

        <div className="mt-8 block h-px bg-gray-200" />

        {/* ── Places evaluated ── */}
        {uniquePlaces.length > 0 && (
          <section className="mt-8">
            <h2 className="text-foreground text-lg font-bold tracking-tight">
              Lugares avaliados
            </h2>
            <div className="mt-4 space-y-3">
              {uniquePlaces.map((review) => (
                <HorizontalCard
                  key={review.place_id}
                  place={reviewPlaceToPlace(review)}
                />
              ))}
            </div>
          </section>
        )}

        {/* ── Public reviews ── */}
        <section className="mt-8">
          <h2 className="text-foreground text-lg font-bold tracking-tight">
            Avaliações públicas
          </h2>
          {reviews.length > 0 ? (
            <div className="mt-4 space-y-3">
              {reviews.map((review) => (
                <PublicReviewCard key={review.id} review={review} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground mt-4 text-sm">
              Este usuário ainda não avaliou nenhum lugar.
            </p>
          )}
        </section>
      </div>

      <Navbar />
    </div>
  );
}
