import { AuthLayout } from "@/components/layout";
import { EmptyState } from "@/components/layout/empty-state";

export default function FavoritesPage() {
  return (
    <AuthLayout>
      <EmptyState title="Favorites" description="Placeholder dos favoritos." />
    </AuthLayout>
  );
}
