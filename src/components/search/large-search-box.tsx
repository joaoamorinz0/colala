import { SlidersHorizontal, Search } from "lucide-react";
import { CONTROL_HEIGHT } from "@/constants/design";
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
        CONTROL_HEIGHT,
        "border-border bg-card shadow-card gap-stack-md rounded-control px-card flex w-full items-center border",
        className,
      )}
    >
      <Search className="text-muted-foreground size-5 shrink-0" />
      <span className="text-muted-foreground min-w-0 flex-1 truncate text-base">
        {placeholder}
      </span>
      {showFilter ? (
        <SlidersHorizontal className="text-primary size-5 shrink-0" />
      ) : null}
    </div>
  );
}
