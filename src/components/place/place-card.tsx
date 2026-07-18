import Link from "next/link";
import { MapPin } from "lucide-react";
import { CARD_SURFACE_LG, MEDIA_COVER } from "@/constants/design";
import type { Place } from "@/types/place";
import { cn } from "@/lib/utils";
import { InstagramButton } from "./instagram-button";
import { PriceLevelBadge } from "./price-level-badge";

export type PlaceCardProps = {
  place: Place;
  className?: string;
};

/**
 * Medium vertical card — full column width on lists/grids.
 * For fixed-width carousels, prefer `components/cards/medium-card`.
 */
export function PlaceCard({ place, className }: PlaceCardProps) {
  return (
    <article className={cn(CARD_SURFACE_LG, "w-full", className)}>
      <Link href={`/place/${place.id}`} className="block">
        <div className="bg-muted aspect-[16/11] w-full overflow-hidden">
          {place.cover_image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt={place.name}
              className={MEDIA_COVER}
              src={place.cover_image}
            />
          ) : (
            <div className="bg-muted size-full" />
          )}
        </div>

        <div className="space-y-stack-sm p-card">
          <div className="gap-stack-sm flex items-start justify-between">
            <div className="min-w-0">
              <h3 className="text-card-foreground line-clamp-1 text-lg font-bold tracking-tight">
                {place.name}
              </h3>
              <p className="text-muted-foreground mt-1 flex items-center gap-1 text-sm">
                <MapPin className="size-3.5 shrink-0" />
                <span className="truncate">
                  {place.city ?? "Cidade não informada"}
                </span>
              </p>
            </div>

            {place.price_level ? (
              <PriceLevelBadge level={place.price_level} />
            ) : null}
          </div>

          {place.description ? (
            <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed">
              {place.description}
            </p>
          ) : null}

          {place.instagram ? (
            <div className="flex items-center gap-1">
              <InstagramButton instagram={place.instagram} />
              <span className="text-foreground/70 truncate text-sm font-medium">
                {place.instagram}
              </span>
            </div>
          ) : null}
        </div>
      </Link>
    </article>
  );
}
