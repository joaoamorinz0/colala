import { ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
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
    <section className={cn("space-y-5", className)}>
      <h2 className="text-muted-foreground text-xl font-semibold tracking-[0.18em] uppercase">
        {title}
      </h2>
      <div className="border-border bg-card shadow-card overflow-hidden rounded-3xl border">
        {items.map((item, index) => {
          const Icon = item.icon;

          return (
            <button
              className={cn(
                "text-foreground flex h-24 w-full items-center gap-5 px-7 text-left text-xl font-semibold",
                index > 0 && "border-border border-t",
              )}
              key={item.label}
              type="button"
            >
              <span className="bg-background text-foreground shadow-card flex size-14 items-center justify-center rounded-2xl">
                <Icon className="size-7" />
              </span>
              <span className="flex-1">{item.label}</span>
              <ChevronRight className="text-muted-foreground/45 size-6" />
            </button>
          );
        })}
      </div>
    </section>
  );
}
