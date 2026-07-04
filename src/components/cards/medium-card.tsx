import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type MediumCardProps = {
  title: string;
  description?: string;
  media?: ReactNode;
  metadata?: ReactNode;
  className?: string;
};

export function MediumCard({
  title,
  description,
  media,
  metadata,
  className,
}: MediumCardProps) {
  return (
    <article
      className={cn(
        "overflow-hidden rounded-lg border border-border bg-card shadow-card",
        className,
      )}
    >
      {media ? <div className="aspect-[4/3] bg-muted">{media}</div> : null}
      <div className="p-3">
        <h3 className="line-clamp-1 text-base font-semibold text-card-foreground">
          {title}
        </h3>
        {description ? (
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {description}
          </p>
        ) : null}
        {metadata ? <div className="mt-3">{metadata}</div> : null}
      </div>
    </article>
  );
}
