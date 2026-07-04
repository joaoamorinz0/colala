import { PublicLayout } from "@/components/layout";
import { EmptyState } from "@/components/layout/empty-state";

export default function LoginPage() {
  return (
    <PublicLayout>
      <EmptyState title="Login" description="Placeholder do login." />
    </PublicLayout>
  );
}
