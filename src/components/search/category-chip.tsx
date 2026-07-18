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
        "inline-flex h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors",
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
