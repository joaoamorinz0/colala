import type { ReactNode } from "react";
import { Navbar } from "@/components/navigation/navbar";

export type MainLayoutProps = {
  children: ReactNode;
};

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="bg-background text-foreground min-h-dvh">
      <div className="mx-auto flex min-h-dvh w-full max-w-screen-sm flex-col">
        <main className="flex-1 overflow-y-auto" style={{
          paddingLeft: "var(--spacing-page-x)",
          paddingRight: "var(--spacing-page-x)",
          paddingTop: "var(--spacing-page-y)",
          paddingBottom: "clamp(7rem, 20vw, 9rem)",
        }}>
          {children}
        </main>
        <Navbar />
      </div>
    </div>
  );
}
