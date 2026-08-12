"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

type StarRatingInputProps = {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
};

const RATING_LABELS = ["Péssimo", "Ruim", "Razoável", "Bom", "Excelente"];

export function StarRatingInput({
  value,
  onChange,
  disabled,
}: StarRatingInputProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="flex items-center gap-1.5"
        role="radiogroup"
        aria-label="Nota"
      >
        {Array.from({ length: 5 }, (_, index) => {
          const starValue = index + 1;
          const isActive = value >= starValue;

          return (
            <button
              key={starValue}
              type="button"
              role="radio"
              aria-checked={value === starValue}
              aria-label={`${starValue} estrela${starValue > 1 ? "s" : ""}`}
              disabled={disabled}
              onClick={() => onChange(starValue)}
              className={cn(
                "transition-transform active:scale-90 disabled:cursor-not-allowed disabled:opacity-50",
              )}
            >
              <Star
                className={cn(
                  "size-9 transition-colors",
                  isActive
                    ? "fill-amber-400 text-amber-400"
                    : "fill-gray-100 text-gray-300",
                )}
              />
            </button>
          );
        })}
      </div>

      {value > 0 && (
        <p className="text-sm font-semibold text-gray-700">
          {RATING_LABELS[value - 1]}
        </p>
      )}
    </div>
  );
}
