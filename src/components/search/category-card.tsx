import type { LucideIcon } from "lucide-react";
import { CARD_SURFACE } from "@/constants/design";
import { cn } from "@/lib/utils";

export type CategoryCardProps = {
  icon: LucideIcon;
  label: string;
  className?: string;
};

export function CategoryCard({ icon, label, className }: CategoryCardProps) {
  const Icon = icon;

  return (
    <button
      className={cn(
        CARD_SURFACE,
        "px-card flex aspect-[1.55] w-full flex-col items-start justify-center text-left transition-transform active:scale-[0.98]",
        className,
      )}
      type="button"
    >
      <Icon className="text-primary size-6" />
      <span className="text-foreground mt-stack-sm text-base font-bold">
        {label}
      </span>
    </button>
  );
}
