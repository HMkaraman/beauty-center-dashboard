import { InvoiceDetailPage } from "@/components/invoices/invoice-detail-page";

export default async function InvoiceDetailRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <InvoiceDetailPage invoiceId={id} />;
}
