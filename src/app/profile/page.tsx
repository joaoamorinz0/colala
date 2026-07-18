import { AuthLayout } from "@/components/layout";
import { ProfileMenuSection } from "@/components/profile/profile-menu-section";
import { CARD_SURFACE, SECTION_STACK } from "@/constants/design";
import { Bell, Lock, MapPin, Share2, Star, User } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  return (
    <AuthLayout>
      <div className={SECTION_STACK}>
        <header className="text-center">
          <div className="border-primary bg-primary/10 text-primary mx-auto flex size-24 items-center justify-center rounded-full border-[3px] text-3xl font-bold">
            J
          </div>
          <h1 className="text-foreground mt-stack-md text-2xl font-extrabold tracking-tight">
            João
          </h1>
          <p className="text-muted-foreground mt-1 text-base">João</p>
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
      </div>
    </AuthLayout>
  );
}
