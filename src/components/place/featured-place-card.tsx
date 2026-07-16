import { Heart, MapPin, Star } from "lucide-react";
import type { Experience } from "@/features/places";
import { cn } from "@/lib/utils";

export type FeaturedPlaceCardProps = {
  experience: Experience;
  className?: string;
};

export function FeaturedPlaceCard({
  experience,
  className,
}: FeaturedPlaceCardProps) {
  return (
    <article
      className={cn(
        "bg-muted shadow-soft relative min-h-[34rem] overflow-hidden rounded-[2rem]",
        className,
      )}
      style={{
        backgroundImage: `linear-gradient(180deg, hsl(0 0% 0% / 0.03) 25%, hsl(0 0% 0% / 0.78) 100%), url(${experience.imageUrl})`,
        backgroundPosition: "center",
        backgroundSize: "cover",
      }}
    >
      <div className="text-foreground shadow-card absolute top-7 left-7 inline-flex items-center gap-2 rounded-full bg-white/92 px-4 py-3 text-base font-bold">
        <MapPin className="text-primary size-5" />
        {experience.distance}
      </div>
      <button
        className="text-primary shadow-card absolute top-7 right-7 flex size-16 items-center justify-center rounded-full bg-white/92"
        type="button"
      >
        <Heart className="size-8" />
      </button>

      <div className="absolute inset-x-0 bottom-0 p-7 text-white">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-black/35 px-4 py-2 text-base backdrop-blur">
          <span>☕</span>
          {experience.category}
        </div>
        <h2 className="text-4xl font-extrabold tracking-tight">
          {experience.title}
        </h2>
        <p className="mt-3 text-xl text-white/82">
          {experience.neighborhood} · São Paulo
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-3 text-lg font-semibold">
          <span className="inline-flex items-center gap-2">
            <Star className="size-5 fill-yellow-300 text-yellow-300" />
            {experience.rating}
          </span>
          <span className="text-white/72">({experience.reviewCount})</span>
          <span className="text-white/72">·</span>
          <span>{experience.price}</span>
          {experience.isOpen ? (
            <span className="rounded-full bg-emerald-500/80 px-4 py-1 text-base">
              Aberto
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
}
