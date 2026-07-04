import type { ReactNode } from "react";

export type PublicLayoutProps = {
  children: ReactNode;
};

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="bg-background text-foreground min-h-dvh">
      <main className="px-page-x py-page-y mx-auto flex min-h-dvh w-full max-w-screen-sm flex-col">
        {children}
      </main>
    </div>
  );
}
