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
        "border-border bg-card shadow-card overflow-hidden rounded-lg border",
        className,
      )}
    >
      {media ? <div className="bg-muted aspect-[4/3]">{media}</div> : null}
      <div className="p-3">
        <h3 className="text-card-foreground line-clamp-1 text-base font-semibold">
          {title}
        </h3>
        {description ? (
          <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">
            {description}
          </p>
        ) : null}
        {metadata ? <div className="mt-3">{metadata}</div> : null}
      </div>
    </article>
  );
}
