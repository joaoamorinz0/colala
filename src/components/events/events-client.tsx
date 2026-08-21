"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays } from "lucide-react";
import { CategoryChip } from "@/components/search/category-chip";
import { EmptyState } from "@/components/layout/empty-state";
import { LIST_STACK, SECTION_GAP, SECTION_STACK } from "@/constants/design";
import { cn } from "@/lib/utils";
import { parseEventDate } from "@/lib/event-format";
import { fetchEvents } from "@/services/events.service";
import type { Category } from "@/types/category";
import type { Event } from "@/types/event";
import { EventCard } from "@/components/events/event-card";

export type EventQuickFilter = "all" | "today" | "tomorrow" | "weekend";

const QUICK_FILTERS: { value: EventQuickFilter; label: string }[] = [
  { value: "today", label: "Hoje" },
  { value: "tomorrow", label: "Amanhã" },
  { value: "weekend", label: "Este fim de semana" },
];

function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Domingo(0) e sábado(6). */
function isWeekend(dateStr: string): boolean {
  const day = parseEventDate(dateStr).getDay();
  return day === 0 || day === 6;
}

export function matchesQuickFilter(
  event: Event,
  filter: EventQuickFilter,
): boolean {
  if (filter === "all") return true;

  const today = new Date();
  const todayIso = toIsoDate(today);
  const tomorrowIso = toIsoDate(
    new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
  );

  switch (filter) {
    case "today":
      return event.start_date === todayIso;
    case "tomorrow":
      return event.start_date === tomorrowIso;
    case "weekend":
      return isWeekend(event.start_date);
    default:
      return true;
  }
}

type EventsClientProps = {
  categories: Category[];
};

export function EventsClient({ categories }: EventsClientProps) {
  const [quickFilter, setQuickFilter] = useState<EventQuickFilter>("all");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [freeOnly, setFreeOnly] = useState(false);

  const eventsQuery = useQuery({
    queryKey: ["events", categoryId, freeOnly],
    queryFn: () => fetchEvents({ categoryId, freeOnly }),
  });

  const filteredEvents = useMemo(() => {
    const events = eventsQuery.data ?? [];
    return events.filter((event) => matchesQuickFilter(event, quickFilter));
  }, [eventsQuery.data, quickFilter]);

  return (
    <div className={cn(SECTION_STACK, "pb-navbar")}>
      {/* Filtros rápidos */}
      <div className="-mx-page-x gap-stack-sm px-page-x flex scrollbar-none overflow-x-auto pb-0.5">
        <CategoryChip
          active={quickFilter === "all" && !freeOnly}
          onClick={() => setQuickFilter("all")}
        >
          Próximos
        </CategoryChip>
        {QUICK_FILTERS.map((filter) => (
          <CategoryChip
            key={filter.value}
            active={quickFilter === filter.value}
            onClick={() => setQuickFilter(filter.value)}
          >
            {filter.label}
          </CategoryChip>
        ))}
        <CategoryChip
          active={freeOnly}
          onClick={() => setFreeOnly((prev) => !prev)}
        >
          Gratuitos
        </CategoryChip>
      </div>

      {/* Categorias */}
      {categories.length > 0 && (
        <div className="-mx-page-x gap-stack-sm px-page-x flex scrollbar-none overflow-x-auto pb-0.5">
          <CategoryChip
            active={categoryId === null}
            icon={<CalendarDays className="size-4" />}
            onClick={() => setCategoryId(null)}
          >
            Todas
          </CategoryChip>
          {categories.map((category) => (
            <CategoryChip
              key={String(category.id)}
              active={categoryId === String(category.id)}
              icon={category.icon ? <span>{category.icon}</span> : undefined}
              onClick={() =>
                setCategoryId(
                  categoryId === String(category.id)
                    ? null
                    : String(category.id),
                )
              }
            >
              {category.name}
            </CategoryChip>
          ))}
        </div>
      )}

      {/* Lista */}
      <section className={SECTION_GAP}>
        {eventsQuery.isLoading ? (
          <div className="border-border bg-card text-muted-foreground rounded-card-lg p-card border text-sm">
            Carregando eventos...
          </div>
        ) : eventsQuery.isError ? (
          <EmptyState
            title="Erro ao carregar"
            description="Não foi possível carregar os eventos agora. Tente novamente."
          />
        ) : filteredEvents.length ? (
          <div className={LIST_STACK}>
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Nenhum evento encontrado"
            description="Não há eventos para este filtro no momento."
          />
        )}
      </section>
    </div>
  );
}
