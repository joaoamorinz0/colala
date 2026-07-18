import { CARD_SURFACE } from "@/constants/design";
import { cn } from "@/lib/utils";

export type SkeletonCardProps = {
  className?: string;
  lines?: number;
};

export function SkeletonCard({ className, lines = 2 }: SkeletonCardProps) {
  return (
    <div className={cn(CARD_SURFACE, "p-card animate-pulse", className)}>
      <div className="bg-muted aspect-[16/10] w-full rounded-md" />
      <div className="mt-stack-md space-y-stack-xs">
        {Array.from({ length: lines }).map((_, index) => (
          <div
            className="bg-muted h-3 rounded-full"
            key={`skeleton-line-${index}`}
            style={{ width: `${100 - index * 18}%` }}
          />
        ))}
      </div>
    </div>
  );
}
