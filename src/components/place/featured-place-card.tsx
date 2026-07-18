import { Heart, MapPin, Star } from "lucide-react";
import { CARD_SURFACE_SOFT, MEDIA_COVER } from "@/constants/design";
import type { Experience } from "@/features/places";
import { cn } from "@/lib/utils";

export type FeaturedPlaceCardProps = {
  experience: Experience;
  className?: string;
};

/** Full-width photo hero — nearly the full app column. */
export function FeaturedPlaceCard({
  experience,
  className,
}: FeaturedPlaceCardProps) {
  return (
    <article
      className={cn(
        CARD_SURFACE_SOFT,
        "relative aspect-[3/4] max-h-[34rem] min-h-[22rem] w-full",
        className,
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt={experience.title}
        className={cn(MEDIA_COVER, "absolute inset-0")}
        src={experience.imageUrl}
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-linear-to-b from-black/10 via-transparent to-black/75"
      />

      <div className="shadow-card absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-white/92 px-3 py-1.5 text-sm font-semibold">
        <MapPin className="text-primary size-4" />
        {experience.distance}
      </div>
      <button
        className="text-primary shadow-card absolute top-4 right-4 flex size-11 items-center justify-center rounded-full bg-white/92"
        type="button"
      >
        <Heart className="size-5" />
      </button>

      <div className="absolute inset-x-0 bottom-0 p-5 text-white">
        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-black/35 px-3 py-1 text-sm backdrop-blur-sm">
          <span>☕</span>
          {experience.category}
        </div>
        <h2 className="text-2xl font-extrabold tracking-tight">
          {experience.title}
        </h2>
        <p className="mt-1.5 text-base text-white/85">
          {experience.neighborhood} · São Paulo
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm font-semibold">
          <span className="inline-flex items-center gap-1.5">
            <Star className="size-4 fill-yellow-300 text-yellow-300" />
            {experience.rating}
          </span>
          <span className="text-white/70">({experience.reviewCount})</span>
          <span className="text-white/70">·</span>
          <span>{experience.price}</span>
          {experience.isOpen ? (
            <span className="rounded-full bg-emerald-500/85 px-2.5 py-0.5 text-xs">
              Aberto
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
}
