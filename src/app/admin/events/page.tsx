"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminLayout, PageHeader, LoadingSpinner } from "@/components/admin";
import {
  fetchAllEventsAdmin,
  deleteEvent,
  updateEvent,
} from "@/services/events.service";
import type { Event, EventStatus } from "@/types/event";
import { Edit2, Trash2, Plus, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDayMonth } from "@/lib/event-format";

const STATUS_CONFIG: Record<EventStatus, { label: string; className: string }> =
  {
    published: {
      label: "Publicado",
      className: "bg-emerald-100 text-emerald-700",
    },
    draft: { label: "Rascunho", className: "bg-amber-100 text-amber-700" },
  };

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const data = await fetchAllEventsAdmin();
        setEvents(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erro ao carregar eventos",
        );
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja deletar este evento?")) return;

    try {
      await deleteEvent(id);
      setEvents((prev) => prev.filter((event) => event.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao deletar evento");
    }
  };

  const handleStatusChange = async (id: string, status: EventStatus) => {
    try {
      await updateEvent(id, { status });
      setEvents((prev) =>
        prev.map((event) => (event.id === id ? { ...event, status } : event)),
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao alterar status");
    }
  };

  return (
    <AdminLayout>
      <PageHeader
        title="Eventos"
        description="Gerencie todos os eventos cadastrados"
        action={
          <Link
            href="/admin/events/new"
            className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 rounded-lg px-6 py-3 font-medium transition-colors"
          >
            <Plus size={20} />
            Novo Evento
          </Link>
        }
      />

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : events.length === 0 ? (
        <div className="border-border bg-card rounded-lg border p-12 text-center">
          <p className="text-muted-foreground">
            Nenhum evento cadastrado ainda
          </p>
          <Link
            href="/admin/events/new"
            className="bg-primary text-primary-foreground hover:bg-primary/90 mt-4 inline-block rounded-lg px-6 py-2 font-medium transition-colors"
          >
            Criar primeiro evento
          </Link>
        </div>
      ) : (
        <div className="border-border bg-card overflow-hidden rounded-lg border shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted border-border border-b">
                <tr>
                  <th className="text-foreground px-6 py-3 text-left text-sm font-semibold">
                    Nome
                  </th>
                  <th className="text-foreground px-6 py-3 text-left text-sm font-semibold">
                    Data
                  </th>
                  <th className="text-foreground px-6 py-3 text-left text-sm font-semibold">
                    Status
                  </th>
                  <th className="text-foreground px-6 py-3 text-left text-sm font-semibold">
                    Preço
                  </th>
                  <th className="text-foreground px-6 py-3 text-right text-sm font-semibold">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => {
                  const statusKey = (event.status ?? "draft") as EventStatus;
                  const statusCfg = STATUS_CONFIG[statusKey];
                  const { day, month } = formatDayMonth(event.start_date);

                  return (
                    <tr
                      key={event.id}
                      className="border-border hover:bg-muted/50 border-b transition-colors"
                    >
                      <td className="text-foreground px-6 py-4 text-sm font-medium">
                        {event.name}
                      </td>
                      <td className="text-muted-foreground px-6 py-4 text-sm">
                        {day} {month}
                        {event.is_recurring && " · recorrente"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                              statusCfg.className,
                            )}
                          >
                            {statusCfg.label}
                          </span>
                          <div className="flex gap-0.5">
                            {(["published", "draft"] as EventStatus[]).map(
                              (s) => {
                                if (s === statusKey) return null;
                                const icons = {
                                  published: <Check className="size-3.5" />,
                                  draft: <X className="size-3.5" />,
                                };
                                return (
                                  <button
                                    key={s}
                                    onClick={() =>
                                      handleStatusChange(event.id, s)
                                    }
                                    className="text-muted-foreground hover:text-foreground rounded p-0.5 transition-colors"
                                    title={
                                      s === "published"
                                        ? "Publicar"
                                        : "Despublicar"
                                    }
                                  >
                                    {icons[s]}
                                  </button>
                                );
                              },
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="text-muted-foreground px-6 py-4 text-sm">
                        {event.is_free || !event.price
                          ? "Gratuito"
                          : `R$ ${event.price.toFixed(2).replace(".", ",")}`}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-3">
                          <Link
                            href={`/admin/events/${event.id}/edit`}
                            className="text-primary hover:text-primary/80 transition-colors"
                          >
                            <Edit2 size={18} />
                          </Link>
                          <button
                            onClick={() => handleDelete(event.id)}
                            className="text-destructive hover:text-destructive/80 transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
