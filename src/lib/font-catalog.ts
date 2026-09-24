export type FontOption = {
  id: string;
  family: string;
  displayName: string;
  category: "sans" | "serif" | "display" | "editorial";
  weights: number[];
};

export const FONT_OPTIONS: FontOption[] = [
  {
    id: "inter",
    family: "Inter",
    displayName: "Inter",
    category: "sans",
    weights: [400, 500, 600, 700, 800],
  },
  {
    id: "manrope",
    family: "Manrope",
    displayName: "Manrope",
    category: "sans",
    weights: [400, 500, 600, 700, 800],
  },
  {
    id: "plus-jakarta-sans",
    family: "Plus Jakarta Sans",
    displayName: "Plus Jakarta Sans",
    category: "sans",
    weights: [400, 500, 600, 700, 800],
  },
  {
    id: "space-grotesk",
    family: "Space Grotesk",
    displayName: "Space Grotesk",
    category: "display",
    weights: [400, 500, 700],
  },
  {
    id: "montserrat",
    family: "Montserrat",
    displayName: "Montserrat",
    category: "sans",
    weights: [400, 500, 600, 700, 800],
  },
  {
    id: "poppins",
    family: "Poppins",
    displayName: "Poppins",
    category: "sans",
    weights: [400, 500, 600, 700, 800],
  },
  {
    id: "source-sans-3",
    family: "Source Sans 3",
    displayName: "Source Sans 3",
    category: "sans",
    weights: [400, 500, 600, 700],
  },
  {
    id: "playfair-display",
    family: "Playfair Display",
    displayName: "Playfair Display",
    category: "editorial",
    weights: [400, 500, 600, 700, 800],
  },
  {
    id: "cormorant-garamond",
    family: "Cormorant Garamond",
    displayName: "Cormorant Garamond",
    category: "editorial",
    weights: [400, 500, 600, 700],
  },
  {
    id: "libre-baskerville",
    family: "Libre Baskerville",
    displayName: "Libre Baskerville",
    category: "serif",
    weights: [400, 700],
  },
  {
    id: "lora",
    family: "Lora",
    displayName: "Lora",
    category: "serif",
    weights: [400, 500, 600, 700],
  },
  {
    id: "bodoni-moda",
    family: "Bodoni Moda",
    displayName: "Bodoni Moda",
    category: "editorial",
    weights: [400, 500, 600, 700, 800],
  },
  {
    id: "archivo",
    family: "Archivo",
    displayName: "Archivo",
    category: "sans",
    weights: [400, 500, 600, 700, 800],
  },
  {
    id: "oswald",
    family: "Oswald",
    displayName: "Oswald",
    category: "display",
    weights: [400, 500, 600, 700],
  },
  {
    id: "dm-sans",
    family: "DM Sans",
    displayName: "DM Sans",
    category: "sans",
    weights: [400, 500, 700],
  },
  {
    id: "work-sans",
    family: "Work Sans",
    displayName: "Work Sans",
    category: "sans",
    weights: [400, 500, 600, 700],
  },
  {
    id: "merriweather",
    family: "Merriweather",
    displayName: "Merriweather",
    category: "serif",
    weights: [300, 400, 700],
  },
  {
    id: "fira-sans",
    family: "Fira Sans",
    displayName: "Fira Sans",
    category: "sans",
    weights: [400, 500, 600, 700],
  },
  {
    id: "jost",
    family: "Jost",
    displayName: "Jost",
    category: "sans",
    weights: [400, 500, 600, 700],
  },
  {
    id: "fraunces",
    family: "Fraunces",
    displayName: "Fraunces",
    category: "editorial",
    weights: [400, 500, 600, 700],
  },
  {
    id: "sora",
    family: "Sora",
    displayName: "Sora",
    category: "sans",
    weights: [400, 500, 600, 700, 800],
  },
  {
    id: "outfit",
    family: "Outfit",
    displayName: "Outfit",
    category: "sans",
    weights: [400, 500, 600, 700],
  },
];

export const DEFAULT_FONT = "inter";

export function normalizeFontKey(font: string | null | undefined): string {
  return (font ?? DEFAULT_FONT).trim() || DEFAULT_FONT;
}

export function getFontOptionById(
  fontId: string | null | undefined,
): FontOption {
  const key = normalizeFontKey(fontId);
  return FONT_OPTIONS.find((font) => font.id === key) ?? FONT_OPTIONS[0];
}

export function getGoogleFontImportUrl(
  fontId: string | null | undefined,
): string | null {
  const option = getFontOptionById(fontId);
  const weights = option.weights.join(";");
  const family = encodeURIComponent(option.family.replace(/\s+/g, "+"));
  return `https://fonts.googleapis.com/css2?family=${family}:wght@${weights}&display=swap`;
}

export function getFontFamily(fontId: string | null | undefined): string {
  return getFontOptionById(fontId).family;
}
