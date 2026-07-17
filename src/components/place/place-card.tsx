import Link from "next/link";
import { Instagram, MapPin } from "lucide-react";
import type { Place } from "@/types/place";
import { cn } from "@/lib/utils";

export type PlaceCardProps = {
  place: Place;
  className?: string;
};

export function PlaceCard({ place, className }: PlaceCardProps) {
  return (
    <article
      className={cn(
        "bg-card shadow-soft overflow-hidden rounded-[1.75rem] border",
        className,
      )}
    >
      <Link href={`/place/${place.id}`} className="block">
        <div
          className="bg-muted aspect-[16/11]"
          style={{
            backgroundImage: place.cover_image
              ? `url(${place.cover_image})`
              : undefined,
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
        />

        <div className="space-y-3 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-card-foreground line-clamp-1 text-xl font-bold">
                {place.name}
              </h3>
              <p className="text-muted-foreground mt-1 flex items-center gap-1 text-sm">
                <MapPin className="size-4 shrink-0" />
                <span className="truncate">
                  {place.city ?? "Cidade não informada"}
                </span>
              </p>
            </div>

            {place.price_level ? (
              <span className="bg-primary/10 text-primary shrink-0 rounded-full px-3 py-1 text-sm font-semibold">
                {String(place.price_level)}
              </span>
            ) : null}
          </div>

          {place.description ? (
            <p className="text-muted-foreground line-clamp-2 text-sm leading-6">
              {place.description}
            </p>
          ) : null}

          {place.instagram ? (
            <div className="text-foreground/75 flex items-center gap-2 text-sm font-medium">
              <Instagram className="size-4" />
              <span className="truncate">{place.instagram}</span>
            </div>
          ) : null}
        </div>
      </Link>
    </article>
  );
}
