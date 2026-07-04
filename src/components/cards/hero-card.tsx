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
        "overflow-hidden rounded-lg border border-border bg-card shadow-card",
        className,
      )}
    >
      {media ? <div className="aspect-[16/10] bg-muted">{media}</div> : null}
      <div className="p-4">
        <h2 className="text-xl font-semibold text-card-foreground">{title}</h2>
        {description ? (
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        ) : null}
        {action ? <div className="mt-4">{action}</div> : null}
      </div>
    </article>
  );
}
