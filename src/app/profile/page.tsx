import { AuthLayout } from "@/components/layout";
import { EmptyState } from "@/components/layout/empty-state";

export default function ProfilePage() {
  return (
    <AuthLayout>
      <EmptyState title="Profile" description="Placeholder do perfil." />
    </AuthLayout>
  );
}
