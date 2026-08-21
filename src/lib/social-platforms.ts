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
  letterboxd: {
    name: "letterboxd",
    displayName: "Letterboxd",
    hostname: "letterboxd.com",
    icon: "Letterboxd",
  },
};

/** Remove "www." do início do hostname. */
function normalizeHostname(hostname: string): string {
  return hostname.replace(/^www\./, "");
}

/**
 * Segmentos de path que não representam um handle de usuário.
 */
const IGNORED_HANDLE_SEGMENTS = new Set([
  "home",
  "profile",
  "settings",
  "account",
  "search",
  "explore",
]);

/**
 * Prefixos de path usados por algumas plataformas antes do handle.
 * Ex: linkedin.com/in/joao, twitter.com/user/joao.
 */
const PROFILE_PATH_PREFIXES = new Set(["in", "u", "user", "p", "profile"]);

/**
 * Extrai um handle legível a partir da URL de uma rede social.
 *
 * @example
 * extractHandle("https://twitter.com/joaoamorinz") // "joaoamorinz"
 * extractHandle("https://www.instagram.com/@user") // "user"
 * extractHandle("https://linkedin.com/in/joao")    // "joao"
 * extractHandle("https://example.com/blog")       // "example.com"
 * extractHandle("não é uma url")                  // ""
 */
export function extractHandle(url: string): string {
  try {
    const parsed = new URL(url);
    const segments = parsed.pathname
      .split("/")
      .filter(Boolean)
      .map((segment) => segment.replace(/^@/, ""))
      .filter((segment) => segment.length > 0);

    if (
      segments.length > 1 &&
      PROFILE_PATH_PREFIXES.has(segments[0].toLowerCase())
    ) {
      return segments[1];
    }

    if (
      segments.length > 0 &&
      !IGNORED_HANDLE_SEGMENTS.has(segments[0].toLowerCase())
    ) {
      return segments[0];
    }
  } catch {
    // URL inválida — cai no fallback do domínio
  }

  try {
    return normalizeHostname(new URL(url).hostname);
  } catch {
    return "";
  }
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
