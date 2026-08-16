import type { ReactNode } from "react";
import { Navbar } from "@/components/navigation/navbar";
import { PageTransition } from "@/components/layout/page-transition";
import { APP_SHELL, MAIN_PADDING } from "@/constants/design";
import { cn } from "@/lib/utils";

export type MainLayoutProps = {
  children: ReactNode;
};

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="bg-background text-foreground min-h-dvh">
      <div className={cn(APP_SHELL, "flex min-h-dvh flex-col")}>
        <main className={cn("flex-1", MAIN_PADDING)}>
          <PageTransition>{children}</PageTransition>
        </main>
        <Navbar />
      </div>
    </div>
  );
}
