import Link from "next/link";
import { Heart, MapPin } from "lucide-react";
import { CARD_SURFACE_SOFT, MEDIA_COVER } from "@/constants/design";
import type { Place } from "@/types/place";
import { cn } from "@/lib/utils";
import { InstagramButton } from "./instagram-button";

export type HeroCardProps = {
  place: Place;
  className?: string;
};

/**
 * Full-width hero for featured places.
 * Nearly fills the app column (max ~430px).
 */
export function HeroCard({ place, className }: HeroCardProps) {
  return (
    <article
      className={cn(
        CARD_SURFACE_SOFT,
        "relative aspect-[4/5] max-h-[32rem] min-h-[20rem] w-full",
        className,
      )}
    >
      {place.cover_image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt={place.name}
          className={cn(MEDIA_COVER, "absolute inset-0")}
          src={place.cover_image}
        />
      ) : (
        <div className="bg-muted absolute inset-0" />
      )}
      <div
        aria-hidden
        className="absolute inset-0 bg-linear-to-b from-black/5 via-transparent to-black/75"
      />

      <Link
        aria-label={place.name}
        className="absolute inset-0 z-0"
        href={`/place/${place.id}`}
      />

      <div className="p-card absolute inset-x-0 top-0 z-10 flex items-start justify-between">
        <div className="bg-background/85 text-foreground shadow-card inline-flex max-w-[70%] items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold backdrop-blur-md">
          <MapPin className="text-primary size-3.5 shrink-0" />
          <span className="truncate">{place.city ?? "Local"}</span>
        </div>
        <button
          className="bg-background/85 text-primary shadow-card hover:bg-background relative z-10 flex size-10 items-center justify-center rounded-full backdrop-blur-md transition-colors"
          type="button"
        >
          <Heart className="size-5" />
        </button>
      </div>

      <div className="space-y-stack-sm p-card absolute inset-x-0 bottom-0 z-10 text-white">
        <div className="inline-flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-1 text-xs font-medium backdrop-blur-sm">
          <span>📍</span>
          {place.city ?? "Local"}
        </div>

        <h2 className="line-clamp-2 text-2xl leading-tight font-extrabold tracking-tight">
          {place.name}
        </h2>

        {place.description ? (
          <p className="line-clamp-1 text-sm text-white/85">
            {place.description}
          </p>
        ) : null}

        <div className="gap-stack-sm flex items-center justify-between pt-0.5">
          {place.price_level ? (
            <div className="inline-flex items-center gap-0.5 text-sm font-semibold">
              {Array.from(
                { length: Math.min(Math.max(place.price_level, 1), 4) },
                (_, i) => (
                  <span key={i}>$</span>
                ),
              )}
            </div>
          ) : (
            <span />
          )}
          {place.instagram ? (
            <div className="relative z-20">
              <InstagramButton
                className="text-white/90 hover:bg-white/15 hover:text-white"
                instagram={place.instagram}
              />
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
