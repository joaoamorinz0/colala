"use client";

import { usePathname } from "next/navigation";
import {
  useLayoutEffect,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

/**
 * useLayoutEffect no cliente evita flash (a classe de animação é aplicada
 * antes do primeiro paint). No servidor/SSR cai para useEffect.
 */
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

type PageTransitionProps = {
  children: ReactNode;
};

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const isFirstRender = useRef(true);
  const [isAnimating, setIsAnimating] = useState(false);

  useIsomorphicLayoutEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    setIsAnimating(true);
    const timeout = window.setTimeout(() => setIsAnimating(false), 200);

    return () => window.clearTimeout(timeout);
  }, [pathname]);

  return (
    <div
      key={pathname}
      className={isAnimating ? "animate-page-enter" : undefined}
    >
      {children}
    </div>
  );
}
