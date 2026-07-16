import type { LucideIcon } from "lucide-react";
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
        "border-border bg-card shadow-card flex aspect-[1.65] flex-col items-start justify-center rounded-3xl border px-7 text-left transition-transform active:scale-[0.98]",
        className,
      )}
      type="button"
    >
      <Icon className="text-primary size-8" />
      <span className="text-foreground mt-5 text-2xl font-bold">{label}</span>
    </button>
  );
}
