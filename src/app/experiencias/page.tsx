import type { Metadata } from "next";
import { AuthLayout } from "@/components/layout";
import { ExperiencesClient } from "@/components/events/experiences-client";
import { categoriesService } from "@/services/categories";

export const metadata: Metadata = {
  title: "Experiências",
  description: "Feiras, oficinas, gastronomia, música e arte em Brasília.",
};

export default async function ExperienciasPage() {
  const categories = await categoriesService.getAll().catch(() => []);
  const experienciasParent = categories.find(
    (category) => category.slug === "experiencias",
  );
  const subcategories = experienciasParent
    ? categories
        .filter((category) => category.parent_id === experienciasParent.id)
        .sort((left, right) => {
          const leftOrder = left.sort_order ?? 0;
          const rightOrder = right.sort_order ?? 0;
          if (leftOrder !== rightOrder) return leftOrder - rightOrder;
          return left.name.localeCompare(right.name);
        })
    : [];

  return (
    <AuthLayout>
      <header className="gap-stack-sm flex flex-col">
        <h1 className="text-foreground text-2xl font-extrabold tracking-tight">
          Experiências
        </h1>
        <p className="text-muted-foreground text-sm">
          Descubra feiras, oficinas, gastronomia, música e arte por aqui!
        </p>
      </header>

      <ExperiencesClient categories={subcategories} />
    </AuthLayout>
  );
}
