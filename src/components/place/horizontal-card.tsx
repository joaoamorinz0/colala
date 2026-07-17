import Link from "next/link";
import { Heart, MapPin } from "lucide-react";
import type { Place } from "@/types/place";
import { cn } from "@/lib/utils";
import { PriceLevelBadge } from "./price-level-badge";
import { InstagramButton } from "./instagram-button";

export type HorizontalCardProps = {
  place: Place;
  className?: string;
};

export function HorizontalCard({ place, className }: HorizontalCardProps) {
  return (
    <article
      className={cn(
        "bg-card border border-border/50 overflow-hidden rounded-2xl flex gap-3 transition-all duration-300 hover:shadow-card group",
        className,
      )}
    >
      <Link href={`/place/${place.id}`} className="block flex-shrink-0">
        <div
          className="bg-muted h-24 w-24 sm:h-28 sm:w-28 rounded-xl"
          style={{
            backgroundImage: place.cover_image
              ? `url(${place.cover_image})`
              : undefined,
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
        />
      </Link>

      <div className="flex-1 py-2.5 px-3 sm:py-3 sm:px-4 flex flex-col justify-between min-w-0">
        <div className="min-w-0">
          <h3 className="text-card-foreground line-clamp-1 text-sm sm:text-base font-bold">
            {place.name}
          </h3>
          <p className="text-muted-foreground mt-0.5 flex items-center gap-1 text-xs">
            <MapPin className="size-3 shrink-0" />
            <span className="truncate">{place.city ?? "Cidade"}</span>
          </p>
        </div>

        {place.description && (
          <p className="text-muted-foreground text-xs line-clamp-1 mt-1">
            {place.description}
          </p>
        )}

        <div className="flex items-center justify-between gap-2 mt-1.5">
          <div className="flex items-center gap-2">
            {place.price_level && (
              <PriceLevelBadge level={place.price_level} />
            )}
          </div>
          <div className="flex items-center gap-1">
            <button className="text-primary hover:bg-primary/10 p-1 rounded transition-colors" type="button">
              <Heart className="size-3.5 sm:size-4" />
            </button>
            {place.instagram && (
              <div onClick={(e) => e.stopPropagation()}>
                <InstagramButton instagram={place.instagram} size="sm" />
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
