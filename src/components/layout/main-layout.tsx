import type { ReactNode } from "react";
import { Navbar } from "@/components/navigation/navbar";

export type MainLayoutProps = {
  children: ReactNode;
};

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="bg-background text-foreground min-h-dvh">
      <div className="mx-auto flex min-h-dvh w-full max-w-screen-sm flex-col">
        <main className="flex-1 px-5 pt-10 pb-32">{children}</main>
        <Navbar />
      </div>
    </div>
  );
}
