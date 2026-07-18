import type { ReactNode } from "react";
import {
  CARD_SURFACE,
  HORIZONTAL_CARD_HEIGHT,
  MEDIA_COVER,
} from "@/constants/design";
import { cn } from "@/lib/utils";

export type HorizontalCardProps = {
  title: string;
  description?: string;
  media?: ReactNode;
  trailing?: ReactNode;
  className?: string;
};

/**
 * Horizontal list row with fixed height and square thumbnail.
 * Keeps consistent alignment across favorites and result lists.
 */
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
        CARD_SURFACE,
        HORIZONTAL_CARD_HEIGHT,
        "gap-stack-md p-card-sm flex w-full items-center",
        className,
      )}
    >
      {media ? (
        <div className="bg-muted size-[4.75rem] shrink-0 overflow-hidden rounded-md">
          <div className={MEDIA_COVER}>{media}</div>
        </div>
      ) : null}
      <div className="min-w-0 flex-1">
        <h3 className="text-card-foreground line-clamp-1 text-sm font-semibold">
          {title}
        </h3>
        {description ? (
          <p className="text-muted-foreground mt-0.5 line-clamp-2 text-xs leading-relaxed">
            {description}
          </p>
        ) : null}
      </div>
      {trailing ? <div className="shrink-0">{trailing}</div> : null}
    </article>
  );
}
