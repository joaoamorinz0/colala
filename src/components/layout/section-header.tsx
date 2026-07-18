import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type SectionHeaderProps = {
  title: string;
  action?: ReactNode;
  description?: string;
  className?: string;
};

export function SectionHeader({
  title,
  action,
  description,
  className,
}: SectionHeaderProps) {
  return (
    <header
      className={cn("gap-stack-md flex items-start justify-between", className)}
    >
      <div className="min-w-0">
        <h2 className="text-foreground text-xl font-extrabold tracking-tight">
          {title}
        </h2>
        {description ? (
          <p className="text-muted-foreground mt-1 text-sm">{description}</p>
        ) : null}
      </div>
      {action ? (
        <div className="text-primary shrink-0 text-sm font-semibold">
          {action}
        </div>
      ) : null}
    </header>
  );
}
