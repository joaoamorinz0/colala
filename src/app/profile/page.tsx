import { AuthLayout } from "@/components/layout";
import { ProfileMenuSection } from "@/components/profile/profile-menu-section";
import { Bell, Lock, MapPin, Share2, Star, User } from "lucide-react";

export default function ProfilePage() {
  return (
    <AuthLayout>
      <div className="space-y-12 pt-12">
        <header className="text-center">
          <div className="border-primary bg-primary/8 text-primary mx-auto flex size-36 items-center justify-center rounded-full border-4 text-5xl font-bold">
            J
          </div>
          <h1 className="text-foreground mt-8 text-4xl font-extrabold">João</h1>
          <p className="text-muted-foreground mt-2 text-2xl">João</p>
        </header>

        <section className="bg-card shadow-card grid grid-cols-3 rounded-3xl py-7">
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
              <p className="text-foreground text-4xl font-extrabold">{value}</p>
              <p className="text-muted-foreground mt-2 text-lg">{label}</p>
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
