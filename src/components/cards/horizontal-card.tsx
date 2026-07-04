import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type HorizontalCardProps = {
  title: string;
  description?: string;
  media?: ReactNode;
  trailing?: ReactNode;
  className?: string;
};

export function HorizontalCard({
  title,
  description,
  media,
  trailing,
  className,
}: HorizontalCardProps) {
  return (
    <article
      className={cn(
        "flex items-center gap-3 rounded-lg border border-border bg-card p-3 shadow-card",
        className,
      )}
    >
      {media ? (
        <div className="size-20 shrink-0 overflow-hidden rounded-md bg-muted">
          {media}
        </div>
      ) : null}
      <div className="min-w-0 flex-1">
        <h3 className="line-clamp-1 text-base font-semibold text-card-foreground">
          {title}
        </h3>
        {description ? (
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {trailing ? <div className="shrink-0">{trailing}</div> : null}
    </article>
  );
}
