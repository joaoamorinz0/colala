"use client";

import { detectPlatform, extractHandle } from "@/lib/social-platforms";
import type { ProfileSocialLink } from "@/types/profile-social-link";
import { SocialPlatformIcon } from "@/components/profile/social-platform-icon";

export type SocialLinksDisplayProps = {
  links: ProfileSocialLink[];
  className?: string;
  /** "center" (padrão, perfil público) ou "start" (meu perfil, alinhado à esquerda). */
  align?: "center" | "start";
};

/**
 * Exibe cada rede social do perfil como uma linha de texto "@handle",
 * empilhada verticalmente, no mesmo padrão do link do Instagram.
 * Sem ícones, sem pills/bordas. Cada link abre em nova aba.
 */
export function SocialLinksDisplay({
  links,
  className = "",
  align = "center",
}: SocialLinksDisplayProps) {
  if (links.length === 0) return null;

  return (
    <div
      className={`flex flex-col gap-0.5 ${
        align === "start" ? "items-start" : "items-center"
      } ${className}`}
    >
      {links.map((link) => {
        const handle = extractHandle(link.url);
        if (!handle) return null;
        const platform = detectPlatform(link.url);
        return (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            title={link.url}
            aria-label={`Abrir ${link.url}`}
            className="text-primary hover:text-primary/80 inline-flex items-center gap-1.5 text-sm font-semibold transition-colors"
          >
            <SocialPlatformIcon
              platform={platform}
              className="size-3.5 shrink-0"
            />
            <span>@{handle}</span>
          </a>
        );
      })}
    </div>
  );
}
