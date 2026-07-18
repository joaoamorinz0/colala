import { Heart, Star } from "lucide-react";
import { HORIZONTAL_CARD_HEIGHT, MEDIA_COVER } from "@/constants/design";
import type { Experience } from "@/features/places";
import { cn } from "@/lib/utils";

export type FavoritePlaceRowProps = {
  experience: Experience;
  className?: string;
};

/** Horizontal row with consistent height (Airbnb-style list item). */
export function FavoritePlaceRow({
  experience,
  className,
}: FavoritePlaceRowProps) {
  return (
    <article
      className={cn(
        HORIZONTAL_CARD_HEIGHT,
        "gap-stack-md flex w-full items-center",
        className,
      )}
    >
      <div className="bg-muted size-[5.5rem] shrink-0 overflow-hidden rounded-xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt={experience.title}
          className={MEDIA_COVER}
          src={experience.imageUrl}
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-muted-foreground text-xs font-medium">
          {experience.category === "Café" ? "☕" : "🌇"} {experience.category}
        </p>
        <h2 className="text-foreground mt-0.5 line-clamp-1 text-base font-bold tracking-tight">
          {experience.title}
        </h2>
        <p className="text-muted-foreground mt-0.5 truncate text-sm">
          {experience.neighborhood} · {experience.distance}
        </p>
        <div className="mt-1 flex items-center gap-1.5 text-sm font-semibold">
          <Star className="size-3.5 fill-yellow-300 text-yellow-300" />
          {experience.rating}
          <span className="text-muted-foreground font-medium">
            ({experience.reviewCount})
          </span>
          <span className="text-muted-foreground ml-1">{experience.price}</span>
        </div>
      </div>
      <button className="text-primary shrink-0 self-start pt-1" type="button">
        <Heart className="size-5" />
      </button>
    </article>
  );
}
