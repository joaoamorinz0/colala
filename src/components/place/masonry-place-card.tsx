import Link from "next/link";
import { MapPin } from "lucide-react";
import { MEDIA_COVER } from "@/constants/design";
import type { Place } from "@/types/place";
import { cn } from "@/lib/utils";

/**
 * Ciclo de aspect ratios que gera o efeito mosaico (alturas variadas
 * entre colunas, evitando grid uniforme).
 */
export const MASONRY_ASPECT_CYCLE = [
  "aspect-[4/5]",
  "aspect-[3/4]",
  "aspect-square",
  "aspect-[3/5]",
  "aspect-[4/5]",
  "aspect-square",
] as const;

export type MasonryPlaceCardProps = {
  place: Place;
  /** Índice no grid — determina o aspect ratio do card. */
  index: number;
  className?: string;
};

/**
 * Card photo-first para grid mosaico (Pinterest-style).
 * Mostra apenas a imagem de fundo, nome e cidade sobrepostos.
 */
export function MasonryPlaceCard({
  place,
  index,
  className,
}: MasonryPlaceCardProps) {
  const aspectClass = MASONRY_ASPECT_CYCLE[index % MASONRY_ASPECT_CYCLE.length];

  return (
    <article className={cn("mb-3 break-inside-avoid", className)}>
      <Link
        href={`/place/${place.id}`}
        className={cn(
          "rounded-card-lg relative block w-full overflow-hidden",
          aspectClass,
          !place.cover_image && "bg-muted",
        )}
      >
        {place.cover_image ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt={place.name}
              className={cn(MEDIA_COVER, "absolute inset-0")}
              src={place.cover_image}
            />
            <div
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-2/3 bg-linear-to-b from-transparent to-black/80"
            />
          </>
        ) : null}

        <div
          className={cn(
            "p-card-sm absolute inset-x-0 bottom-0",
            place.cover_image ? "text-white" : "text-foreground",
          )}
        >
          <h3 className="line-clamp-1 text-sm font-bold tracking-tight">
            {place.name}
          </h3>
          <p
            className={cn(
              "mt-0.5 flex items-center gap-1 text-xs font-medium",
              place.cover_image ? "text-white/85" : "text-muted-foreground",
            )}
          >
            <MapPin className="size-3 shrink-0" />
            <span className="truncate">
              {place.city ?? "Cidade não informada"}
            </span>
          </p>
        </div>
      </Link>
    </article>
  );
}
