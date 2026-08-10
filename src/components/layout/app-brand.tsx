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
          "relative flex items-center justify-center",
          compact ? "size-14" : "xs:size-28 size-24",
        )}
      >
        <Image
          src="/icons/logo.png"
          alt="Colalá"
          width={compact ? 56 : 112}
          height={compact ? 56 : 112}
          priority
          className="size-full rounded-full object-cover shadow-[0_4px_16px_-4px_rgba(0,0,0,0.15)]"
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
        <p className="text-muted-foreground/80 mt-stack-xs xs:text-base max-w-[26ch] text-sm leading-snug">
          Descubra lugares pelas pessoas, não pelo algoritmo.
        </p>
      ) : null}
    </div>
  );
}
