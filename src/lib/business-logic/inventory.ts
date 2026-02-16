import { db } from "@/db/db";
import { serviceInventoryRequirements, inventoryItems, inventoryTransactions } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

// Check if service has enough inventory for all required items
export async function checkInventoryForService(serviceId: string): Promise<{
  sufficient: boolean;
  shortages: Array<{ itemName: string; required: number; available: number }>;
}> {
  const requirements = await db
    .select({
      inventoryItemId: serviceInventoryRequirements.inventoryItemId,
      quantityRequired: serviceInventoryRequirements.quantityRequired,
      itemName: inventoryItems.name,
      available: inventoryItems.quantity,
    })
    .from(serviceInventoryRequirements)
    .innerJoin(inventoryItems, eq(inventoryItems.id, serviceInventoryRequirements.inventoryItemId))
    .where(eq(serviceInventoryRequirements.serviceId, serviceId));

  const shortages = requirements
    .filter(r => r.available < r.quantityRequired)
    .map(r => ({
      itemName: r.itemName,
      required: r.quantityRequired,
      available: r.available,
    }));

  return {
    sufficient: shortages.length === 0,
    shortages,
  };
}

// Deduct inventory when appointment is completed
export async function deductInventoryForService(params: {
  tenantId: string;
  serviceId: string;
  appointmentId: string;
}): Promise<void> {
  const requirements = await db
    .select()
    .from(serviceInventoryRequirements)
    .where(eq(serviceInventoryRequirements.serviceId, params.serviceId));

  for (const req of requirements) {
    // Deduct quantity
    await db
      .update(inventoryItems)
      .set({
        quantity: sql`${inventoryItems.quantity} - ${req.quantityRequired}`,
        updatedAt: new Date(),
      })
      .where(eq(inventoryItems.id, req.inventoryItemId));

    // Create inventory transaction record
    await db.insert(inventoryTransactions).values({
      tenantId: params.tenantId,
      itemId: req.inventoryItemId,
      type: "deduction",
      quantity: -req.quantityRequired,
      reason: `Service appointment ${params.appointmentId}`,
      appointmentId: params.appointmentId,
    });

    // Update status based on quantity
    const [item] = await db
      .select({ quantity: inventoryItems.quantity, reorderLevel: inventoryItems.reorderLevel })
      .from(inventoryItems)
      .where(eq(inventoryItems.id, req.inventoryItemId));

    if (item) {
      let newStatus: "in-stock" | "low-stock" | "out-of-stock" = "in-stock";
      if (item.quantity <= 0) newStatus = "out-of-stock";
      else if (item.reorderLevel && item.quantity <= item.reorderLevel) newStatus = "low-stock";

      await db
        .update(inventoryItems)
        .set({ status: newStatus })
        .where(eq(inventoryItems.id, req.inventoryItemId));
    }
  }
}
