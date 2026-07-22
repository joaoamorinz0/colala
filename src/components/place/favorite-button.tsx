"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

type FavoriteButtonProps = {
  placeId: string;
  className?: string;
};

export function FavoriteButton({ placeId, className }: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  // placeId will be used when wiring up the real favorites API
  void placeId;

  return (
    <button
      id="place-favorite-btn"
      onClick={() => setIsFavorited((v) => !v)}
      type="button"
      aria-label={
        isFavorited ? "Remover dos favoritos" : "Adicionar aos favoritos"
      }
      className={cn(
        "flex size-11 items-center justify-center rounded-full backdrop-blur-xl transition-all active:scale-90",
        "bg-white/20 shadow-lg ring-1 ring-white/30",
        isFavorited ? "text-red-400" : "text-white",
        className,
      )}
    >
      <Heart
        className={cn("size-5 transition-all", isFavorited && "fill-red-400")}
      />
    </button>
  );
}
