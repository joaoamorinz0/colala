import { SlidersHorizontal, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export type LargeSearchBoxProps = {
  placeholder?: string;
  showFilter?: boolean;
  className?: string;
};

export function LargeSearchBox({
  placeholder = "Cafés, bares, restaurantes...",
  showFilter = false,
  className,
}: LargeSearchBoxProps) {
  return (
    <div
      className={cn(
        "border-border bg-card flex h-16 items-center gap-4 rounded-3xl border px-5 shadow-[inset_0_1px_0_hsl(0_0%_100%/0.8)]",
        className,
      )}
    >
      <Search className="text-muted-foreground size-7 shrink-0" />
      <span className="text-muted-foreground min-w-0 flex-1 truncate text-xl">
        {placeholder}
      </span>
      {showFilter ? (
        <SlidersHorizontal className="text-primary size-6 shrink-0" />
      ) : null}
    </div>
  );
}
