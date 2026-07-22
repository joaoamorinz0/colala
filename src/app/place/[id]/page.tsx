import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Phone,
  Globe,
  Instagram,
  Star,
  Navigation,
  ChevronRight,
} from "lucide-react";
import { Navbar } from "@/components/navigation/navbar";
import { APP_SHELL } from "@/constants/design";
import { cn } from "@/lib/utils";
import type { Place } from "@/types/place";
import { DescriptionExpander } from "@/components/place/description-expander";
import { FavoriteButton } from "@/components/place/favorite-button";
import { fetchPlaceById, fetchPlaces } from "@/services/places";
import { notFound } from "next/navigation";

// ─── Metadata ──────────────────────────────────────────────────────────────────
export async function generateMetadata({ params }: PlacePageProps) {
  const { id } = await params;
  const place = await fetchPlaceById(id);
  return {
    title: place?.name ?? "Local",
    description:
      place?.description ?? "Descubra este lugar incrível no Colalá.",
  };
}

// ─── Types ─────────────────────────────────────────────────────────────────────
type PlacePageProps = {
  params: Promise<{ id: string }>;
};

// ─── Helpers ───────────────────────────────────────────────────────────────────
function PriceLevel({ level }: { level: string | number | null }) {
  if (!level) return null;
  const num =
    typeof level === "number" ? level : parseInt(String(level), 10) || 1;
  const clamped = Math.min(Math.max(num, 1), 4);
  return (
    <span className="flex items-center gap-0.5 text-sm font-semibold text-amber-600">
      {Array.from({ length: clamped }, (_, i) => (
        <span key={i}>$</span>
      ))}
      {Array.from({ length: 4 - clamped }, (_, i) => (
        <span key={i} className="text-gray-300">
          $
        </span>
      ))}
    </span>
  );
}

function StarRating({ rating }: { rating: number | null }) {
  if (rating === null) {
    return (
      <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">
        Novo
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1">
      <Star className="size-4 fill-amber-400 text-amber-400" />
      <span className="text-sm font-bold text-gray-800">
        {rating.toFixed(1)}
      </span>
    </span>
  );
}

// ─── Chips ─────────────────────────────────────────────────────────────────────
type Chip = { label: string; icon: string };

function getChips(place: Place): Chip[] {
  const chips: Chip[] = [];
  if (place.featured) chips.push({ label: "Em destaque", icon: "🔥" });
  if (place.work_friendly)
    chips.push({ label: "Bom para trabalhar", icon: "💻" });
  if (place.wifi) chips.push({ label: "Wi-Fi", icon: "📶" });
  if (place.pet_friendly) chips.push({ label: "Pet Friendly", icon: "🐶" });
  if (place.sunset) chips.push({ label: "Pôr do Sol", icon: "🌇" });
  return chips;
}

// ─── Gallery ───────────────────────────────────────────────────────────────────
function Gallery({ images }: { images: string[] }) {
  if (!images.length) return null;
  return (
    <section className="space-y-3">
      <h2 className="text-base font-bold text-gray-900">Galeria</h2>
      <div className="-mx-5 flex scrollbar-none gap-3 overflow-x-auto px-5">
        {images.map((src, i) => (
          <div
            key={i}
            className="h-36 w-40 shrink-0 overflow-hidden rounded-2xl bg-gray-100"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={`Foto ${i + 1}`}
              className="size-full object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Info Row ──────────────────────────────────────────────────────────────────
function InfoRow({
  icon: Icon,
  label,
  href,
  external,
}: {
  icon: React.ElementType;
  label: string;
  href?: string;
  external?: boolean;
}) {
  const inner = (
    <div className="group flex items-center gap-3">
      <div className="group-hover:bg-primary/10 group-hover:text-primary flex size-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-600 transition-colors">
        <Icon className="size-4" />
      </div>
      <span className="flex-1 text-sm leading-snug text-gray-700">{label}</span>
      {href && (
        <ChevronRight className="group-hover:text-primary size-4 text-gray-400 transition-colors" />
      )}
    </div>
  );

  if (href) {
    return (
      <a
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        className="block"
      >
        {inner}
      </a>
    );
  }
  return inner;
}

// ─── Map Section ───────────────────────────────────────────────────────────────
function MapSection({
  lat,
  lng,
  name,
}: {
  lat: number;
  lng: number;
  name: string;
}) {
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

  return (
    <section className="space-y-3">
      <h2 className="text-base font-bold text-gray-900">Localização</h2>
      <a
        href={mapUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:ring-primary/40 block overflow-hidden rounded-2xl bg-gray-100 ring-1 ring-gray-200 transition-all"
      >
        {/* Fallback map placeholder — shows a nice gradient map-like tile */}
        <div className="relative h-36 w-full overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-green-50 to-teal-50" />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <div className="bg-primary/90 flex size-10 items-center justify-center rounded-full text-white shadow-lg">
              <MapPin className="size-5" />
            </div>
            <p className="line-clamp-2 max-w-[160px] text-center text-xs font-medium text-gray-600">
              {name}
            </p>
          </div>
          {/* Subtle grid lines to evoke a map */}
          <svg
            className="absolute inset-0 h-full w-full opacity-10"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern
                id="grid"
                width="30"
                height="30"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 30 0 L 0 0 0 30"
                  fill="none"
                  stroke="#6b7280"
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
      </a>
    </section>
  );
}

// ─── Related Places ────────────────────────────────────────────────────────────
async function RelatedPlaces({
  categoryId,
  currentId,
}: {
  categoryId: string | number | null;
  currentId: string;
}) {
  if (!categoryId) return null;

  const places = await fetchPlaces({
    categoryId: String(categoryId),
    limit: 6,
  });

  const filtered = places.filter((p) => p.id !== currentId).slice(0, 5);
  if (!filtered.length) return null;

  return (
    <section className="space-y-3">
      <h2 className="text-base font-bold text-gray-900">
        Você também pode gostar
      </h2>
      <div className="-mx-5 flex scrollbar-none gap-3 overflow-x-auto px-5">
        {filtered.map((place) => (
          <Link
            key={place.id}
            href={`/place/${place.id}`}
            className="group hover:ring-primary/30 w-40 shrink-0 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 transition-all"
          >
            <div className="aspect-[4/3] overflow-hidden bg-gray-100">
              {place.cover_image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={place.cover_image}
                  alt={place.name}
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex size-full items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50">
                  <MapPin className="size-6 text-orange-300" />
                </div>
              )}
            </div>
            <div className="p-3">
              <p className="line-clamp-1 text-xs font-bold text-gray-900">
                {place.name}
              </p>
              {place.city && (
                <p className="mt-0.5 line-clamp-1 text-xs text-gray-500">
                  {place.city}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default async function PlacePage({ params }: PlacePageProps) {
  const { id } = await params;
  const place = await fetchPlaceById(id);

  if (!place) {
    notFound();
  }

  const chips = getChips(place);
  const gallery = place.gallery ?? [];

  return (
    <div className={cn(APP_SHELL, "bg-background relative min-h-dvh")}>
      {/* ── HERO ── */}
      <div className="relative h-[45vh] max-h-[380px] min-h-[260px] w-full overflow-hidden">
        {place.cover_image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={place.cover_image}
            alt={place.name}
            className="size-full object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-gradient-to-br from-orange-100 via-amber-50 to-orange-200">
            <MapPin className="size-16 text-orange-300" />
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/70" />

        {/* Top bar — back & favorite */}
        <div className="pt-safe absolute inset-x-0 top-0 flex items-center justify-between p-4">
          <Link
            href="/"
            id="place-back-btn"
            aria-label="Voltar"
            className="flex size-11 items-center justify-center rounded-full bg-white/20 text-white shadow-lg ring-1 ring-white/30 backdrop-blur-xl transition-all hover:bg-white/30 active:scale-90"
          >
            <ArrowLeft className="size-5" />
          </Link>

          <FavoriteButton placeId={place.id} />
        </div>

        {/* Category + Name over hero */}
        <div className="absolute inset-x-0 bottom-0 p-5 pb-6">
          {place.category && (
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white/90 ring-1 ring-white/20 backdrop-blur-sm">
              {place.category.icon && <span>{place.category.icon}</span>}
              {place.category.name}
            </div>
          )}
          <h1 className="text-2xl leading-tight font-extrabold tracking-tight text-white drop-shadow-sm">
            {place.name}
          </h1>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="space-y-6 px-5 pt-5 pb-36">
        {/* Meta row: rating + city + price */}
        <div className="flex flex-wrap items-center gap-3">
          <StarRating rating={place.rating ?? null} />

          {(place.city || place.neighborhood) && (
            <span className="flex items-center gap-1 text-sm text-gray-500">
              <MapPin className="size-3.5 shrink-0" />
              {[place.neighborhood, place.city].filter(Boolean).join(" • ")}
            </span>
          )}

          <PriceLevel level={place.price_level} />
        </div>

        {/* Chips */}
        {chips.length > 0 && (
          <div className="-mx-5 flex scrollbar-none gap-2 overflow-x-auto px-5">
            {chips.map((chip) => (
              <span
                key={chip.label}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 shadow-sm"
              >
                <span>{chip.icon}</span>
                {chip.label}
              </span>
            ))}
          </div>
        )}

        <div className="h-px bg-gray-100" />

        {/* Description */}
        {place.description && (
          <>
            <section className="space-y-1.5">
              <h2 className="text-base font-bold text-gray-900">Sobre</h2>
              <DescriptionExpander text={place.description} />
            </section>
            <div className="h-px bg-gray-100" />
          </>
        )}

        {/* Info section */}
        {(place.address ||
          place.opening_hours ||
          place.instagram ||
          place.phone ||
          place.website) && (
          <>
            <section className="space-y-3">
              <h2 className="text-base font-bold text-gray-900">Informações</h2>
              <div className="space-y-4">
                {place.address && (
                  <InfoRow
                    icon={MapPin}
                    label={[place.address, place.city]
                      .filter(Boolean)
                      .join(", ")}
                  />
                )}
                {place.opening_hours && (
                  <InfoRow icon={Clock} label={place.opening_hours} />
                )}
                {place.phone && (
                  <InfoRow
                    icon={Phone}
                    label={place.phone}
                    href={`tel:${place.phone.replace(/\D/g, "")}`}
                  />
                )}
                {place.instagram && (
                  <InfoRow
                    icon={Instagram}
                    label={`@${place.instagram.replace(/^@/, "")}`}
                    href={`https://instagram.com/${place.instagram.replace(/^@/, "")}`}
                    external
                  />
                )}
                {place.website && (
                  <InfoRow
                    icon={Globe}
                    label={place.website.replace(/^https?:\/\//, "")}
                    href={place.website}
                    external
                  />
                )}
              </div>
            </section>
            <div className="h-px bg-gray-100" />
          </>
        )}

        {/* Gallery */}
        {gallery.length > 0 && (
          <>
            <Gallery images={gallery} />
            <div className="h-px bg-gray-100" />
          </>
        )}

        {/* Map */}
        {place.latitude && place.longitude && (
          <>
            <MapSection
              lat={place.latitude}
              lng={place.longitude}
              name={place.name}
            />
            <div className="h-px bg-gray-100" />
          </>
        )}

        {/* Related places */}
        <RelatedPlaces categoryId={place.category_id} currentId={place.id} />
      </div>

      {/* ── FIXED BOTTOM CTA ── */}
      {place.latitude && place.longitude && (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center">
          <div className={cn(APP_SHELL, "pointer-events-auto")}>
            <div className="px-5 pt-3 pb-6">
              <a
                id="place-directions-btn"
                href={`https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary shadow-primary/30 hover:bg-primary/90 flex w-full items-center justify-center gap-2.5 rounded-2xl py-4 text-sm font-bold text-white shadow-lg transition-all active:scale-[0.98]"
              >
                <Navigation className="size-5" />
                Como chegar
              </a>
            </div>
          </div>
        </div>
      )}

      <Navbar />
    </div>
  );
}
