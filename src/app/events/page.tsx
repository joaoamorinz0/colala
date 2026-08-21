import type { Metadata } from "next";
import { AuthLayout } from "@/components/layout";
import { EventsClient } from "@/components/events/events-client";
import { categoriesService } from "@/services/categories";

export const metadata: Metadata = {
  title: "Eventos",
  description: "Eventos em Brasília no Colalá.",
};

export default async function EventsPage() {
  const categories = await categoriesService.getAll().catch(() => []);

  return (
    <AuthLayout>
      <header className="gap-stack-sm flex flex-col">
        <h1 className="text-foreground text-2xl font-extrabold tracking-tight">
          Eventos
        </h1>
        <p className="text-muted-foreground text-sm">
          Veja o que tá rolando em Bsbê!
        </p>
      </header>

      <EventsClient categories={categories} />
    </AuthLayout>
  );
}
