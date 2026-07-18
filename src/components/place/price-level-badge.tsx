import { cn } from "@/lib/utils";

export type PriceLevelBadgeProps = {
  level: number;
  className?: string;
};

export function PriceLevelBadge({ level, className }: PriceLevelBadgeProps) {
  return (
    <span
      className={cn(
        "bg-primary/10 text-primary inline-flex shrink-0 items-center gap-0.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        className,
      )}
    >
      {Array.from({ length: Math.min(Math.max(level, 1), 4) }, (_, i) => (
        <span key={i}>$</span>
      ))}
    </span>
  );
}
