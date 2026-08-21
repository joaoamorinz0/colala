"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AdminLayout, PageHeader } from "@/components/admin";
import {
  EventForm,
  type EventFormSubmitPayload,
} from "@/components/admin/event-form";
import { createEvent } from "@/services/events.service";
import { ArrowLeft } from "lucide-react";

export default function NewEventPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (data: EventFormSubmitPayload) => {
    setIsLoading(true);
    try {
      await createEvent(data);
      router.push("/admin/events");
    } finally {
      setIsLoading(false);
    }
  };

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

      <PageHeader
        title="Novo Evento"
        description="Adicione um novo evento ao catálogo"
      />

      <EventForm onSubmit={handleSubmit} isLoading={isLoading} />
    </AdminLayout>
  );
}
