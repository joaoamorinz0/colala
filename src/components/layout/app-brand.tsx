import Image from "next/image";
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
          "bg-primary/10 ring-primary/15 relative flex items-center justify-center rounded-full ring-1",
          compact ? "size-12" : "xs:size-20 size-16",
        )}
      >
        <Image
          src="/icons/icon-512.png"
          alt="Colalá"
          width={compact ? 28 : 44}
          height={compact ? 28 : 44}
          priority
          className={cn(
            "rounded-full object-contain",
            compact ? "size-7" : "xs:size-11 size-9",
          )}
        />
      </div>
      <h1
        className={cn(
          "text-foreground mt-stack-md font-extrabold tracking-tight",
          compact ? "text-xl" : "xs:text-4xl text-3xl",
        )}
      >
        Colalá
      </h1>
      {!compact ? (
        <p className="text-muted-foreground mt-stack-xs xs:text-base max-w-[26ch] text-sm leading-snug">
          Descubra lugares pelas pessoas, não pelo algoritmo.
        </p>
      ) : null}
    </div>
  );
}
