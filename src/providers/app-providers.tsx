"use client";

import type { ReactNode } from "react";
import { QueryProvider } from "@/providers/query-provider";
import { SupabaseProvider } from "@/providers/supabase-provider";
import { ThemeProvider } from "@/providers/theme-provider";

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider>
      <SupabaseProvider>
        <QueryProvider>{children}</QueryProvider>
      </SupabaseProvider>
    </ThemeProvider>
  );
}
