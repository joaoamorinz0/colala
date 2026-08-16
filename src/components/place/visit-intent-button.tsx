"use client";

import { CalendarCheck2, MapPinPlus } from "lucide-react";
import { useVisitIntent } from "@/features/places/hooks/use-visit-intent";
import { usePopFeedback } from "@/hooks";
import { cn } from "@/lib/utils";

type VisitIntentButtonProps = {
  placeId: string;
  className?: string;
};

export function VisitIntentButton({
  placeId,
  className,
}: VisitIntentButtonProps) {
  const { isActive, toggle, isToggling } = useVisitIntent(placeId);
  const { isPopping, triggerPop } = usePopFeedback();

  return (
    <button
      id="place-visit-intent-btn"
      type="button"
      onClick={() => {
        triggerPop();
        toggle();
      }}
      disabled={isToggling}
      aria-pressed={isActive}
      aria-label={
        isActive
          ? "Remover dos planos (quero ir)"
          : "Adicionar aos planos (quero ir)"
      }
      className={cn(
        "flex flex-1 items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold transition-all active:scale-[0.98] disabled:opacity-60",
        isActive
          ? "bg-primary text-white shadow-[0_8px_20px_-6px_rgba(217,119,87,0.55)]"
          : "border border-gray-200 bg-white text-gray-800 shadow-sm",
        className,
      )}
    >
      {isActive ? (
        <CalendarCheck2
          key="active"
          className={cn("size-5 fill-white/20", isPopping && "animate-pop")}
        />
      ) : (
        <MapPinPlus
          key="inactive"
          className={cn("size-5", isPopping && "animate-pop")}
        />
      )}
      {isActive ? "Na minha lista" : "Quero ir"}
    </button>
  );
}
