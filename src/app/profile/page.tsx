"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { LogOut, MapPin, PenLine } from "lucide-react";
import { AuthLayout } from "@/components/layout";
import {
  InterestChips,
  ProfileBanner,
  ProfileStatsCard,
  RecentPlacesSection,
} from "@/components/profile";
import { Button } from "@/components/ui";
import { SkeletonCard } from "@/components/ui/skeleton-card";
import { useToast } from "@/components/ui/toast";
import { SECTION_STACK } from "@/constants/design";
import { cn } from "@/lib/utils";
import { useSupabase } from "@/providers";
import {
  createProfile,
  fetchProfile,
  fetchProfileStats,
} from "@/services/profile.service";
import { fetchProfileInterests } from "@/services/profile-interests.service";
import { fetchRecentReviewedPlaces } from "@/services/reviews.service";
import { signOut } from "@/services/auth.service";

export default function ProfilePage() {
  const router = useRouter();
  const toast = useToast();
  const { client, user, isLoading: authLoading } = useSupabase();

  const profileQuery = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!client || !user) {
        throw new Error("Supabase não configurado");
      }

      const foundProfile = await fetchProfile(client, user.id);

      if (foundProfile) {
        return foundProfile;
      }

      const defaultName =
        user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? null;
      const defaultUsername = user.email?.split("@")[0] ?? null;
      const createdProfile = await createProfile(client, user.id, {
        name: defaultName,
        username: defaultUsername,
        avatar_url: user.user_metadata?.avatar_url ?? null,
        bio: null,
      });

      return createdProfile;
    },
    enabled: Boolean(client && user),
    staleTime: 1000 * 60,
  });

  const statsQuery = useQuery({
    queryKey: ["profile-stats", user?.id],
    queryFn: async () => {
      if (!client || !user) {
        throw new Error("Supabase não configurado");
      }
      return fetchProfileStats(client, user.id);
    },
    enabled: Boolean(client && user),
    staleTime: 1000 * 60,
  });

  const interestsQuery = useQuery({
    queryKey: ["profile-interests", user?.id],
    queryFn: async () => {
      if (!client || !user) {
        throw new Error("Supabase não configurado");
      }
      return fetchProfileInterests(client, user.id);
    },
    enabled: Boolean(client && user),
    staleTime: 1000 * 60,
  });

  const recentPlacesQuery = useQuery({
    queryKey: ["profile-recent-places", user?.id],
    queryFn: async () => {
      if (!client || !user) {
        throw new Error("Supabase não configurado");
      }
      return fetchRecentReviewedPlaces(client, user.id, 5);
    },
    enabled: Boolean(client && user),
    staleTime: 1000 * 60,
  });

  const handleSignOut = async () => {
    if (!client) return;

    try {
      await signOut(client);
      router.replace("/");
    } catch {
      toast.show("Não foi possível sair da conta", "error");
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, router, user]);

  if (!client || authLoading || !user || profileQuery.isLoading) {
    return (
      <AuthLayout>
        <div className={SECTION_STACK}>
          <SkeletonCard className="mx-auto max-w-3xl" lines={6} />
        </div>
      </AuthLayout>
    );
  }

  if (!profileQuery.data) {
    return (
      <AuthLayout>
        <div className={cn(SECTION_STACK, "max-w-4xl")}>
          <div className="rounded-card-lg p-card border border-red-200 bg-red-50 text-red-700">
            Não foi possível carregar o perfil.
          </div>
        </div>
      </AuthLayout>
    );
  }

  const profile = profileQuery.data;
  const displayName = profile.name ?? `@${profile.username}`;
  const stats = statsQuery.data ?? {
    visitedPlaceCount: 0,
    favoritesCount: 0,
    reviewCount: 0,
  };

  return (
    <AuthLayout>
      <div className={cn(SECTION_STACK, "max-w-4xl")}>
        {/* ── Banner + avatar sobreposto ── */}
        <ProfileBanner profile={profile} />

        {/* ── Identidade (nome + botão de edição) ── */}
        <div className="pt-stack-lg">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-foreground text-2xl font-extrabold tracking-tight">
                {displayName}
              </h1>
              {profile.username ? (
                <p className="text-muted-foreground text-sm">
                  @{profile.username}
                </p>
              ) : null}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              asChild
              className="shrink-0"
            >
              <Link href="/profile/edit">
                <PenLine className="size-4" />
                Editar perfil
              </Link>
            </Button>
          </div>

          {profile.show_city !== false && profile.city ? (
            <p className="text-muted-foreground mt-stack-xs flex items-center gap-1 text-sm">
              <MapPin className="size-3.5 shrink-0" />
              {profile.city}
            </p>
          ) : null}

          {profile.bio ? (
            <p className="text-foreground/80 mt-stack-sm text-sm leading-relaxed">
              {profile.bio}
            </p>
          ) : null}
        </div>

        {/* ── Seção: Você curte ── */}
        <InterestChips interests={interestsQuery.data ?? []} />

        {/* ── Card de estatísticas ── */}
        <ProfileStatsCard stats={stats} />

        {/* ── Seção: Últimos lugares ── */}
        <RecentPlacesSection
          places={recentPlacesQuery.data ?? []}
          username={profile.username}
        />

        {/* ── Sair da conta ── */}
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={handleSignOut}
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
          >
            <LogOut className="size-4" />
            Sair da conta
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}
