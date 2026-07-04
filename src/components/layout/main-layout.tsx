import type { ReactNode } from "react";
import { Navbar } from "@/components/navigation/navbar";

export type MainLayoutProps = {
  children: ReactNode;
};

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="bg-background text-foreground min-h-dvh">
      <div className="mx-auto flex min-h-dvh w-full max-w-screen-sm flex-col">
        <main className="px-page-x py-page-y flex-1">{children}</main>
        <Navbar />
      </div>
    </div>
  );
}
