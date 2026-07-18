import type { ReactNode } from "react";
import { CARD_SURFACE_LG, MEDIA_COVER } from "@/constants/design";
import { cn } from "@/lib/utils";

export type HeroCardProps = {
  title: string;
  description?: string;
  media?: ReactNode;
  action?: ReactNode;
  className?: string;
};

/**
 * Full-width hero card (nearly 100% of the app column).
 * Use for featured content on Home and similar surfaces.
 */
export function HeroCard({
  title,
  description,
  media,
  action,
  className,
}: HeroCardProps) {
  return (
    <article className={cn(CARD_SURFACE_LG, "w-full", className)}>
      {media ? (
        <div className="bg-muted aspect-[16/10] w-full overflow-hidden">
          <div className={MEDIA_COVER}>{media}</div>
        </div>
      ) : null}
      <div className="space-y-stack-xs p-card">
        <h2 className="text-card-foreground text-xl leading-snug font-bold tracking-tight">
          {title}
        </h2>
        {description ? (
          <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed">
            {description}
          </p>
        ) : null}
        {action ? <div className="pt-stack-xs">{action}</div> : null}
      </div>
    </article>
  );
}
