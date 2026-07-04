import type { ReactNode } from "react";
import { MainLayout } from "@/components/layout/main-layout";

export type AuthLayoutProps = {
  children: ReactNode;
};

export function AuthLayout({ children }: AuthLayoutProps) {
  return <MainLayout>{children}</MainLayout>;
}
