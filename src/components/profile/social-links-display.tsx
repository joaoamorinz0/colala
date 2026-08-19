"use client";

import { detectPlatform } from "@/lib/social-platforms";
import type { ProfileSocialLink } from "@/types/profile-social-link";
import { SocialPlatformIcon } from "@/components/profile/social-platform-icon";

export type SocialLinksDisplayProps = {
  links: ProfileSocialLink[];
  className?: string;
};

/**
 * Exibe ícones das redes sociais cadastradas no perfil.
 * Cada ícone abre a URL em nova aba. Rede desconhecida usa ícone genérico.
 */
export function SocialLinksDisplay({
  links,
  className = "",
}: SocialLinksDisplayProps) {
  if (links.length === 0) return null;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {links.map((link) => {
        const platform = detectPlatform(link.url);
        return (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            title={platform.displayName}
            aria-label={`${platform.displayName}: ${link.url}`}
            className="border-border bg-card text-muted-foreground hover:text-primary hover:border-primary/40 flex size-10 items-center justify-center rounded-full border shadow-sm transition-colors"
          >
            <SocialPlatformIcon platform={platform} className="size-4.5" />
          </a>
        );
      })}
    </div>
  );
}
