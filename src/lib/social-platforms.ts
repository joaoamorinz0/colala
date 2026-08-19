import type { DetectedPlatform } from "@/types/profile-social-link";

/**
 * Mapeia chaves normalizadas de hostname para plataformas conhecidas.
 * A detecção usa `new URL(url).hostname` para evitar falsos positivos
 * por inclusão simples de texto (ex: "tiktok" num comentário).
 */
const PLATFORM_MAP: Record<string, DetectedPlatform> = {
  instagram: {
    name: "instagram",
    displayName: "Instagram",
    hostname: "instagram.com",
    icon: "Instagram",
  },
  tiktok: {
    name: "tiktok",
    displayName: "TikTok",
    hostname: "tiktok.com",
    icon: "TikTok",
  },
  x: {
    name: "x",
    displayName: "X",
    hostname: "x.com",
    icon: "X",
  },
  twitter: {
    name: "x",
    displayName: "X",
    hostname: "x.com",
    icon: "X",
  },
  youtube: {
    name: "youtube",
    displayName: "YouTube",
    hostname: "youtube.com",
    icon: "YouTube",
  },
  linkedin: {
    name: "linkedin",
    displayName: "LinkedIn",
    hostname: "linkedin.com",
    icon: "LinkedIn",
  },
  threads: {
    name: "threads",
    displayName: "Threads",
    hostname: "threads.net",
    icon: "Threads",
  },
  facebook: {
    name: "facebook",
    displayName: "Facebook",
    hostname: "facebook.com",
    icon: "Facebook",
  },
};

/** Remove "www." do início do hostname. */
function normalizeHostname(hostname: string): string {
  return hostname.replace(/^www\./, "");
}

/**
 * Detecta a plataforma social a partir de uma URL.
 *
 * @example
 * detectPlatform("https://www.instagram.com/usuario")
 * // → { displayName: "Instagram", icon: "Instagram", hostname: "instagram.com" }
 */
export function detectPlatform(url: string): DetectedPlatform {
  try {
    const hostname = normalizeHostname(new URL(url).hostname);
    const key = hostname.split(".")[0];
    if (key && PLATFORM_MAP[key]) {
      return PLATFORM_MAP[key];
    }
  } catch {
    // URL inválida — retorna genérico
  }

  return {
    name: "unknown",
    displayName: "Outra rede",
    hostname: "",
    icon: "Globe",
  };
}

/** Verifica se uma string é uma URL válida com protocolo http/https. */
export function isValidSocialUrl(value: string): boolean {
  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
