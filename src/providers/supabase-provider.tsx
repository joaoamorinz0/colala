"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import type { SupabaseClientStatus } from "@/types/supabase";

type SupabaseClient = ReturnType<typeof createSupabaseBrowserClient>;

type SupabaseContextValue = {
  client: SupabaseClient;
  status: SupabaseClientStatus;
};

const SupabaseContext = createContext<SupabaseContextValue | null>(null);

type SupabaseProviderProps = {
  children: ReactNode;
};

export function SupabaseProvider({ children }: SupabaseProviderProps) {
  const value = useMemo<SupabaseContextValue>(() => {
    const client = createSupabaseBrowserClient();

    return {
      client,
      status: client ? "ready" : "not-configured",
    };
  }, []);

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
}

export function useSupabase() {
  const context = useContext(SupabaseContext);

  if (!context) {
    throw new Error("useSupabase must be used within SupabaseProvider.");
  }

  return context;
}
