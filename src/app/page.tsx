import { MainLayout } from "@/components/layout";
import { EmptyState } from "@/components/layout/empty-state";

export default function IndexPage() {
  return (
    <MainLayout>
      <EmptyState
        title="Colalá"
        description="Descoberta mobile-first de cafés, restaurantes, bares e experiências."
      />
    </MainLayout>
  );
}
