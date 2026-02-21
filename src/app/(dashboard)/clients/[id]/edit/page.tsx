import { ClientFormPage } from "@/components/clients/client-form-page";

export default async function EditClientRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ClientFormPage clientId={id} />;
}
