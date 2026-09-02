"use client";

import Link from "next/link";
import type { Route } from "next";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { SECTION_GAP } from "@/constants/design";
import { cn } from "@/lib/utils";
import type { Place } from "@/types/place";
import { HeroCard } from "@/components/place/hero-card";

export type PlacesCarouselSectionProps = {
  title: string;
  icon?: ReactNode;
  places: Place[];
  isLoading?: boolean;
  emptyMessage?: string;
  linkLabel?: string;
  linkHref?: Route;
  className?: string;
};

/**
 * Seção com carrossel horizontal (snap por card) de cards hero de lugares.
 * Reutilizável para "Destaques", "Onde ficar" (Estadias) e afins.
 * Oculta a seção quando não há lugares (a menos que esteja carregando).
 */
export function PlacesCarouselSection({
  title,
  icon,
  places,
  isLoading = false,
  emptyMessage = "Nenhum lugar disponível.",
  linkLabel,
  linkHref,
  className,
}: PlacesCarouselSectionProps) {
  if (!isLoading && places.length === 0) {
    return null;
  }

  return (
    <section className={cn(SECTION_GAP, className)}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          {icon ? <span className="shrink-0">{icon}</span> : null}
          <h2 className="text-foreground text-xl font-extrabold tracking-tight">
            {title}
          </h2>
        </div>
        {linkLabel && linkHref ? (
          <Link
            href={linkHref}
            className="text-primary hover:text-primary/80 flex shrink-0 items-center gap-0.5 text-sm font-semibold transition-colors"
          >
            {linkLabel}
            <ChevronRight className="size-4" />
          </Link>
        ) : null}
      </div>

      {isLoading ? (
        <div className="border-border bg-card text-muted-foreground rounded-card-lg p-card border text-sm">
          Carregando...
        </div>
      ) : (
        <div className="-mx-page-x px-page-x flex snap-x snap-mandatory scrollbar-none gap-3 overflow-x-auto">
          {places.map((place) => (
            <div key={place.id} className="w-[85%] shrink-0 snap-center">
              <HeroCard place={place} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
