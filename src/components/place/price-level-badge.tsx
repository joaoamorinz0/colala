import { cn } from "@/lib/utils";

export function PriceLevelBadge({ level, className }: { level: number; className?: string }) {
  return (
    <span className={cn(
      "inline-flex items-center gap-0.5 bg-primary/10 text-primary rounded-full px-2 py-1 text-xs sm:text-sm font-semibold shrink-0",
      className,
    )}>
      {Array.from({ length: Math.min(Math.max(level, 1), 4) }, (_, i) => (
        <span key={i}>$</span>
      ))}
    </span>
  );
}
