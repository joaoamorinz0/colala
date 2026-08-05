"use client";

import type { ReactNode } from "react";
import { QueryProvider } from "@/providers/query-provider";
import { SupabaseProvider } from "@/providers/supabase-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { ToastProvider } from "@/components/ui/toast";

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <SupabaseProvider>
          <ToastProvider>{children}</ToastProvider>
        </SupabaseProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
