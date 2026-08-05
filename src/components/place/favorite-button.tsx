"use client";

import { Heart } from "lucide-react";
import { useFavoriteStatus } from "@/features/places/hooks/use-favorites";
import { cn } from "@/lib/utils";

type FavoriteButtonProps = {
  placeId: string;
  className?: string;
};

export function FavoriteButton({ placeId, className }: FavoriteButtonProps) {
  const { isFavored, toggleFavorite, isToggling } = useFavoriteStatus(placeId);

  return (
    <button
      id="place-favorite-btn"
      onClick={() => toggleFavorite()}
      disabled={isToggling}
      type="button"
      aria-label={
        isFavored ? "Remover dos favoritos" : "Adicionar aos favoritos"
      }
      className={cn(
        "flex size-11 items-center justify-center rounded-full backdrop-blur-xl transition-all active:scale-90 disabled:opacity-50",
        "bg-white/20 shadow-lg ring-1 ring-white/30",
        isFavored ? "text-red-400" : "text-white",
        className,
      )}
    >
      <Heart
        className={cn("size-5 transition-all", isFavored && "fill-red-400")}
      />
    </button>
  );
}
