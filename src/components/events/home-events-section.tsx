"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, ChevronRight } from "lucide-react";
import { EventCard } from "@/components/events/event-card";
import { SECTION_GAP } from "@/constants/design";
import { fetchEvents } from "@/services/events.service";

/**
 * Seção "Eventos em Brasília" da Home: mostra até 3 eventos publicados
 * mais próximos (start_date >= hoje). Omitida quando não há eventos.
 */
export function HomeEventsSection() {
  const eventsQuery = useQuery({
    queryKey: ["home-events"],
    queryFn: () => fetchEvents({ limit: 3 }),
  });

  const events = eventsQuery.data ?? [];

  if (eventsQuery.isLoading || events.length === 0) {
    return null;
  }

  return (
    <section className={SECTION_GAP}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <CalendarDays className="text-primary size-5 shrink-0" />
          <h2 className="text-foreground text-xl font-extrabold tracking-tight">
            Eventos em Brasília
          </h2>
        </div>
        <Link
          href="/events"
          className="text-primary hover:text-primary/80 flex shrink-0 items-center gap-0.5 text-sm font-semibold transition-colors"
        >
          Ver todos
          <ChevronRight className="size-4" />
        </Link>
      </div>

      <div className="space-y-stack-sm">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </section>
  );
}
