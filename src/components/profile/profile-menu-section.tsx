import { ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { CARD_SURFACE } from "@/constants/design";
import { cn } from "@/lib/utils";

export type ProfileMenuItem = {
  icon: LucideIcon;
  label: string;
};

export type ProfileMenuSectionProps = {
  title: string;
  items: ProfileMenuItem[];
  className?: string;
};

export function ProfileMenuSection({
  title,
  items,
  className,
}: ProfileMenuSectionProps) {
  return (
    <section className={cn("space-y-stack-md", className)}>
      <h2 className="text-muted-foreground text-xs font-semibold tracking-[0.14em] uppercase">
        {title}
      </h2>
      <div className={cn(CARD_SURFACE)}>
        {items.map((item, index) => {
          const Icon = item.icon;

          return (
            <button
              className={cn(
                "text-foreground gap-stack-md px-card flex h-14 w-full items-center text-left text-base font-semibold",
                index > 0 && "border-border border-t",
              )}
              key={item.label}
              type="button"
            >
              <span className="bg-muted text-foreground flex size-9 items-center justify-center rounded-lg">
                <Icon className="size-4" />
              </span>
              <span className="flex-1">{item.label}</span>
              <ChevronRight className="text-muted-foreground/50 size-5" />
            </button>
          );
        })}
      </div>
    </section>
  );
}
