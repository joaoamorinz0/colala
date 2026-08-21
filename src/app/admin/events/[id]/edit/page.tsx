"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { AdminLayout, PageHeader, LoadingSpinner } from "@/components/admin";
import {
  EventForm,
  type EventFormSubmitPayload,
} from "@/components/admin/event-form";
import { fetchEventByIdAdmin, updateEvent } from "@/services/events.service";
import type { Event } from "@/types/event";
import { ArrowLeft } from "lucide-react";

export default function EditEventPage() {
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const params = useParams();
  const eventId = params?.id as string;

  useEffect(() => {
    const loadEvent = async () => {
      try {
        const data = await fetchEventByIdAdmin(eventId);
        setEvent(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erro ao carregar evento",
        );
      }
    };

    if (eventId) {
      loadEvent();
    }
  }, [eventId]);

  const handleSubmit = async (data: EventFormSubmitPayload) => {
    setIsLoading(true);
    try {
      await updateEvent(eventId, data);
      router.push("/admin/events");
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <AdminLayout>
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      </AdminLayout>
    );
  }

  if (!event) {
    return (
      <AdminLayout>
        <LoadingSpinner />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center gap-2">
        <Link
          href="/admin/events"
          className="text-primary hover:text-primary/80 flex items-center gap-2 transition-colors"
        >
          <ArrowLeft size={20} />
          Voltar
        </Link>
      </div>

      <PageHeader title="Editar Evento" description={event.name} />

      <EventForm
        initialData={event}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </AdminLayout>
  );
}
