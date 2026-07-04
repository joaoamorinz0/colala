import { AuthLayout } from "@/components/layout";
import { EmptyState } from "@/components/layout/empty-state";

export default function SearchPage() {
  return (
    <AuthLayout>
      <EmptyState title="Search" description="Placeholder da busca." />
    </AuthLayout>
  );
}
