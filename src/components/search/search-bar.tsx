import { Search } from "lucide-react";
import type { InputHTMLAttributes } from "react";
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
    <div className={cn("relative", wrapperClassName)}>
      <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
      <Input className={cn("pl-9", className)} type="search" {...props} />
    </div>
  );
}
