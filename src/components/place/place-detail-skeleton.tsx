import { APP_SHELL } from "@/constants/design";
import { cn } from "@/lib/utils";

export function PlaceDetailSkeleton() {
  return (
    <div className={cn(APP_SHELL, "bg-background min-h-dvh")}>
      {/* Hero skeleton */}
      <div className="relative h-[45vh] min-h-[260px] w-full animate-pulse bg-gray-200" />

      {/* Content skeleton */}
      <div className="space-y-6 px-5 pt-6 pb-36">
        {/* Category chip */}
        <div className="h-6 w-24 animate-pulse rounded-full bg-gray-200" />

        {/* Name */}
        <div className="space-y-2">
          <div className="h-8 w-4/5 animate-pulse rounded-lg bg-gray-200" />
          <div className="h-6 w-3/5 animate-pulse rounded-lg bg-gray-200" />
        </div>

        {/* Meta row */}
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-8 w-20 animate-pulse rounded-full bg-gray-200"
            />
          ))}
        </div>

        {/* Chips */}
        <div className="flex gap-2">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-9 w-32 animate-pulse rounded-full bg-gray-200"
            />
          ))}
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-100" />

        {/* Description */}
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={cn(
                "h-4 animate-pulse rounded bg-gray-200",
                i === 4 ? "w-2/3" : "w-full",
              )}
            />
          ))}
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-100" />

        {/* Info rows */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="size-9 shrink-0 animate-pulse rounded-xl bg-gray-200" />
              <div className="h-4 flex-1 animate-pulse rounded bg-gray-200" />
            </div>
          ))}
        </div>

        {/* Gallery */}
        <div className="h-px bg-gray-100" />
        <div className="flex gap-3 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-36 w-40 shrink-0 animate-pulse rounded-2xl bg-gray-200"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
