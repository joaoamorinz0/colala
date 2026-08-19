import { Coffee, Wifi, Dog, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export type AttributeBadgesProps = {
  workFriendly?: boolean | null;
  petFriendly?: boolean | null;
  wifi?: boolean | null;
  acceptsBookClub?: boolean | null;
  className?: string;
};

type Badge = {
  label: string;
  icon: React.ElementType;
};

const BADGES: Array<
  Badge & {
    field: keyof Pick<
      AttributeBadgesProps,
      "workFriendly" | "petFriendly" | "wifi" | "acceptsBookClub"
    >;
  }
> = [
  { field: "workFriendly", label: "Work friendly", icon: Coffee },
  { field: "petFriendly", label: "Pet friendly", icon: Dog },
  { field: "wifi", label: "Wi-Fi", icon: Wifi },
  { field: "acceptsBookClub", label: "Aceita clube do livro", icon: BookOpen },
];

/**
 * Exibe badges discretos para atributos booleanos ativos (true).
 * Omite badges quando o valor é false/null/undefined.
 */
export function AttributeBadges({
  workFriendly,
  petFriendly,
  wifi,
  acceptsBookClub,
  className,
}: AttributeBadgesProps) {
  const values = { workFriendly, petFriendly, wifi, acceptsBookClub };

  const activeBadges = BADGES.filter((badge) => values[badge.field] === true);

  if (activeBadges.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {activeBadges.map((badge) => {
        const Icon = badge.icon;
        return (
          <span
            key={badge.label}
            className="border-border bg-muted text-muted-foreground inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium"
          >
            <Icon className="size-3" />
            {badge.label}
          </span>
        );
      })}
    </div>
  );
}
