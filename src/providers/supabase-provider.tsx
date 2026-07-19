"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import type { SupabaseClientStatus } from "@/types/supabase";
import type { Session, User } from "@supabase/supabase-js";

type SupabaseClient = ReturnType<typeof createSupabaseBrowserClient>;

type SupabaseContextValue = {
  client: SupabaseClient | null;
  status: SupabaseClientStatus;
  session: Session | null;
  user: User | null;
};

const SupabaseContext = createContext<SupabaseContextValue | null>(null);

type SupabaseProviderProps = {
  children: ReactNode;
};

export function SupabaseProvider({ children }: SupabaseProviderProps) {
  const client = useMemo<SupabaseClient | null>(() => createSupabaseBrowserClient(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!client) return;

    client.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
    });

    const { data: authListener } = client.auth.onAuthStateChange(
      (_event, nextSession) => {
        setSession(nextSession);
        setUser(nextSession?.user ?? null);
      },
    );

    return () => {
      authListener.subscription?.unsubscribe();
    };
  }, [client]);

  const value = useMemo<SupabaseContextValue>(() => {
    return {
      client,
      status: client ? "ready" : "not-configured",
      session,
      user,
    };
  }, [client, session, user]);

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
