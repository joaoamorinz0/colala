"use client";

import { useRouter } from "next/navigation";
import { Bell, Lock, LogOut, MapPin, Share2, Star, User } from "lucide-react";
import { AuthLayout } from "@/components/layout";
import { ProfileMenuSection } from "@/components/profile/profile-menu-section";
import { Button } from "@/components/ui/button";
import {
  CARD_SURFACE,
  CONTROL_HEIGHT,
  SECTION_STACK,
} from "@/constants/design";
import { cn } from "@/lib/utils";
import { useSupabase } from "@/providers";
import { signOut } from "@/services/auth.service";

export default function ProfilePage() {
  const router = useRouter();
  const { client, user } = useSupabase();

  const displayName =
    user?.user_metadata?.full_name ??
    user?.user_metadata?.name ??
    user?.email?.split("@")[0] ??
    "Usuário";

  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const avatarUrl = user?.user_metadata?.avatar_url ?? null;

  const handleSignOut = async () => {
    if (!client) return;
    try {
      await signOut(client);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      router.push("/login" as any);
    } catch {
      // Silently handle — session may already be gone
    }
  };

  return (
    <AuthLayout>
      <div className={SECTION_STACK}>
        <header className="text-center">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className="border-primary mx-auto size-24 rounded-full border-[3px] object-cover"
            />
          ) : (
            <div className="border-primary bg-primary/10 text-primary mx-auto flex size-24 items-center justify-center rounded-full border-[3px] text-3xl font-bold">
              {initials}
            </div>
          )}
          <h1 className="text-foreground mt-stack-md text-2xl font-extrabold tracking-tight">
            {displayName}
          </h1>
          <p className="text-muted-foreground mt-1 text-base">{user?.email}</p>
        </header>

        <section className={cn(CARD_SURFACE, "py-stack-lg grid grid-cols-3")}>
          {[
            ["2", "Favoritos"],
            ["6", "Visitados"],
            ["2", "Avaliações"],
          ].map(([value, label], index) => (
            <div
              className={
                index > 0 ? "border-border border-l text-center" : "text-center"
              }
              key={label}
            >
              <p className="text-foreground text-2xl font-extrabold">{value}</p>
              <p className="text-muted-foreground mt-1 text-xs">{label}</p>
            </div>
          ))}
        </section>

        <ProfileMenuSection
          items={[
            { icon: User, label: "Editar perfil" },
            { icon: Bell, label: "Notificações" },
            { icon: Lock, label: "Privacidade" },
          ]}
          title="Conta"
        />

        <ProfileMenuSection
          items={[
            { icon: MapPin, label: "Minha localização" },
            { icon: Star, label: "Minhas avaliações" },
            { icon: Share2, label: "Compartilhar Colalá" },
          ]}
          title="Preferências"
        />

        <Button
          type="button"
          onClick={handleSignOut}
          variant="outline"
          className={cn(
            CONTROL_HEIGHT,
            "rounded-control w-full border-red-200 text-base font-bold text-red-600 hover:bg-red-50",
          )}
        >
          <LogOut className="size-5" />
          Sair da conta
        </Button>
      </div>
    </AuthLayout>
  );
}
