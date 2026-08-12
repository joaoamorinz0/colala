import { ArrowRight, SlidersHorizontal, Search } from "lucide-react";
import { CONTROL_HEIGHT } from "@/constants/design";
import { cn } from "@/lib/utils";

export type LargeSearchBoxProps = {
  placeholder?: string;
  showFilter?: boolean;
  name?: string;
  defaultValue?: string;
  className?: string;
};

export function LargeSearchBox({
  placeholder = "Cafés, bares, restaurantes...",
  showFilter = false,
  name = "q",
  defaultValue = "",
  className,
}: LargeSearchBoxProps) {
  return (
    <form
      action="/search"
      method="GET"
      className={cn(
        CONTROL_HEIGHT,
        "border-border bg-card shadow-card gap-stack-md rounded-control px-card flex w-full items-center border",
        className,
      )}
    >
      <Search className="text-muted-foreground size-5 shrink-0" />
      <input
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        autoComplete="off"
        aria-label="Buscar lugares"
        className="text-foreground placeholder:text-muted-foreground min-w-0 flex-1 bg-transparent text-base focus:outline-none"
      />
      {showFilter ? (
        <SlidersHorizontal className="text-primary size-5 shrink-0" />
      ) : null}
      <button
        type="submit"
        aria-label="Buscar"
        className="text-primary hover:text-primary/80 shrink-0 transition-colors"
      >
        <ArrowRight className="size-5" />
      </button>
    </form>
  );
}
