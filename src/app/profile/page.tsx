"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink, LogOut, Settings } from "lucide-react";
import { AuthLayout } from "@/components/layout";
import { ProfileHeader } from "@/components/profile";
import { Button } from "@/components/ui";
import { SkeletonCard } from "@/components/ui/skeleton-card";
import { useToast } from "@/components/ui/toast";
import {
  CARD_SURFACE,
  CONTROL_HEIGHT,
  SECTION_STACK,
} from "@/constants/design";
import { cn } from "@/lib/utils";
import { useSupabase } from "@/providers";
import {
  createProfile,
  fetchProfile,
  fetchProfileReviewStats,
} from "@/services/profile.service";
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

  const reviewStatsQuery = useQuery({
    queryKey: ["profile-review-stats", user?.id],
    queryFn: async () => {
      if (!client || !user) {
        return { reviewCount: 0, reviewedPlaceCount: 0 };
      }
      return fetchProfileReviewStats(client, user.id);
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
  const stats = reviewStatsQuery.data ?? {
    reviewCount: 0,
    reviewedPlaceCount: 0,
  };

  return (
    <AuthLayout>
      <div className={cn(SECTION_STACK, "max-w-4xl")}>
        {/* ── Header (visualização) ── */}
        <ProfileHeader
          profile={profile}
          reviewCount={stats.reviewCount}
          reviewedPlaceCount={stats.reviewedPlaceCount}
          showCity={profile.show_city !== false}
          showInstagram={profile.show_instagram !== false}
        />

        {/* ── Seção: Conta ── */}
        <section className={cn(CARD_SURFACE, "space-y-stack-lg p-card")}>
          <div>
            <h2 className="text-foreground text-lg font-bold tracking-tight">
              Conta
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Ações da sua conta
            </p>
          </div>

          <div className="gap-stack-md flex flex-col">
            <Link
              href="/profile/edit"
              className="hover:bg-primary/10 text-primary rounded-control border-primary/30 inline-flex h-12 items-center justify-center gap-2 border text-sm font-semibold transition-colors"
            >
              <Settings className="size-4.5" />
              Editar perfil
            </Link>
            {profile.username ? (
              <Link
                href={`/profile/${profile.username}`}
                className="hover:bg-primary/10 text-primary rounded-control border-primary/30 inline-flex h-12 items-center justify-center gap-2 border text-sm font-semibold transition-colors"
              >
                <ExternalLink className="size-4.5" />
                Ver meu perfil público
              </Link>
            ) : null}
            <Button
              type="button"
              variant="outline"
              className={cn(
                CONTROL_HEIGHT,
                "w-full justify-start border-red-200 text-red-600 hover:bg-red-50",
              )}
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 size-5" />
              Sair da Conta
            </Button>
          </div>
        </section>
      </div>
    </AuthLayout>
  );
}
