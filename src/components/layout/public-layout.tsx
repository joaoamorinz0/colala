import type { ReactNode } from "react";

export type PublicLayoutProps = {
  children: ReactNode;
};

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <main className="mx-auto flex min-h-dvh w-full max-w-screen-sm flex-col px-page-x py-page-y">
        {children}
      </main>
    </div>
  );
}
