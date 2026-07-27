import { NextResponse } from "next/server";

type PlaceDetail = {
  name: string;
  address: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  phone: string;
  website: string;
  opening_hours: Record<string, string[]> | null;
};

const BROWSER_HEADERS: Record<string, string> = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
    "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
  "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
  "Accept-Encoding": "gzip, deflate, br",
  "Cache-Control": "no-cache",
  Pragma: "no-cache",
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "none",
  "Sec-Fetch-User": "?1",
  "Upgrade-Insecure-Requests": "1",
  Cookie:
    "CONSENT=YES+1; SOCS=CAISHAgBEhJnd3NfMjAyMzA4MjMtMF9SQzEaAnB0IAEaBgiA_LypBg",
};

// ─── URL parsing helpers ───────────────────────────────────────────────

async function resolveShortUrl(url: string): Promise<string> {
  if (!url.includes("goo.gl") && !url.includes("maps.app.goo")) return url;

  try {
    const resp = await fetch(url, {
      method: "HEAD",
      redirect: "manual",
      headers: { "User-Agent": BROWSER_HEADERS["User-Agent"] },
      signal: AbortSignal.timeout(5000),
    });
    const location = resp.headers.get("location");
    if (location)
      return location.startsWith("http")
        ? location
        : new URL(location, url).href;
  } catch {
    try {
      const resp = await fetch(url, {
        method: "GET",
        redirect: "follow",
        headers: { "User-Agent": BROWSER_HEADERS["User-Agent"] },
        signal: AbortSignal.timeout(5000),
      });
      return resp.url;
    } catch {
      throw new Error(
        "Não foi possível resolver o link encurtado do Google Maps.",
      );
    }
  }

  return url;
}

function extractCoordsFromUrl(
  url: string,
): { lat: number; lng: number } | null {
  const match = url.match(/@([+-]?\d+\.?\d*),([+-]?\d+\.?\d*)/);
  if (match) return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
  return null;
}

function extractNameFromUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    const placeMatch = parsed.pathname.match(/\/place\/([^/@]+)/);
    if (placeMatch)
      return decodeURIComponent(placeMatch[1].replace(/\+/g, " "));
  } catch {
    /* ignore */
  }
  return null;
}

// ─── HTML parsing helpers ──────────────────────────────────────────────

function extractJsonLd(html: string): Record<string, unknown> | null {
  const regex =
    /<script\s+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    try {
      const data = JSON.parse(match[1].trim());
      const items = Array.isArray(data) ? data : [data];
      for (const item of items) {
        if (
          item["@type"] === "Restaurant" ||
          item["@type"] === "FoodEstablishment" ||
          item["@type"] === "LocalBusiness" ||
          item["@type"] === "Place" ||
          item["@type"] === "CafeOrCoffeeShop"
        )
          return item;
      }
      if (items[0]?.name) return items[0];
    } catch {
      continue;
    }
  }
  return null;
}

function extractTitle(html: string): string | null {
  const m = html.match(/<title[^>]*>\s*([\s\S]*?)\s*<\/title>/i);
  if (m)
    return m[1]
      .replace(/\s*[-–|]\s*Google\s*Maps\s*$/i, "")
      .replace(/\s+/g, " ")
      .trim();
  return null;
}

function getMetaContent(
  html: string,
  attribute: string,
  value: string,
): string | null {
  const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const patterns = [
    new RegExp(
      `<meta[^>]*${attribute}\\s*=\\s*["']${escaped}["'][^>]*content\\s*=\\s*["']([^"']+)["']`,
      "i",
    ),
    new RegExp(
      `<meta[^>]*content\\s*=\\s*["']([^"']+)["'][^>]*${attribute}\\s*=\\s*["']${escaped}["']`,
      "i",
    ),
  ];
  for (const pattern of patterns) {
    const m = html.match(pattern);
    if (m) return m[1];
  }
  return null;
}

const GMAPS_SLOGANS = [
  "Google Maps",
  "Informações de trânsito",
  "navegação em tempo real",
  "Explore lugares",
  "Encontre lugares",
  "descubra novos lugares",
];

function isGenericDescription(text: string): boolean {
  const lower = text.toLowerCase();
  return GMAPS_SLOGANS.some(
    (slogan) => lower.includes(slogan.toLowerCase()) && lower.length < 100,
  );
}

// ─── Brazilian address / phone patterns ─────────────────────────────────

const STREET_PREFIXES =
  /\b(Rua|Av\.|Avenida|Alameda|Travessa|Praça|Rodovia|Estrada|Via|Largo|Vila|Beco|Ladeira)\b/i;

const CEP_PATTERN = /\b\d{5}-?\d{3}\b/;

// Brazilian phone: +55 (11) 9xxxx-xxxx or similar
const PHONE_PATTERN = /(?:\+55\s?)?(?:\(?\d{2}\)?\s?)?(?:9?\d{4}[-\s]?\d{4})/;

const UF_LIST =
  "AC|AL|AP|AM|BA|CE|DF|ES|GO|MA|MT|MS|MG|PA|PB|PR|PE|PI|RJ|RN|RS|RO|RR|SC|SP|SE|TO";
const UF_PATTERN = new RegExp(`\\b(${UF_LIST})\\b`);

/** Extract address from description meta that may contain "Name · Address" format. */
function extractAddressFromDescription(desc: string): string | null {
  const trimmed = desc.trim();
  if (isGenericDescription(trimmed)) return null;

  // Format: "Name · Address, City - State" — take the part after " · "
  const parts = trimmed.split("·").map((p) => p.trim());
  if (parts.length >= 2) {
    return parts.slice(1).join(" · ");
  }

  // If description contains street prefixes or CEP, use the whole thing
  if (STREET_PREFIXES.test(trimmed) || CEP_PATTERN.test(trimmed))
    return trimmed;

  return null;
}

/** Search raw HTML for patterns that look like an address line. */
function findAddressInHtml(html: string): string | null {
  // Strategy: find lines/segments that contain street prefix + optional CEP
  const lines = html
    .replace(/<[^>]+>/g, "\n")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 10);

  // Score each line for address-like patterns
  let best: { line: string; score: number } | null = null;

  for (const line of lines) {
    const decoded = decodeHtmlEntities(line);
    let score = 0;

    // Has street prefix
    if (STREET_PREFIXES.test(decoded)) score += 3;
    // Has CEP
    if (CEP_PATTERN.test(decoded)) score += 3;
    // Has UF
    if (UF_PATTERN.test(decoded)) score += 2;
    // Has comma-separated parts (typical address)
    if (decoded.split(",").length >= 3) score += 1;
    // Has numbers (street number)
    if (/\d+/.test(decoded)) score += 1;
    // Avoid very long lines
    if (decoded.length > 200) score -= 2;

    if (score > 0 && (!best || score > best.score)) {
      best = { line: decoded, score };
    }
  }

  return best?.line ?? null;
}

/** Decode common HTML entities. */
function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&/g, "&")
    .replace(/</g, "<")
    .replace(/>/g, ">")
    .replace(/"/g, '"')
    .replace(/'/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/")
    .replace(/&#(\d+);/g, (_m, code) => String.fromCharCode(Number(code)));
}

/** Extract phone numbers from raw HTML text content. */
function findPhonesInHtml(html: string): string[] {
  const textContent = decodeHtmlEntities(html.replace(/<[^>]+>/g, " "));
  const phones: string[] = [];
  const regex = new RegExp(PHONE_PATTERN, "g");
  let match;
  while ((match = regex.exec(textContent)) !== null) {
    const cleaned = match[0].replace(/[-\s]/g, "").trim();
    if (cleaned.length >= 10 && !phones.includes(cleaned)) phones.push(cleaned);
    // Avoid overlapping matches
    regex.lastIndex = match.index + 1;
  }
  return phones;
}

/** Extract external links from HTML (skip google.com domains). */
function findExternalLinks(html: string): string[] {
  const links: string[] = [];
  const regex = /<a[^>]*href\s*=\s*["'](https?:\/\/[^"']+)["'][^>]*>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const href = match[1];
    try {
      const parsed = new URL(href);
      if (
        !parsed.hostname.includes("google.com") &&
        !parsed.hostname.includes("gstatic.com") &&
        !parsed.hostname.includes("googleapis.com")
      ) {
        links.push(href);
      }
    } catch {
      continue;
    }
  }
  return links;
}

// ─── Sanitization ──────────────────────────────────────────────────────

/** Detect if text contains JavaScript code rather than real content. */
function isJSContaminated(text: string): boolean {
  const JS_INDICATORS = [
    "function(",
    "function (",
    "var ",
    "let ",
    "const ",
    "<script",
    "eval(",
    " new ",
    "this.",
    "return ",
    "typeof ",
    "instanceof ",
    "prototype",
    "JSON.",
    "Math.",
    "document.",
    "window.",
    "null!=",
    "undefined",
    "!function",
    "!1!",
    "constructor",
    "()=>",
    "=>{",
    "for(",
    "for (",
    "while(",
    "while (",
    "setTimeout",
    "setInterval",
    "Promise",
    "require(",
    "exports.",
    "module.",
    "process.",
    "___",
  ];

  const lower = text.toLowerCase();
  let score = 0;

  for (const indicator of JS_INDICATORS) {
    const idx = lower.indexOf(indicator.toLowerCase());
    if (idx !== -1) {
      // Check if it's within an actual code block (score by proximity)
      score += 1;
      // Check surrounding characters for code patterns
      const start = Math.max(0, idx - 5);
      const end = Math.min(text.length, idx + indicator.length + 5);
      const context = text.slice(start, end);
      if (/[{;)\]}=]/.test(context)) score += 2;
    }
  }

  // If score >= 3, it's very likely JS code
  return score >= 3;
}

/** Sanitize text: remove excessive whitespace, line breaks, HTML entities. */
function sanitizeText(text: string): string {
  return text
    .replace(/[\r\n]+/g, " ")
    .replace(/\s{2,}/g, " ")
    .replace(/&/g, "&")
    .replace(/</g, "<")
    .replace(/>/g, ">")
    .replace(/"/g, '"')
    .replace(/'/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/")
    .replace(/&#(\d+);/g, (_m, code) => String.fromCharCode(Number(code)))
    .trim();
}

/** Fake phone number blacklist. */
const FAKE_PHONES = new Set([
  "+551000000014",
  "+551000000000",
  "+551111111111",
  "+552222222222",
  "+553333333333",
  "+554444444444",
  "+555555555555",
  "+556666666666",
  "+557777777777",
  "+558888888888",
  "+559999999999",
  "+550000000000",
  "+550000000001",
  "551000000014",
  "551000000000",
]);

/** Validate a Brazilian phone number. */
function isValidBrazilianPhone(phone: string): boolean {
  // Remove all non-digit characters except leading +
  const cleaned = phone.replace(/[^\d+]/g, "");
  const normalized = cleaned.startsWith("+") ? cleaned : `+${cleaned}`;

  // Check blacklist
  if (FAKE_PHONES.has(normalized)) return false;

  // Check for repetitive sequences
  const digits = normalized.replace(/\D/g, "");
  if (/^(\d)\1{6,}$/.test(digits)) return false;
  if (/000000/.test(digits)) return false;

  // Brazilian numbers: +55 XX X XXXX-XXXX or +55 XX XXXX-XXXX
  // After removing country code +55, we need 10-11 digits
  if (normalized.startsWith("+55")) {
    const nationalDigits = normalized.slice(3);
    if (nationalDigits.length < 10 || nationalDigits.length > 11) return false;
    // Mobile: starts with 9 after DDD, landline: starts with 2-5 after DDD
    const ddd = parseInt(nationalDigits.slice(0, 2));
    if (ddd < 11 || ddd > 99) return false;
    return true;
  }

  // Accept numbers with at least 10 digits (no country code)
  if (digits.length >= 10 && digits.length <= 12) return true;

  return false;
}

/** Extract city and state from an address string using regex. */
function extractCityStateFromAddress(address: string): {
  city: string;
  state: string;
} {
  let city = "";
  let state = "";

  // Pattern 1: "City - UF" at the end or near-end
  const stateMatch = address.match(
    new RegExp(
      `([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ\\s.]+?)\\s*[-–]\\s*(${UF_LIST})(?:[,\\s]|$)`,
    ),
  );
  if (stateMatch) {
    city = stateMatch[1].trim();
    state = stateMatch[2];
    return { city, state };
  }

  // Pattern 2: UF after comma at the end: "... , SP"
  const ufEndMatch = address.match(new RegExp(`[,]\\s*(${UF_LIST})\\s*$`));
  if (ufEndMatch) {
    state = ufEndMatch[1];
    // City is the part before the last meaningful segment
    const parts = address.split(",").map((p) => p.trim());
    if (parts.length >= 2) {
      city = parts[parts.length - 2].replace(/[-–].*$/, "").trim();
    }
    return { city, state };
  }

  return { city, state };
}

// ─── Main handler ───────────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { url?: string };
    const { url } = body;

    if (!url || typeof url !== "string" || url.trim().length === 0) {
      return NextResponse.json(
        { error: "O campo 'url' é obrigatório." },
        { status: 400 },
      );
    }

    // Step 1: Resolve shortened URLs
    const resolvedUrl = await resolveShortUrl(url.trim());

    // Step 2: Extract data from URL itself
    const urlCoords = extractCoordsFromUrl(resolvedUrl);
    const nameFromUrl = extractNameFromUrl(resolvedUrl);

    // Step 3: Fetch the Google Maps page HTML
    const resp = await fetch(resolvedUrl, {
      headers: BROWSER_HEADERS,
      signal: AbortSignal.timeout(12000),
    });

    if (!resp.ok) {
      return NextResponse.json(
        { error: "Não foi possível acessar a página do Google Maps." },
        { status: 502 },
      );
    }

    const html = await resp.text();

    // ── 4. Extract Name ────────────────────────────────────────────
    let name = nameFromUrl ?? "";
    if (!name || name === "Google Maps") {
      const ogTitle = getMetaContent(html, "property", "og:title");
      if (ogTitle && !ogTitle.includes("Google Maps"))
        name = ogTitle.replace(/\s*[-–|]\s*Google\s*Maps\s*$/i, "").trim();
    }
    if (!name || name === "Google Maps") {
      const title = extractTitle(html);
      if (title && !title.includes("Google Maps")) name = title;
    }

    let jsonLd: Record<string, unknown> | null = null;
    if (!name || name === "Google Maps") {
      jsonLd = extractJsonLd(html);
      if (jsonLd?.name && typeof jsonLd.name === "string") name = jsonLd.name;
    } else {
      jsonLd = extractJsonLd(html);
    }

    name = name.replace(/\s*[-–|]\s*Google\s*Maps\s*$/i, "").trim();

    // ── 5. Extract Address ─────────────────────────────────────────
    let address = "";

    // Try JSON-LD first (most structured)
    if (jsonLd?.address && typeof jsonLd.address === "object") {
      const addr = jsonLd.address as Record<string, unknown>;
      const parts: string[] = [];
      if (addr.streetAddress) parts.push(String(addr.streetAddress));
      if (addr.addressLocality) parts.push(String(addr.addressLocality));
      if (addr.addressRegion) parts.push(String(addr.addressRegion));
      if (addr.postalCode) parts.push(String(addr.postalCode));
      if (addr.addressCountry) parts.push(String(addr.addressCountry));
      if (parts.length > 0) address = parts.join(", ");
    }

    // Try meta descriptions
    if (!address) {
      const ogDesc = getMetaContent(html, "property", "og:description");
      if (ogDesc) {
        const extracted = extractAddressFromDescription(ogDesc);
        if (extracted) address = extracted;
      }
    }
    if (!address) {
      const twDesc = getMetaContent(html, "name", "twitter:description");
      if (twDesc) {
        const extracted = extractAddressFromDescription(twDesc);
        if (extracted) address = extracted;
      }
    }

    // Fallback: search raw HTML for address patterns
    if (!address) {
      const found = findAddressInHtml(html);
      if (found) address = found;
    }

    // ── 6. Extract Coordinates ─────────────────────────────────────
    let lat = urlCoords?.lat ?? 0;
    let lng = urlCoords?.lng ?? 0;

    if (jsonLd?.geo && typeof jsonLd.geo === "object" && jsonLd.geo !== null) {
      const geo = jsonLd.geo as Record<string, unknown>;
      if (geo.latitude) lat = Number(geo.latitude);
      if (geo.longitude) lng = Number(geo.longitude);
    }

    if ((!lat || !lng) && html) {
      const metaLat = getMetaContent(
        html,
        "property",
        "place:location:latitude",
      );
      const metaLng = getMetaContent(
        html,
        "property",
        "place:location:longitude",
      );
      if (metaLat && metaLng) {
        lat = parseFloat(metaLat);
        lng = parseFloat(metaLng);
      }
    }

    // ── 7. Extract Phone ───────────────────────────────────────────
    let phone = "";

    // JSON-LD
    if (jsonLd?.telephone && typeof jsonLd.telephone === "string") {
      phone = jsonLd.telephone;
    }

    // Search HTML for tel: links
    if (!phone) {
      const telLink = html.match(/<a[^>]*href\s*=\s*["']tel:([^"']+)["']/i);
      if (telLink) phone = telLink[1];
    }

    // Search for Brazilian phone patterns in raw text
    if (!phone) {
      const phones = findPhonesInHtml(html);
      if (phones.length > 0) phone = phones[0];
    }

    // Normalize phone
    if (phone) {
      phone = phone.replace(/^tel:/, "").trim();
      // Ensure +55 prefix for Brazilian numbers
      if (phone.startsWith("55") && !phone.startsWith("+55"))
        phone = `+${phone}`;
      else if (/^\d{10,11}$/.test(phone)) phone = `+55${phone}`;
    }

    // ── 8. Extract Website ─────────────────────────────────────────
    let website = "";

    // JSON-LD
    if (jsonLd?.url && typeof jsonLd.url === "string") {
      website = jsonLd.url;
    }

    // og:url (skip if it's a Google Maps URL)
    if (!website || website.includes("google.com/maps")) {
      const ogUrl = getMetaContent(html, "property", "og:url");
      if (ogUrl && !ogUrl.includes("google.com/maps")) website = ogUrl;
    }

    // External links in the page
    if (!website) {
      const links = findExternalLinks(html);
      // Prefer links that look like official sites (shorter, no social media)
      const socialDomains = [
        "instagram.com",
        "facebook.com",
        "twitter.com",
        "x.com",
        "youtube.com",
        "linkedin.com",
        "tiktok.com",
      ];
      const official = links.find(
        (l) => !socialDomains.some((sd) => l.includes(sd)),
      );
      if (official) website = official;
    }

    // Still google maps in website? clear it
    if (website && website.includes("google.com/maps")) website = "";

    // ── 9. Extract City / State ────────────────────────────────────
    let city = "";
    let state = "";

    if (jsonLd?.address && typeof jsonLd.address === "object") {
      const addr = jsonLd.address as Record<string, unknown>;
      city = String(addr.addressLocality ?? "");
      state = String(addr.addressRegion ?? "");
    }

    if (!city && address) {
      const extracted = extractCityStateFromAddress(address);
      city = extracted.city;
      state = extracted.state;
    }

    // ── 10. Extract Opening Hours ──────────────────────────────────
    let openingHours: Record<string, string[]> | null = null;
    if (
      jsonLd?.openingHoursSpecification &&
      Array.isArray(jsonLd.openingHoursSpecification)
    ) {
      const hours: string[] = [];
      const dayMap: Record<string, string> = {
        Monday: "Seg",
        Tuesday: "Ter",
        Wednesday: "Qua",
        Thursday: "Qui",
        Friday: "Sex",
        Saturday: "Sáb",
        Sunday: "Dom",
      };
      const weekdayOrder = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ];

      const sorted = [...jsonLd.openingHoursSpecification].sort(
        (a, b) =>
          weekdayOrder.indexOf((a as Record<string, string>).dayOfWeek) -
          weekdayOrder.indexOf((b as Record<string, string>).dayOfWeek),
      );

      for (const spec of sorted) {
        const s = spec as Record<string, string>;
        const day = dayMap[s.dayOfWeek] || s.dayOfWeek;
        hours.push(`${day}: ${s.opens}–${s.closes}`);
      }

      if (hours.length > 0) openingHours = { weekdays: hours };
    }

    // ── Sanitize all extracted fields ─────────────────────────────
    name = sanitizeText(name);
    if (isJSContaminated(name)) name = "";

    address = sanitizeText(address);
    if (isJSContaminated(address)) address = "";

    city = sanitizeText(city);
    if (isJSContaminated(city)) city = "";

    state = sanitizeText(state);

    if (phone) {
      phone = sanitizeText(phone);
      if (!isValidBrazilianPhone(phone)) phone = "";
    }

    if (website) {
      website = sanitizeText(website);
      try {
        const parsed = new URL(website);
        if (parsed.hostname.includes("google")) website = "";
      } catch {
        website = "";
      }
    }

    // ── Build result ───────────────────────────────────────────────
    const result: PlaceDetail = {
      name: name || "",
      address: address || "",
      city: city || "",
      state: state || "",
      lat: lat || 0,
      lng: lng || 0,
      phone: phone || "",
      website: website || "",
      opening_hours: openingHours,
    };

    return NextResponse.json(result);
  } catch (err) {
    console.error("[extract-place-data] Unexpected error:", err);
    const message =
      err instanceof Error
        ? err.message
        : "Erro inesperado ao extrair dados do local.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
