import type { ReactNode } from "react";
import { APP_SHELL, PAGE_X } from "@/constants/design";
import { cn } from "@/lib/utils";

export type PublicLayoutProps = {
  children: ReactNode;
};

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="bg-background text-foreground min-h-dvh">
      <main
        className={cn(APP_SHELL, PAGE_X, "py-page-y flex min-h-dvh flex-col")}
      >
        {children}
      </main>
    </div>
  );
}
