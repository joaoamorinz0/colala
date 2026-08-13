import Link from "next/link";
import { Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Profile } from "@/types/profile";

export type ProfileBannerProps = {
  profile: Profile;
  className?: string;
};

function getInitials(profile: Profile) {
  const displayName = profile.name ?? `@${profile.username}`;
  return displayName
    .split(" ")
    .map((part: string) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Banner de capa do perfil com logo "colalá", engrenagem
 * (→ /profile/edit) e avatar sobreposto na borda inferior.
 */
export function ProfileBanner({ profile, className }: ProfileBannerProps) {
  const initials = getInitials(profile);

  return (
    <header className={cn("relative", className)}>
      <div className="bg-muted relative h-48 w-full overflow-hidden rounded-b-[1.75rem]">
        {profile.cover_image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.cover_image}
            alt=""
            aria-hidden="true"
            className="size-full object-cover"
          />
        ) : null}
        {/* Overlay leve para contraste */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/25 to-black/40" />

        <div className="absolute inset-x-0 top-0 flex items-center justify-between px-4 pt-4">
          <span className="text-primary-foreground text-2xl font-extrabold tracking-tight drop-shadow-sm">
            colalá
          </span>
          <Link
            href="/profile/edit"
            aria-label="Configurações do perfil"
            className="flex size-10 items-center justify-center rounded-full bg-black/25 text-white backdrop-blur-sm transition-colors hover:bg-black/40"
          >
            <Settings className="size-5" />
          </Link>
        </div>
      </div>

      {/* Avatar sobreposto na borda inferior do banner */}
      <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
        {profile.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.avatar_url}
            alt="Foto de perfil"
            className="border-background bg-background size-24 rounded-full border-4 object-cover shadow-md"
          />
        ) : (
          <div className="border-background bg-primary/10 text-primary flex size-24 items-center justify-center rounded-full border-4 text-3xl font-bold shadow-md">
            {initials}
          </div>
        )}
      </div>
    </header>
  );
}
