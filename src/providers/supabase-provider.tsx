"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { fetchProfile } from "@/services/profile.service";
import type { Profile } from "@/types/profile";
import type { SupabaseClientStatus } from "@/types/supabase";
import type { Session, User } from "@supabase/supabase-js";

type SupabaseClient = ReturnType<typeof createSupabaseBrowserClient>;

type SupabaseContextValue = {
  client: SupabaseClient | null;
  status: SupabaseClientStatus;
  session: Session | null;
  user: User | null;
  profile: Profile | null;
};

const SupabaseContext = createContext<SupabaseContextValue | null>(null);

type SupabaseProviderProps = {
  children: ReactNode;
};

export function SupabaseProvider({ children }: SupabaseProviderProps) {
  const client = useMemo<SupabaseClient | null>(
    () => createSupabaseBrowserClient(),
    [],
  );
  const queryClient = useQueryClient();
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (!client) return;

    let isMounted = true;

    function loadSession(nextSession: Session | null) {
      if (!isMounted) return;
      setSession(nextSession);
      const nextUser = nextSession?.user ?? null;
      setUser(nextUser);

      if (!nextUser) {
        setProfile(null);
        queryClient.clear();
      }
    }

    client.auth.getSession().then(async ({ data }) => {
      const nextSession = data.session ?? null;
      loadSession(nextSession);

      if (nextSession?.user) {
        const loadedProfile = await fetchProfile(client, nextSession.user.id);
        if (isMounted) {
          setProfile(loadedProfile);
        }
      }
    });

    const { data: authListener } = client.auth.onAuthStateChange(
      async (_event, nextSession) => {
        loadSession(nextSession);

        if (nextSession?.user) {
          const loadedProfile = await fetchProfile(client, nextSession.user.id);
          if (isMounted) {
            setProfile(loadedProfile);
          }
        }
      },
    );

    return () => {
      isMounted = false;
      authListener.subscription?.unsubscribe();
    };
  }, [client, queryClient]);

  const value = useMemo<SupabaseContextValue>(() => {
    return {
      client,
      status: client ? "ready" : "not-configured",
      session,
      user,
      profile,
    };
  }, [client, session, user, profile]);

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
