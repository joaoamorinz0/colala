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
          "bg-primary/8 flex items-center justify-center rounded-full",
          compact ? "size-14" : "size-24",
        )}
      >
        <span className={compact ? "text-2xl" : "text-4xl"}>📍</span>
      </div>
      <h1
        className={cn(
          "text-foreground mt-5 font-extrabold tracking-tight",
          compact ? "text-3xl" : "text-5xl",
        )}
      >
        colalá
      </h1>
      {!compact ? (
        <p className="text-muted-foreground mt-3 text-xl">
          Descubra lugares que combinam com você
        </p>
      ) : null}
    </div>
  );
}
