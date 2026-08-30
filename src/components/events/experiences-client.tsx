"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays } from "lucide-react";
import { CategoryChip } from "@/components/search/category-chip";
import { EmptyState } from "@/components/layout/empty-state";
import { LIST_STACK, SECTION_GAP, SECTION_STACK } from "@/constants/design";
import { cn } from "@/lib/utils";
import { fetchEvents } from "@/services/events.service";
import type { Category } from "@/types/category";
import type { Event } from "@/types/event";
import { EventCard } from "@/components/events/event-card";

type ExperiencesClientProps = {
  categories: Category[];
};

export function ExperiencesClient({ categories }: ExperiencesClientProps) {
  const [categoryId, setCategoryId] = useState<string | null>(null);

  const eventsQuery = useQuery({
    queryKey: ["experiences-events", categoryId],
    queryFn: () =>
      fetchEvents({
        categoryId,
        upcomingOnly: true,
      }),
  });

  const filteredEvents = useMemo(() => {
    const events = eventsQuery.data ?? [];
    return events;
  }, [eventsQuery.data]);

  return (
    <div className={cn(SECTION_STACK, "pb-navbar")}>
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
                categoryId === String(category.id) ? null : String(category.id),
              )
            }
          >
            {category.name}
          </CategoryChip>
        ))}
      </div>

      <section className={SECTION_GAP}>
        {eventsQuery.isLoading ? (
          <div className="border-border bg-card text-muted-foreground rounded-card-lg p-card border text-sm">
            Carregando experiências...
          </div>
        ) : eventsQuery.isError ? (
          <EmptyState
            title="Erro ao carregar"
            description="Não foi possível carregar as experiências agora. Tente novamente."
          />
        ) : filteredEvents.length ? (
          <div className={LIST_STACK}>
            {filteredEvents.map((event: Event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Nenhuma experiência encontrada"
            description="Não há experiências para este filtro no momento."
          />
        )}
      </section>
    </div>
  );
}
