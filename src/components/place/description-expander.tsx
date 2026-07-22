"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

type DescriptionExpanderProps = {
  text: string;
  maxLines?: number;
};

export function DescriptionExpander({
  text,
  maxLines = 4,
}: DescriptionExpanderProps) {
  const [expanded, setExpanded] = useState(false);

  // Estimate if text is likely to overflow 4 lines (approx 320 chars for 4 lines at 390px)
  const isLong = text.length > 280;

  return (
    <div>
      <p
        className="text-muted-foreground text-base leading-relaxed transition-all"
        style={
          !expanded && isLong
            ? {
                display: "-webkit-box",
                WebkitLineClamp: maxLines,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }
            : undefined
        }
      >
        {text}
      </p>

      {isLong && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-primary mt-2 flex items-center gap-1 text-sm font-semibold transition-opacity hover:opacity-70"
          type="button"
        >
          {expanded ? (
            <>
              <ChevronUp className="size-4" />
              Ver menos
            </>
          ) : (
            <>
              <ChevronDown className="size-4" />
              Ler mais
            </>
          )}
        </button>
      )}
    </div>
  );
}
