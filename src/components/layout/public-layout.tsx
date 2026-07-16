import type { ReactNode } from "react";

export type PublicLayoutProps = {
  children: ReactNode;
};

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="bg-background text-foreground min-h-dvh">
      <main className="mx-auto flex min-h-dvh w-full max-w-screen-sm flex-col px-5 py-10">
        {children}
      </main>
    </div>
  );
}
