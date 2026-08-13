import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Place } from "@/types/place";
import { RecentPlaceCard } from "./recent-place-card";

export type RecentPlacesSectionProps = {
  places: Place[];
  /** Username para montar o link ao perfil público (ex: /profile/username). */
  username: string | null;
  className?: string;
};

/**
 * Seção "Últimos lugares" do perfil: lista os places mais
 * recentemente avaliados pelo usuário, com link "Ver todos".
 */
export function RecentPlacesSection({
  places,
  username,
  className,
}: RecentPlacesSectionProps) {
  if (places.length === 0) {
    return null;
  }

  return (
    <section className={cn(className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-foreground text-lg font-bold tracking-tight">
          Últimos lugares
        </h2>
        <Link
          href={username ? `/profile/${username}` : "/profile"}
          className="text-primary hover:text-primary/80 inline-flex items-center gap-0.5 text-sm font-semibold"
        >
          Ver todos
          <ChevronRight className="size-4" />
        </Link>
      </div>

      <div className="mt-stack-sm space-y-3">
        {places.map((place) => (
          <RecentPlaceCard key={place.id} place={place} />
        ))}
      </div>
    </section>
  );
}
