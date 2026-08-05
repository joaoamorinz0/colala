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
import { createProfile, fetchProfile } from "@/services/profile.service";
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
  isLoading: boolean;
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!client) return;

    const supabase = client;

    let isMounted = true;
    let profileLoadToken = 0;

    async function loadProfile(nextUser: User) {
      const token = ++profileLoadToken;

      let loadedProfile = await fetchProfile(supabase, nextUser.id);

      if (!loadedProfile) {
        loadedProfile = await createProfile(supabase, nextUser.id, {
          name:
            nextUser.user_metadata?.full_name ??
            nextUser.user_metadata?.name ??
            nextUser.email?.split("@")[0] ??
            null,
          username: nextUser.email?.split("@")[0] ?? null,
          avatar_url: nextUser.user_metadata?.avatar_url ?? null,
          bio: null,
        });
      }

      if (isMounted && token === profileLoadToken) {
        setProfile(loadedProfile);
        queryClient.setQueryData(["profile", nextUser.id], loadedProfile);
      }
    }

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

    supabase.auth.getSession().then(async ({ data }) => {
      const nextSession = data.session ?? null;
      loadSession(nextSession);

      if (nextSession?.user) {
        await loadProfile(nextSession.user);
      }

      if (isMounted) {
        setIsLoading(false);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, nextSession) => {
        loadSession(nextSession);

        if (nextSession?.user) {
          await loadProfile(nextSession.user);
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
      isLoading,
    };
  }, [client, session, user, profile, isLoading]);

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
