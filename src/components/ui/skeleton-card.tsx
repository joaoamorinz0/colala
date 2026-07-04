import { cn } from "@/lib/utils";

export type SkeletonCardProps = {
  className?: string;
  lines?: number;
};

export function SkeletonCard({ className, lines = 2 }: SkeletonCardProps) {
  return (
    <div
      className={cn(
        "border-border bg-card shadow-card animate-pulse rounded-lg border p-4",
        className,
      )}
    >
      <div className="bg-muted h-32 rounded-md" />
      <div className="mt-4 space-y-2">
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
