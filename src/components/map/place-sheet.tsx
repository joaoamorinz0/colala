"use client";

import Link from "next/link";
import { Star, X } from "lucide-react";
import { PriceLevelBadge } from "@/components/place/price-level-badge";
import type { PlaceMapItem } from "@/types/place";

type PlaceSheetProps = {
  place: PlaceMapItem;
  onClose: () => void;
};

export function PlaceSheet({ place, onClose }: PlaceSheetProps) {
  return (
    <div
      className="absolute inset-0 z-10 bg-black/40"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="bg-card rounded-t-card-lg shadow-soft absolute inset-x-0 bottom-0"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Puxador do drawer */}
        <div className="flex justify-center pt-3">
          <div className="bg-border h-1.5 w-12 rounded-full" />
        </div>

        <div className="flex gap-3 p-4">
          <div className="bg-muted size-20 shrink-0 overflow-hidden rounded-xl">
            {place.cover_image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                alt={place.name}
                className="size-full object-cover"
                src={place.cover_image}
              />
            ) : null}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-card-foreground line-clamp-2 font-bold tracking-tight">
                {place.name}
              </h3>
              <button
                aria-label="Fechar"
                className="text-muted-foreground hover:text-foreground -m-1 shrink-0 rounded-full p-1"
                onClick={onClose}
                type="button"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              {place.category_name ? (
                <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs font-semibold">
                  {place.category_name}
                </span>
              ) : null}
              {place.price_level ? (
                <PriceLevelBadge level={place.price_level} />
              ) : null}
              {typeof place.rating === "number" ? (
                <span className="text-sm font-semibold tracking-tight">
                  <Star className="text-primary mb-0.5 inline size-3.5 fill-current" />
                  {place.rating.toFixed(1)}
                </span>
              ) : null}
            </div>

            <Link
              className="text-primary mt-3 inline-flex text-sm font-bold"
              href={`/place/${place.id}`}
            >
              Ver detalhes
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
