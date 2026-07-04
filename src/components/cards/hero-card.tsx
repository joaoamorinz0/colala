import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type HeroCardProps = {
  title: string;
  description?: string;
  media?: ReactNode;
  action?: ReactNode;
  className?: string;
};

export function HeroCard({
  title,
  description,
  media,
  action,
  className,
}: HeroCardProps) {
  return (
    <article
      className={cn(
        "border-border bg-card shadow-card overflow-hidden rounded-lg border",
        className,
      )}
    >
      {media ? <div className="bg-muted aspect-[16/10]">{media}</div> : null}
      <div className="p-4">
        <h2 className="text-card-foreground text-xl font-semibold">{title}</h2>
        {description ? (
          <p className="text-muted-foreground mt-2 text-sm">{description}</p>
        ) : null}
        {action ? <div className="mt-4">{action}</div> : null}
      </div>
    </article>
  );
}
