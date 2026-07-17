import Link from "next/link";
import { Heart, MapPin } from "lucide-react";
import type { Place } from "@/types/place";
import { cn } from "@/lib/utils";
import { PriceLevelBadge } from "./price-level-badge";
import { InstagramButton } from "./instagram-button";

export type PlaceCardProps = {
  place: Place;
  className?: string;
};

export function PlaceCard({ place, className }: PlaceCardProps) {
  return (
    <article
      className={cn(
        "bg-card shadow-card overflow-hidden rounded-2xl border border-border/50 transition-all duration-300 hover:shadow-soft",
        className,
      )}
    >
      <Link href={`/place/${place.id}`} className="block group">
        <div
          className="bg-muted aspect-video w-full"
          style={{
            backgroundImage: place.cover_image
              ? `url(${place.cover_image})`
              : undefined,
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
        />

        <div className="space-y-2 p-3 sm:p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="text-card-foreground line-clamp-1 text-base sm:text-lg font-bold">
                {place.name}
              </h3>
              <p className="text-muted-foreground mt-0.5 flex items-center gap-1 text-xs sm:text-sm">
                <MapPin className="size-3.5 sm:size-4 shrink-0" />
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
            <p className="text-muted-foreground line-clamp-2 text-xs sm:text-sm leading-relaxed">
              {place.description}
            </p>
          ) : null}

          <div className="flex items-center justify-between pt-1">
            <button className="text-primary hover:bg-primary/10 p-1.5 rounded-lg transition-colors" type="button">
              <Heart className="size-4 sm:size-5" />
            </button>
            {place.instagram ? (
              <InstagramButton instagram={place.instagram} />
            ) : null}
          </div>
        </div>
      </Link>
    </article>
  );
}
