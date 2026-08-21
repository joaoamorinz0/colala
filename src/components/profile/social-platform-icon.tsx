"use client";

import {
  Instagram as InstagramIcon,
  Youtube as YoutubeIcon,
  Linkedin as LinkedinIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  Globe as GlobeIcon,
} from "lucide-react";
import type { DetectedPlatform } from "@/types/profile-social-link";

/** TikTok não existe no lucide-react — ícone customizado. */
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M16.6 5.82c-.8-.87-1.28-2-1.32-3.22H12.2v13.94c0 1.53-1.24 2.77-2.77 2.77a2.77 2.77 0 0 1 0-5.54c.24 0 .48.03.7.09V10.7a5.9 5.9 0 0 0-.7-.04A5.85 5.85 0 0 0 3.58 16.5 5.85 5.85 0 0 0 9.43 22.35a5.85 5.85 0 0 0 5.85-5.85V9.18a8.16 8.16 0 0 0 4.75 1.52V7.62a4.85 4.85 0 0 1-3.43-1.8Z" />
    </svg>
  );
}

/** Letterboxd (três círculos sobrepostos) — sem ícone no lucide-react. */
function LetterboxdIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <circle cx="6" cy="12" r="5" />
      <circle cx="12" cy="12" r="5" opacity="0.6" />
      <circle cx="18" cy="12" r="5" opacity="0.3" />
    </svg>
  );
}

const LINK_ICONS: Record<string, React.ElementType> = {
  Instagram: InstagramIcon,
  TikTok: TikTokIcon,
  X: TwitterIcon,
  YouTube: YoutubeIcon,
  LinkedIn: LinkedinIcon,
  Threads: TwitterIcon, // lucide não tem Threads; visual próximo até termos um custom
  Facebook: FacebookIcon,
  Letterboxd: LetterboxdIcon,
  Globe: GlobeIcon,
};

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
