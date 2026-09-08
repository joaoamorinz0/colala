"use client";

import Link from "next/link";
import { Compass, Heart } from "lucide-react";
import { Button } from "@/components/ui";
import { EmptyState } from "@/components/layout";
import { LIST_STACK } from "@/constants/design";
import { useFavorites } from "@/features/places/hooks/use-favorites";
import { cn } from "@/lib/utils";
import { RecentPlaceCard } from "@/components/profile/recent-place-card";

export function FavoritePlacesSection() {
  const { data, isLoading, isError, error } = useFavorites();
  const places = data ?? [];

  return (
    <section className={cn("space-y-stack-md")}>
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-foreground text-lg font-bold tracking-tight">
          Meus Favoritos
        </h2>
        <span className="text-muted-foreground text-sm font-medium">
          {places.length} salvos
        </span>
      </div>

      {isLoading ? (
        <div className={cn(LIST_STACK)}>
          <div className="bg-muted h-[4.75rem] w-full animate-pulse rounded-xl" />
          <div className="bg-muted h-[4.75rem] w-full animate-pulse rounded-xl" />
          <div className="bg-muted h-[4.75rem] w-full animate-pulse rounded-xl" />
        </div>
      ) : isError ? (
        <EmptyState
          icon={Heart}
          title="Não foi possível carregar os favoritos"
          description={
            error instanceof Error ? error.message : "Erro desconhecido."
          }
        />
      ) : places.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Nenhum favorito ainda"
          description="Marque lugares com coração para encontrá-los aqui quando quiser."
          action={
            <Button asChild>
              <Link href="/discover">
                <Compass className="size-4" />
                Explorar lugares
              </Link>
            </Button>
          }
        />
      ) : (
        <div className={cn(LIST_STACK)}>
          {places.map((place) => (
            <RecentPlaceCard key={place.id} place={place} />
          ))}
        </div>
      )}
    </section>
  );
}
