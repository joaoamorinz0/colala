import { cn } from "@/lib/utils";

export type AppBrandProps = {
  className?: string;
  compact?: boolean;
};

export function AppBrand({ className, compact = false }: AppBrandProps) {
  return (
    <div className={cn("flex flex-col items-center text-center", className)}>
      <div
        className={cn(
          "bg-primary/10 flex items-center justify-center rounded-full",
          compact ? "size-12" : "size-20",
        )}
      >
        <span className={compact ? "text-xl" : "text-3xl"}>📍</span>
      </div>
      <h1
        className={cn(
          "text-foreground mt-stack-md font-extrabold tracking-tight",
          compact ? "text-2xl" : "text-4xl",
        )}
      >
        colalá
      </h1>
      {!compact ? (
        <p className="text-muted-foreground mt-stack-xs text-base">
          Descubra lugares que combinam com você
        </p>
      ) : null}
    </div>
  );
}
