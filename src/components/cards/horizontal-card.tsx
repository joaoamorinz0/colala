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
        "border-border bg-card shadow-card flex items-center gap-3 rounded-lg border p-3",
        className,
      )}
    >
      {media ? (
        <div className="bg-muted size-20 shrink-0 overflow-hidden rounded-md">
          {media}
        </div>
      ) : null}
      <div className="min-w-0 flex-1">
        <h3 className="text-card-foreground line-clamp-1 text-base font-semibold">
          {title}
        </h3>
        {description ? (
          <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">
            {description}
          </p>
        ) : null}
      </div>
      {trailing ? <div className="shrink-0">{trailing}</div> : null}
    </article>
  );
}
