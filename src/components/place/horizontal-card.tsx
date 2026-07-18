import Link from "next/link";
import { Heart, MapPin } from "lucide-react";
import {
  CARD_SURFACE,
  HORIZONTAL_CARD_HEIGHT,
  MEDIA_COVER,
} from "@/constants/design";
import type { Place } from "@/types/place";
import { cn } from "@/lib/utils";
import { InstagramButton } from "./instagram-button";
import { PriceLevelBadge } from "./price-level-badge";

export type HorizontalCardProps = {
  place: Place;
  className?: string;
};

/**
 * Horizontal list card with fixed height and square thumbnail.
 */
export function HorizontalCard({ place, className }: HorizontalCardProps) {
  return (
    <article
      className={cn(
        CARD_SURFACE,
        HORIZONTAL_CARD_HEIGHT,
        "gap-stack-sm p-card-sm flex w-full items-stretch",
        className,
      )}
    >
      <Link
        className="bg-muted relative size-[4.75rem] shrink-0 overflow-hidden rounded-md"
        href={`/place/${place.id}`}
      >
        {place.cover_image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt={place.name}
            className={MEDIA_COVER}
            src={place.cover_image}
          />
        ) : null}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
        <div className="min-w-0">
          <Link href={`/place/${place.id}`}>
            <h3 className="text-card-foreground line-clamp-1 text-sm font-bold tracking-tight">
              {place.name}
            </h3>
          </Link>
          <p className="text-muted-foreground mt-0.5 flex items-center gap-1 text-xs">
            <MapPin className="size-3 shrink-0" />
            <span className="truncate">{place.city ?? "Cidade"}</span>
          </p>
          {place.description ? (
            <p className="text-muted-foreground mt-0.5 line-clamp-1 text-xs">
              {place.description}
            </p>
          ) : null}
        </div>

        <div className="gap-stack-sm flex items-center justify-between">
          <div className="gap-stack-xs flex min-w-0 items-center">
            {place.price_level ? (
              <PriceLevelBadge level={place.price_level} />
            ) : null}
          </div>
          <div className="flex shrink-0 items-center">
            <button
              className="text-primary hover:bg-primary/10 rounded-md p-1 transition-colors"
              type="button"
            >
              <Heart className="size-4" />
            </button>
            {place.instagram ? (
              <InstagramButton instagram={place.instagram} size="sm" />
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
