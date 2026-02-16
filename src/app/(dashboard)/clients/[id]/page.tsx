import { ClientDetailPage } from "@/components/clients/client-detail-page";

export default async function ClientDetailRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ClientDetailPage clientId={id} />;
}
