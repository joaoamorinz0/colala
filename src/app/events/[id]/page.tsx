import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarClock,
  CalendarDays,
  ChevronRight,
  Globe,
  Instagram,
  MapPin,
  Phone,
  Repeat,
  Ticket,
  User,
} from "lucide-react";
import { Navbar } from "@/components/navigation/navbar";
import { APP_SHELL } from "@/constants/design";
import { cn } from "@/lib/utils";
import {
  formatDayMonth,
  formatEventDateLabel,
  formatRecurrenceLabel,
  getEventPriceLabel,
} from "@/lib/event-format";
import { fetchEventById } from "@/services/events.service";

type EventPageProps = {
  params: Promise<{ id: string }>;
};

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
      <span className="flex-1 text-sm leading-snug break-words text-gray-700">
        {label}
      </span>
      {href && (
        <ChevronRight className="group-hover:text-primary size-4 shrink-0 text-gray-400 transition-colors" />
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

export async function generateMetadata({
  params,
}: EventPageProps): Promise<Metadata> {
  const { id } = await params;
  const event = await fetchEventById(id);
  return {
    title: event?.name ?? "Evento",
    description: event?.description ?? "Descubra este evento no Colalá.",
  };
}

export default async function EventPage({ params }: EventPageProps) {
  const { id } = await params;
  const event = await fetchEventById(id);

  if (!event) {
    notFound();
  }

  const { day, month } = formatDayMonth(event.start_date);
  const dateLabel = formatEventDateLabel(event);
  const recurrenceLabel = formatRecurrenceLabel(event);
  const priceLabel = getEventPriceLabel(event);
  const isFree = priceLabel === "Gratuito";

  return (
    <div className={cn(APP_SHELL, "bg-background relative min-h-dvh")}>
      {/* ── HERO ── */}
      <div className="relative h-[40vh] max-h-[360px] min-h-[240px] w-full overflow-hidden">
        {event.cover_image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={event.cover_image}
            alt={event.name}
            className="size-full object-cover"
          />
        ) : (
          <div className="bg-primary/10 flex size-full items-center justify-center">
            <CalendarDays className="text-primary/40 size-16" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/70" />

        <div className="pt-safe absolute inset-x-0 top-0 flex items-center justify-between p-4">
          <Link
            href="/events"
            aria-label="Voltar para eventos"
            className="flex size-11 items-center justify-center rounded-full bg-white/20 text-white shadow-lg ring-1 ring-white/30 backdrop-blur-xl transition-all hover:bg-white/30 active:scale-90"
          >
            <ArrowLeft className="size-5" />
          </Link>
        </div>

        <div className="absolute inset-x-0 bottom-0 p-5 pb-6">
          {event.category && (
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white/90 ring-1 ring-white/20 backdrop-blur-sm">
              {event.category.icon && <span>{event.category.icon}</span>}
              {event.category.name}
            </div>
          )}
          <h1 className="text-2xl leading-tight font-extrabold tracking-tight text-white drop-shadow-sm">
            {event.name}
          </h1>
        </div>
      </div>

      {/* ── CONTEÚDO ── */}
      <div className="space-y-6 px-5 pt-5 pb-16">
        {/* Data + preço */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="bg-primary text-primary-foreground flex size-14 shrink-0 flex-col items-center justify-center rounded-2xl">
              <span className="text-xl leading-none font-extrabold">{day}</span>
              <span className="mt-0.5 text-[10px] font-bold tracking-widest">
                {month}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-foreground text-sm font-bold">{dateLabel}</p>
              {recurrenceLabel && (
                <p className="text-primary mt-1 flex items-center gap-1 text-xs font-semibold">
                  <Repeat className="size-3.5 shrink-0" />
                  {recurrenceLabel}
                </p>
              )}
            </div>
          </div>

          <span
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold",
              isFree
                ? "bg-emerald-100 text-emerald-700"
                : "bg-primary/10 text-primary",
            )}
          >
            <Ticket className="size-4" />
            {priceLabel}
          </span>
        </div>

        {/* Local */}
        <section className="space-y-3">
          <h2 className="text-foreground text-base font-bold">Local</h2>
          {event.place ? (
            <Link
              href={`/place/${event.place.id}`}
              className="group border-border bg-card hover:shadow-soft flex items-center gap-3 rounded-2xl border p-3 transition-all"
            >
              <div className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-xl">
                <MapPin className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-muted-foreground text-xs">Realizado em</p>
                <p className="text-foreground group-hover:text-primary text-sm font-bold transition-colors">
                  {event.place.name}
                </p>
              </div>
              <ChevronRight className="text-muted-foreground group-hover:text-primary size-4 shrink-0 transition-colors" />
            </Link>
          ) : (
            <InfoRow
              icon={MapPin}
              label={
                [event.location_name, event.address, event.city]
                  .filter(Boolean)
                  .join(", ") || "Local a definir"
              }
            />
          )}
        </section>

        <div className="h-px bg-gray-100" />

        {/* Descrição */}
        {event.description && (
          <>
            <section className="space-y-1.5">
              <h2 className="text-foreground text-base font-bold">Sobre</h2>
              <p className="text-foreground/80 text-sm leading-relaxed whitespace-pre-line">
                {event.description}
              </p>
            </section>
            <div className="h-px bg-gray-100" />
          </>
        )}

        {/* Organizador */}
        {(event.organizer_name || event.organizer_instagram) && (
          <>
            <section className="space-y-3">
              <h2 className="text-foreground text-base font-bold">
                Organização
              </h2>
              {event.organizer_name && (
                <InfoRow icon={User} label={event.organizer_name} />
              )}
              {event.organizer_instagram && (
                <InfoRow
                  icon={Instagram}
                  label={`@${event.organizer_instagram.replace(/^@/, "")}`}
                  href={`https://instagram.com/${event.organizer_instagram.replace(/^@/, "")}`}
                  external
                />
              )}
            </section>
            <div className="h-px bg-gray-100" />
          </>
        )}

        {/* Redes e contatos do evento */}
        {(event.instagram || event.website || event.phone) && (
          <>
            <section className="space-y-3">
              <h2 className="text-foreground text-base font-bold">
                Contatos do evento
              </h2>
              {event.instagram && (
                <InfoRow
                  icon={Instagram}
                  label={`@${event.instagram.replace(/^@/, "")}`}
                  href={`https://instagram.com/${event.instagram.replace(/^@/, "")}`}
                  external
                />
              )}
              {event.website && (
                <InfoRow
                  icon={Globe}
                  label={event.website.replace(/^https?:\/\//, "")}
                  href={event.website}
                  external
                />
              )}
              {event.phone && (
                <InfoRow
                  icon={Phone}
                  label={event.phone}
                  href={`tel:${event.phone.replace(/\D/g, "")}`}
                />
              )}
            </section>
            <div className="h-px bg-gray-100" />
          </>
        )}

        {/* Informações adicionais */}
        {event.additional_info && (
          <section className="space-y-1.5">
            <h2 className="text-foreground text-base font-bold">
              Informações adicionais
            </h2>
            <p className="text-foreground/80 text-sm leading-relaxed whitespace-pre-line">
              {event.additional_info}
            </p>
          </section>
        )}

        {event.is_recurring && event.recurrence_end_date && (
          <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
            <CalendarClock className="size-3.5 shrink-0" />
            Ocorre até{" "}
            {new Intl.DateTimeFormat("pt-BR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            }).format(new Date(`${event.recurrence_end_date}T12:00:00`))}
          </p>
        )}
      </div>

      <Navbar />
    </div>
  );
}
