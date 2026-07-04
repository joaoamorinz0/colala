import type { ReactNode } from "react";
import { Navbar } from "@/components/navigation/navbar";

export type MainLayoutProps = {
  children: ReactNode;
};

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto flex min-h-dvh w-full max-w-screen-sm flex-col">
        <main className="flex-1 px-page-x py-page-y">{children}</main>
        <Navbar />
      </div>
    </div>
  );
}
