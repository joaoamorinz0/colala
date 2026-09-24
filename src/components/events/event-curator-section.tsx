import type { Collaborator } from "@/types/collaborator";
import { ArrowUpRight, Globe, Instagram } from "lucide-react";
import { getFontOptionById } from "@/lib/font-catalog";
import { GoogleFontLoader } from "@/components/ui/google-font-loader";

export type EventCuratorSectionProps = {
  curators: Collaborator[];
};

function toSafeUrl(value: string | null | undefined): string {
  const trimmed = value?.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function toInstagramUrl(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  const normalized = trimmed
    .replace(/^@/, "")
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/^instagram\.com\//i, "");

  if (!normalized) return null;
  return `https://instagram.com/${normalized}`;
}

function getDisplayName(name: string | null | undefined): string {
  return name?.trim() || "Curadoria";
}

export function EventCuratorSection({ curators }: EventCuratorSectionProps) {
  if (!curators.length) return null;

  return (
    <section className="space-y-4">
      <GoogleFontLoader
        fonts={curators.map((curator) => curator.font_family ?? undefined)}
      />
      <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.2em] uppercase">
        COM CURADORIA DE
      </p>

      <div className="space-y-4">
        {curators.map((curator) => {
          const font = getFontOptionById(curator.font_family ?? undefined);
          const primary = curator.cor_primaria || "#0F2A33";
          const secondary = curator.cor_secundaria || "#D85A30";
          const siteUrl = curator.website_url
            ? toSafeUrl(curator.website_url)
            : "";
          const instagramUrl = toInstagramUrl(
            curator.instagram_url ?? curator.instagram ?? null,
          );
          const profileUrl = siteUrl || instagramUrl || "";
          const description = curator.short_description?.trim();
          const logo = curator.logo_url || curator.avatar_url;
          const displayLabel = siteUrl
            ? "Conheça o site"
            : instagramUrl
              ? "Conheça a curadoria"
              : "Curadoria";

          const content = (
            <div
              className="rounded-[24px] border border-black/5 p-4 shadow-sm"
              style={{ backgroundColor: primary }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/30 bg-white/10 text-sm font-bold text-white"
                  style={{ backgroundColor: secondary }}
                >
                  {logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={logo}
                      alt={getDisplayName(curator.nome)}
                      className="size-full object-cover"
                    />
                  ) : (
                    getDisplayName(curator.nome)
                      .split(" ")
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p
                    className="text-[0.7rem] tracking-[0.18em] text-white/70 uppercase"
                    style={{ fontFamily: font.family }}
                  >
                    Curadoria
                  </p>
                  <h3
                    className="mt-1 text-xl leading-none font-semibold text-white"
                    style={{ fontFamily: font.family }}
                  >
                    {getDisplayName(curator.nome)}
                  </h3>

                  {description && (
                    <p className="mt-2 text-sm leading-relaxed text-white/80">
                      {description}
                    </p>
                  )}

                  <div className="mt-3 flex flex-col gap-2 text-xs text-white/80">
                    {instagramUrl && (
                      <a
                        href={instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 underline-offset-2 hover:underline"
                      >
                        <Instagram className="size-3.5" />
                        <span>
                          {instagramUrl
                            .replace(/^https?:\/\//, "")
                            .replace(/^www\./, "")}
                        </span>
                      </a>
                    )}
                    {siteUrl && (
                      <a
                        href={siteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 underline-offset-2 hover:underline"
                      >
                        <Globe className="size-3.5" />
                        <span>
                          {siteUrl
                            .replace(/^https?:\/\//, "")
                            .replace(/^www\./, "")}
                        </span>
                      </a>
                    )}
                  </div>

                  {profileUrl && (
                    <div className="mt-4 flex items-center gap-1.5 text-sm font-medium text-white/90">
                      <span>{displayLabel}</span>
                      <ArrowUpRight className="size-4" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );

          if (!profileUrl) {
            return <div key={curator.id}>{content}</div>;
          }

          return (
            <a
              key={curator.id}
              href={profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block transition-opacity hover:opacity-95 focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:outline-none"
            >
              {content}
            </a>
          );
        })}
      </div>
    </section>
  );
}
