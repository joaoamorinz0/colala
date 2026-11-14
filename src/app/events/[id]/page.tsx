import { redirect } from "next/navigation";

type EventPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EventPage({ params }: EventPageProps) {
  const { id } = await params;
  redirect(`/experiencias/${id}`);
}
