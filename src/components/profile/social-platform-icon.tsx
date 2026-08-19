"use client";

import {
  Instagram as InstagramIcon,
  Link2,
  Globe as GlobeIcon,
} from "lucide-react";
import type { DetectedPlatform } from "@/types/profile-social-link";

const LINK_ICONS: Record<string, React.ElementType> = {
  Instagram: InstagramIcon,
  TikTok: Link2,
  X: Link2,
  YouTube: Link2,
  LinkedIn: Link2,
  Threads: Link2,
  Facebook: Link2,
  Globe: GlobeIcon,
};

/**
 * Ícone Lucide correspondente à plataforma detectada.
 * Redes sem ícone próprio usam ícone genérico de link; desconhecidas usam globo.
 */
export function SocialPlatformIcon({
  platform,
  className,
}: {
  platform: DetectedPlatform;
  className?: string;
}) {
  const IconComponent = LINK_ICONS[platform.icon] ?? GlobeIcon;
  return <IconComponent className={className} />;
}
