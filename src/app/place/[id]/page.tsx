import { AuthLayout } from "@/components/layout";
import { EmptyState } from "@/components/layout/empty-state";

type PlacePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function PlacePage({ params }: PlacePageProps) {
  const { id } = await params;

  return (
    <AuthLayout>
      <EmptyState
        title="Place"
        description={`Placeholder da experiência ${id}.`}
      />
    </AuthLayout>
  );
}
