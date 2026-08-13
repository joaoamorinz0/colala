import type { ReactNode } from "react";
import { Heart, MapPin, MessageSquare } from "lucide-react";
import { CARD_SURFACE } from "@/constants/design";
import { cn } from "@/lib/utils";
import type { ProfileStats } from "@/services/profile.service";

export type ProfileStatsCardProps = {
  stats: ProfileStats;
  className?: string;
};

type StatItemProps = {
  icon: ReactNode;
  value: number;
  label: string;
};

function formatCount(value: number) {
  return value.toLocaleString("pt-BR");
}

function StatItem({ icon, value, label }: StatItemProps) {
  return (
    <div className="flex flex-col items-center gap-1 px-2 py-3">
      {icon}
      <p className="text-foreground text-lg leading-none font-extrabold">
        {formatCount(value)}
      </p>
      <p className="text-muted-foreground text-center text-[11px] leading-tight">
        {label}
      </p>
    </div>
  );
}

/**
 * Card de estatísticas do perfil em 3 colunas com divisores verticais.
 */
export function ProfileStatsCard({ stats, className }: ProfileStatsCardProps) {
  return (
    <section
      className={cn(
        CARD_SURFACE,
        "grid grid-cols-3 divide-x border",
        className,
      )}
      aria-label="Estatísticas do perfil"
    >
      <StatItem
        icon={<MapPin className="text-secondary size-5" />}
        value={stats.visitedPlaceCount}
        label="Lugares visitados"
      />
      <StatItem
        icon={<Heart className="size-5 fill-rose-400 text-rose-400" />}
        value={stats.favoritesCount}
        label="Favoritos"
      />
      <StatItem
        icon={<MessageSquare className="text-primary size-5" />}
        value={stats.reviewCount}
        label="Avaliações"
      />
    </section>
  );
}
