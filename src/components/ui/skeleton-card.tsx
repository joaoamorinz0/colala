import { cn } from "@/lib/utils";

export type SkeletonCardProps = {
  className?: string;
  lines?: number;
};

export function SkeletonCard({ className, lines = 2 }: SkeletonCardProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg border border-border bg-card p-4 shadow-card",
        className,
      )}
    >
      <div className="h-32 rounded-md bg-muted" />
      <div className="mt-4 space-y-2">
        {Array.from({ length: lines }).map((_, index) => (
          <div
            className="h-3 rounded-full bg-muted"
            key={`skeleton-line-${index}`}
            style={{ width: `${100 - index * 18}%` }}
          />
        ))}
      </div>
    </div>
  );
}
