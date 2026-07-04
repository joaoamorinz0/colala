import type { ReactNode } from "react";
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
        "border-border bg-card flex min-h-48 flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center",
        className,
      )}
    >
      <h2 className="text-card-foreground text-base font-semibold">{title}</h2>
      {description ? (
        <p className="text-muted-foreground mt-2 max-w-xs text-sm">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
