/**
 * Design System tokens as reusable Tailwind class fragments.
 * Prefer these over one-off spacing/radius values across the UI.
 *
 * Reference frame: 390×844 (iOS). Content max-width: 430px.
 */

/** Shell: centers the app column on larger screens. */
export const APP_SHELL = "mx-auto w-full max-w-app" as const;

/** Horizontal page gutter (matches navbar padding). */
export const PAGE_X = "px-page-x" as const;

/** Top padding for main content. */
export const PAGE_Y = "pt-page-y" as const;

/** Bottom padding so fixed navbar never covers content. */
export const PAGE_BOTTOM = "pb-navbar" as const;

/** Standard main content padding inside MainLayout. */
export const MAIN_PADDING = `${PAGE_X} ${PAGE_Y} ${PAGE_BOTTOM}` as const;

/** Vertical stack between major page sections. */
export const SECTION_STACK = "space-y-section" as const;

/** Vertical stack inside a section (header → content). */
export const SECTION_GAP = "space-y-stack-md" as const;

/** Tight list stack (cards, form fields). */
export const LIST_STACK = "space-y-stack-sm" as const;

/** Shared elevated card surface (Apple/Airbnb soft card). */
export const CARD_SURFACE =
  "border-border bg-card shadow-card overflow-hidden rounded-card border" as const;

/** Larger hero/featured surface radius. */
export const CARD_SURFACE_LG =
  "border-border bg-card shadow-soft overflow-hidden rounded-card-lg border" as const;

/** Soft surface without border (photo-first hero). */
export const CARD_SURFACE_SOFT =
  "bg-muted shadow-soft overflow-hidden rounded-card-lg" as const;

/** Fixed-width medium card used in horizontal carousels. */
export const MEDIUM_CARD_WIDTH = "w-medium-card shrink-0" as const;

/** Consistent horizontal list row height. */
export const HORIZONTAL_CARD_HEIGHT = "h-horizontal-card" as const;

/** Media fill: keep aspect, crop overflow (use on img or media wrapper children). */
export const MEDIA_COVER =
  "size-full object-cover [&>img]:size-full [&>img]:object-cover" as const;

/** Pill / chip radius. */
export const RADIUS_PILL = "rounded-full" as const;

/** Primary interactive control height (search, auth fields). */
export const CONTROL_HEIGHT = "h-control" as const;
