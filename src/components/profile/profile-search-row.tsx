import Link from "next/link";
import { MapPin } from "lucide-react";
import { CARD_SURFACE, HORIZONTAL_CARD_HEIGHT } from "@/constants/design";
import { cn } from "@/lib/utils";
import type { Profile } from "@/types/profile";

export type ProfileSearchRowProps = {
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
 * Card horizontal para resultado de busca de pessoas.
 * Leva para o perfil público /profile/[username].
 */
export function ProfileSearchRow({
  profile,
  className,
}: ProfileSearchRowProps) {
  const username = profile.username ?? "";

  return (
    <article
      className={cn(
        CARD_SURFACE,
        HORIZONTAL_CARD_HEIGHT,
        "gap-stack-sm p-card-sm flex w-full items-center",
        className,
      )}
    >
      <Link
        href={`/profile/${username}`}
        className="bg-muted text-primary size-12 shrink-0 overflow-hidden rounded-full"
      >
        {profile.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt={profile.name ?? username}
            className="size-full object-cover"
            src={profile.avatar_url}
          />
        ) : (
          <div className="bg-primary/10 text-primary flex size-full items-center justify-center text-sm font-bold">
            {getInitials(profile)}
          </div>
        )}
      </Link>

      <div className="min-w-0 flex-1">
        <Link href={`/profile/${username}`} className="block">
          <h3 className="text-card-foreground line-clamp-1 text-sm font-bold tracking-tight">
            {profile.name ?? `@${username}`}
          </h3>
          <p className="text-muted-foreground text-xs">@{username}</p>
          {profile.city ? (
            <p className="text-muted-foreground mt-0.5 flex items-center gap-1 text-xs">
              <MapPin className="size-3 shrink-0" />
              <span className="truncate">{profile.city}</span>
            </p>
          ) : null}
        </Link>
      </div>
    </article>
  );
}
