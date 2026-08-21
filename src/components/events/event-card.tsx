import Link from "next/link";
import { CalendarClock, MapPin } from "lucide-react";
import { CARD_SURFACE } from "@/constants/design";
import { cn } from "@/lib/utils";
import {
  formatDayMonth,
  getEventLocationLabel,
  getEventPriceLabel,
} from "@/lib/event-format";
import type { Event } from "@/types/event";

export type EventCardProps = {
  event: Event;
  className?: string;
};

/**
 * Card de evento com data em destaque ("23 AGO"), visualmente
 * diferente dos cards de place.
 */
export function EventCard({ event, className }: EventCardProps) {
  const { day, month } = formatDayMonth(event.start_date);
  const locationLabel = getEventLocationLabel(event);
  const priceLabel = getEventPriceLabel(event);

  return (
    <Link href={`/events/${event.id}`} className={cn("block", className)}>
      <article
        className={cn(
          CARD_SURFACE,
          "group hover:shadow-soft flex gap-4 p-3 transition-all",
        )}
      >
        {/* Data em destaque */}
        <div className="bg-primary text-primary-foreground flex h-[72px] w-16 shrink-0 flex-col items-center justify-center rounded-xl">
          <span className="text-xl leading-none font-extrabold">{day}</span>
          <span className="mt-0.5 text-[11px] font-bold tracking-widest">
            {month}
          </span>
        </div>

        {/* Conteúdo */}
        <div className="min-w-0 flex-1">
          <h3 className="text-foreground group-hover:text-primary line-clamp-1 text-sm font-bold tracking-tight transition-colors">
            {event.name}
          </h3>

          {locationLabel && (
            <p className="text-muted-foreground mt-1 flex items-center gap-1 text-xs">
              <MapPin className="size-3 shrink-0" />
              <span className="line-clamp-1">{locationLabel}</span>
            </p>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {event.category && (
              <span className="border-border bg-muted inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold">
                {event.category.icon && <span>{event.category.icon}</span>}
                {event.category.name}
              </span>
            )}
            {event.is_recurring && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                <CalendarClock className="size-3" />
                Recorrente
              </span>
            )}
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold",
                priceLabel === "Gratuito"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-primary/10 text-primary",
              )}
            >
              {priceLabel}
            </span>
          </div>
        </div>

        {/* Capa pequena à direita */}
        {event.cover_image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={event.cover_image}
            alt=""
            className="hidden size-20 shrink-0 rounded-lg object-cover sm:block"
          />
        ) : null}
      </article>
    </Link>
  );
}
