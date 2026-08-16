"use client";

import Link from "next/link";
import { Compass, Heart } from "lucide-react";
import { EmptyState } from "@/components/layout";
import { FavoritePlaceRow } from "@/components/place";
import { Button } from "@/components/ui";
import { HORIZONTAL_CARD_HEIGHT, LIST_STACK } from "@/constants/design";
import { useFavorites } from "@/features/places/hooks/use-favorites";
import { placeToExperience } from "@/features/places/utils/place-to-experience";
import { cn } from "@/lib/utils";

/** Skeleton horizontal que espelha o layout real das linhas de favoritos. */
function FavoriteRowSkeleton() {
  return (
    <div
      className={cn(
        HORIZONTAL_CARD_HEIGHT,
        "gap-stack-md flex w-full animate-pulse items-center",
      )}
    >
      <div className="bg-muted size-[5.5rem] shrink-0 rounded-xl" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="bg-muted h-3 w-1/4 rounded-full" />
        <div className="bg-muted h-4 w-3/4 rounded-full" />
        <div className="bg-muted h-3 w-1/2 rounded-full" />
      </div>
    </div>
  );
}

export function FavoritePlaces() {
  const { data, isLoading, isError, error } = useFavorites();

  if (isLoading) {
    return (
      <div className={cn(LIST_STACK)}>
        <FavoriteRowSkeleton />
        <FavoriteRowSkeleton />
        <FavoriteRowSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        title="Não foi possível carregar os favoritos"
        description={
          error instanceof Error ? error.message : "Erro desconhecido."
        }
      />
    );
  }

  const places = data ?? [];

  if (places.length === 0) {
    return (
      <EmptyState
        icon={Heart}
        title="Nenhum lugar salvo"
        description="Salve seus lugares favoritos tocando no coração de um lugar e encontre tudo aqui."
        action={
          <Button asChild>
            <Link href="/search">
              <Compass className="size-4" />
              Explorar lugares
            </Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className={cn(LIST_STACK)}>
      {places.map((place, index) => (
        <div
          className="animate-fade-up"
          key={place.id}
          style={{ animationDelay: `${Math.min(index * 35, 245)}ms` }}
        >
          <FavoritePlaceRow experience={placeToExperience(place)} />
        </div>
      ))}
    </div>
  );
}
