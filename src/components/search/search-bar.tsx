import { Search } from "lucide-react";
import type { InputHTMLAttributes } from "react";
import { CONTROL_HEIGHT } from "@/constants/design";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type SearchBarProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> & {
  wrapperClassName?: string;
};

export function SearchBar({
  className,
  wrapperClassName,
  ...props
}: SearchBarProps) {
  return (
    <div className={cn("relative w-full", wrapperClassName)}>
      <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2" />
      <Input
        className={cn(
          CONTROL_HEIGHT,
          "bg-card rounded-control border-border shadow-card pl-11 text-base",
          className,
        )}
        type="search"
        {...props}
      />
    </div>
  );
}
