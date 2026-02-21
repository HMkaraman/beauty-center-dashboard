import { InventoryItemFormPage } from "@/components/inventory/inventory-item-form-page";

export default async function EditInventoryItemRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <InventoryItemFormPage itemId={id} />;
}
