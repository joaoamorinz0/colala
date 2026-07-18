import type { ReactNode } from "react";
import {
  CARD_SURFACE,
  MEDIA_COVER,
  MEDIUM_CARD_WIDTH,
} from "@/constants/design";
import { cn } from "@/lib/utils";

export type MediumCardProps = {
  title: string;
  description?: string;
  media?: ReactNode;
  metadata?: ReactNode;
  className?: string;
};

/**
 * Fixed-width medium card for horizontal carousels.
 * Width is locked via `w-medium-card` so cards never stretch.
 */
export function MediumCard({
  title,
  description,
  media,
  metadata,
  className,
}: MediumCardProps) {
  return (
    <article className={cn(CARD_SURFACE, MEDIUM_CARD_WIDTH, className)}>
      {media ? (
        <div className="bg-muted aspect-[4/3] w-full overflow-hidden">
          <div className={MEDIA_COVER}>{media}</div>
        </div>
      ) : null}
      <div className="space-y-stack-xs p-card-sm">
        <h3 className="text-card-foreground line-clamp-1 text-sm font-semibold">
          {title}
        </h3>
        {description ? (
          <p className="text-muted-foreground line-clamp-2 text-xs leading-relaxed">
            {description}
          </p>
        ) : null}
        {metadata ? <div className="pt-0.5">{metadata}</div> : null}
      </div>
    </article>
  );
}
