import { CalendarDays, MapPin, MessageSquare, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Profile } from "@/types/profile";
import type { ProfileInterest } from "@/types/profile-interest";
import type { ProfileSocialLink } from "@/types/profile-social-link";
import { SocialPlatformIcon } from "./social-platform-icon";
import { SocialLinksDisplay } from "./social-links-display";
import { InterestChips } from "./interest-chips";

export type ProfileHeaderProps = {
  profile: Profile;
  reviewCount: number;
  reviewedPlaceCount: number;
  showCity?: boolean;
  showInstagram?: boolean;
  interests?: ProfileInterest[];
  socialLinks?: ProfileSocialLink[];
  className?: string;
};

function formatMemberSince(value: string) {
  return new Date(value).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
}

function getInitials(profile: Profile) {
  const displayName = profile.name ?? `@${profile.username}`;
  return displayName
    .split(" ")
    .map((part: string) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function ProfileHeader({
  profile,
  reviewCount,
  reviewedPlaceCount,
  showCity = true,
  showInstagram = true,
  interests = [],
  socialLinks = [],
  className,
}: ProfileHeaderProps) {
  const displayName = profile.name ?? `@${profile.username}`;
  const initials = getInitials(profile);
  const instagramHandle = profile.instagram
    ? profile.instagram.replace(/^@/, "")
    : null;

  return (
    <header
      className={cn(
        "relative flex flex-col items-center text-center",
        className,
      )}
    >
      {profile.cover_image ? (
        <div className="bg-muted absolute inset-x-0 top-0 h-40 overflow-hidden rounded-b-[1.75rem]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={profile.cover_image}
            alt=""
            aria-hidden="true"
            className="size-full object-cover"
          />
        </div>
      ) : null}

      <div
        className={cn(
          "relative flex flex-col items-center",
          profile.cover_image ? "pt-28" : "pt-0",
        )}
      >
        {profile.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.avatar_url}
            alt={`Avatar de ${displayName}`}
            className={cn(
              "size-24 rounded-full border-[3px] object-cover shadow-md",
              profile.cover_image ? "border-background" : "border-primary",
            )}
          />
        ) : (
          <div
            className={cn(
              "bg-primary/10 text-primary flex size-24 items-center justify-center rounded-full border-[3px] text-3xl font-bold shadow-md",
              profile.cover_image ? "border-background" : "border-primary",
            )}
          >
            {initials}
          </div>
        )}

        <div className="mt-4">
          <h1 className="text-foreground text-2xl font-extrabold tracking-tight">
            {displayName}
          </h1>
          <p className="text-muted-foreground text-sm">@{profile.username}</p>
        </div>

        {/* ── Redes sociais: Instagram + profile_social_links ──
            Texto puro "@handle", sem ícones/pills/bordas, empilhado. */}
        {(showInstagram && instagramHandle) || socialLinks.length > 0 ? (
          <div className="mt-2 flex flex-col items-center gap-0.5">
            {showInstagram && instagramHandle ? (
              <a
                href={`https://instagram.com/${instagramHandle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 inline-flex items-center gap-1.5 text-sm font-semibold transition-colors"
              >
                <SocialPlatformIcon
                  platform={{
                    name: "instagram",
                    displayName: "Instagram",
                    hostname: "instagram.com",
                    icon: "Instagram",
                  }}
                  className="size-3.5 shrink-0"
                />
                <span>@{instagramHandle}</span>
              </a>
            ) : null}
            <SocialLinksDisplay links={socialLinks} />
          </div>
        ) : null}

        {profile.bio && (
          <p className="text-foreground/80 mt-3 max-w-xs text-sm leading-relaxed">
            {profile.bio}
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-gray-500">
          {showCity && profile.city && (
            <span className="flex items-center gap-1">
              <MapPin className="size-3.5" />
              {profile.city}
            </span>
          )}
          <span className="flex items-center gap-1">
            <CalendarDays className="size-3.5" />
            Membro desde {formatMemberSince(profile.created_at)}
          </span>
        </div>

        {interests.length > 0 ? (
          <div className="mt-5 w-full">
            <InterestChips
              interests={interests}
              className="items-start text-left"
            />
          </div>
        ) : null}

        <div className="mt-6 flex justify-center gap-3">
          <div className="border-border bg-card flex min-w-28 items-center gap-2 rounded-xl border px-4 py-3 shadow-sm">
            <MessageSquare className="text-primary size-4" />
            <div className="text-left">
              <p className="text-foreground text-lg leading-none font-extrabold">
                {reviewCount}
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                {reviewCount === 1 ? "avaliação" : "avaliações"}
              </p>
            </div>
          </div>
          <div className="border-border bg-card flex min-w-28 items-center gap-2 rounded-xl border px-4 py-3 shadow-sm">
            <Star className="size-4 text-amber-400" />
            <div className="text-left">
              <p className="text-foreground text-lg leading-none font-extrabold">
                {reviewedPlaceCount}
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                {reviewedPlaceCount === 1
                  ? "lugar avaliado"
                  : "lugares avaliados"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
