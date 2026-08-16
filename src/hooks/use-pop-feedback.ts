"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Feedback visual "pop" (escala) para botões de toggle.
 * Reexecuta a animação a cada `triggerPop()` e limpa o timer
 * no unmount — evita vazamento e sobreposição de timeouts.
 */
export function usePopFeedback(durationMs = 300) {
  const [isPopping, setIsPopping] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  const triggerPop = () => {
    setIsPopping(true);
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = window.setTimeout(
      () => setIsPopping(false),
      durationMs,
    );
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { isPopping, triggerPop };
}
