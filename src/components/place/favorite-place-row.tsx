"use client";

import { Heart, Star } from "lucide-react";
import { HORIZONTAL_CARD_HEIGHT, MEDIA_COVER } from "@/constants/design";
import { useFavoriteStatus } from "@/features/places/hooks/use-favorites";
import { usePopFeedback } from "@/hooks";
import { cn } from "@/lib/utils";
import type { Experience } from "@/features/places";

export type FavoritePlaceRowProps = {
  experience: Experience;
  className?: string;
};

/** Horizontal row with consistent height (Airbnb-style list item). */
export function FavoritePlaceRow({
  experience,
  className,
}: FavoritePlaceRowProps) {
  const { isFavored, toggleFavorite, isToggling } = useFavoriteStatus(
    experience.id,
  );
  const { isPopping, triggerPop } = usePopFeedback();

  return (
    <article
      className={cn(
        HORIZONTAL_CARD_HEIGHT,
        "gap-stack-md flex w-full items-center",
        className,
      )}
    >
      <div className="bg-muted size-[5.5rem] shrink-0 overflow-hidden rounded-xl">
        <img
          alt={experience.title}
          className={MEDIA_COVER}
          src={experience.imageUrl}
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-muted-foreground text-xs font-medium">
          {experience.category === "Café" ? "☕" : ""} {experience.category}
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
      <button
        type="button"
        onClick={() => {
          triggerPop();
          toggleFavorite();
        }}
        disabled={isToggling}
        aria-label={
          isFavored ? "Remover dos favoritos" : "Adicionar aos favoritos"
        }
        aria-pressed={isFavored}
        className={cn(
          "text-primary shrink-0 self-start pt-1 transition-all active:scale-90",
          "disabled:cursor-not-allowed disabled:opacity-50",
        )}
      >
        <Heart
          key={isFavored ? "fav" : "unfav"}
          className={cn(
            "size-5 transition-all",
            isFavored && "fill-red-500 text-red-500",
            isPopping && "animate-pop",
          )}
        />
      </button>
    </article>
  );
}
