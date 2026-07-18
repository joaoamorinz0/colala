import type { ReactNode } from "react";
import { CARD_SURFACE } from "@/constants/design";
import { cn } from "@/lib/utils";

export type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        CARD_SURFACE,
        "p-card flex min-h-48 flex-col items-center justify-center border-dashed text-center",
        className,
      )}
    >
      <h2 className="text-card-foreground text-base font-semibold">{title}</h2>
      {description ? (
        <p className="text-muted-foreground mt-stack-xs max-w-xs text-sm leading-relaxed">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-stack-md">{action}</div> : null}
    </div>
  );
}
