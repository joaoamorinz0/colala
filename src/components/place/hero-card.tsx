import Link from "next/link";
import { Heart, MapPin, Star } from "lucide-react";
import type { Place } from "@/types/place";
import { cn } from "@/lib/utils";
import { PriceLevelBadge } from "./price-level-badge";
import { InstagramButton } from "./instagram-button";

export type HeroCardProps = {
  place: Place;
  className?: string;
};

export function HeroCard({ place, className }: HeroCardProps) {
  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-3xl shadow-soft min-h-80 sm:min-h-96 group",
        className,
      )}
      style={{
        backgroundImage: `linear-gradient(180deg, hsl(0 0% 0% / 0) 40%, hsl(0 0% 0% / 0.7) 100%), url(${place.cover_image})`,
        backgroundPosition: "center",
        backgroundSize: "cover",
      }}
    >
      <Link href={`/place/${place.id}`} className="absolute inset-0" />

      <div className="absolute inset-x-0 top-0 p-3 sm:p-4 flex items-start justify-between">
        <div className="bg-background/80 backdrop-blur-md inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold text-foreground">
          <MapPin className="text-primary size-4" />
          <span className="truncate">{place.city ?? "Local"}</span>
        </div>
        <button
          className="bg-background/80 backdrop-blur-md text-primary hover:bg-background flex size-11 items-center justify-center rounded-full transition-colors relative z-10"
          type="button"
          onClick={(e) => e.preventDefault()}
        >
          <Heart className="size-5" />
        </button>
      </div>

      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 text-white space-y-3">
        <div className="inline-flex items-center gap-1 bg-black/40 rounded-full px-3 py-1.5 text-xs sm:text-sm font-medium backdrop-blur">
          <span>📍</span>
          {place.city}
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold line-clamp-2 leading-tight">
          {place.name}
        </h2>

        {place.description && (
          <p className="text-white/85 text-xs sm:text-sm line-clamp-1">
            {place.description}
          </p>
        )}

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-3 flex-wrap">
            {place.price_level && (
              <div className="inline-flex items-center gap-1 text-white font-semibold">
                {Array.from({ length: place.price_level }, (_, i) => (
                  <span key={i}>$</span>
                ))}
              </div>
            )}
          </div>
          {place.instagram && (
            <div className="relative z-20">
              <InstagramButton instagram={place.instagram} />
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
