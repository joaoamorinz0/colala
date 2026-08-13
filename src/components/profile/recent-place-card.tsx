import Link from "next/link";
import { MapPin, Star } from "lucide-react";
import {
  CARD_SURFACE,
  HORIZONTAL_CARD_HEIGHT,
  MEDIA_COVER,
} from "@/constants/design";
import { cn } from "@/lib/utils";
import type { Place } from "@/types/place";

export type RecentPlaceCardProps = {
  place: Place;
  className?: string;
};

function formatRating(rating: number) {
  return rating.toFixed(1).replace(".", ",");
}

/**
 * Card de lugar recentemente avaliado no perfil.
 * Segue o padrão de card horizontal do perfil público,
 * mostrando o rating do PLACE (não a nota dada pelo usuário).
 */
export function RecentPlaceCard({ place, className }: RecentPlaceCardProps) {
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
        ) : (
          <div className="bg-primary/10 text-primary flex size-full items-center justify-center text-lg font-bold">
            {place.name?.[0] ?? "?"}
          </div>
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
        <div className="min-w-0">
          <Link href={`/place/${place.id}`}>
            <h3 className="text-card-foreground line-clamp-1 text-sm font-bold tracking-tight">
              {place.name}
            </h3>
          </Link>
          <p className="text-muted-foreground mt-0.5 line-clamp-1 text-xs">
            {place.category?.name ? (
              <span>
                {place.category.icon ? (
                  <span aria-hidden="true" className="mr-1">
                    {place.category.icon}
                  </span>
                ) : null}
                {place.category.name}
                <span className="mx-1.5">·</span>
              </span>
            ) : null}
            <span className="inline-flex items-center gap-0.5">
              <MapPin className="size-3 shrink-0" />
              <span className="truncate">
                {place.city ?? "Cidade não informada"}
              </span>
            </span>
          </p>
        </div>

        {place.rating !== null && place.rating !== undefined ? (
          <span className="inline-flex shrink-0 items-center gap-1 self-start text-xs font-bold text-gray-800">
            <Star className="size-3.5 fill-amber-400 text-amber-400" />
            {formatRating(place.rating)}
          </span>
        ) : null}
      </div>
    </article>
  );
}
