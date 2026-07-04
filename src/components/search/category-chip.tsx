import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type CategoryChipProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
  icon?: ReactNode;
};

export function CategoryChip({
  active = false,
  className,
  children,
  icon,
  ...props
}: CategoryChipProps) {
  return (
    <button
      className={cn(
        "inline-flex h-9 items-center gap-2 rounded-full border px-3 text-sm font-medium transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-card-foreground hover:bg-muted",
        className,
      )}
      type="button"
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
