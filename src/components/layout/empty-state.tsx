import type { ComponentType, ReactNode } from "react";
import { CARD_SURFACE } from "@/constants/design";
import { cn } from "@/lib/utils";

export type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  /** Componente de ícone (ex.: lucide Heart) exibido em círculo suave. */
  icon?: ComponentType<{ className?: string }>;
  className?: string;
};

export function EmptyState({
  title,
  description,
  action,
  icon: Icon,
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
      {Icon ? (
        <div className="bg-muted mb-stack-md flex size-14 items-center justify-center rounded-full">
          <Icon className="text-muted-foreground size-6" />
        </div>
      ) : null}
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
