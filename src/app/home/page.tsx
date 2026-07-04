import { AuthLayout } from "@/components/layout";
import { EmptyState } from "@/components/layout/empty-state";

export default function HomePage() {
  return (
    <AuthLayout>
      <EmptyState title="Home" description="Placeholder da página inicial." />
    </AuthLayout>
  );
}
