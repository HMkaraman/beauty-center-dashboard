import { z } from "zod";

export const inventoryItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  sku: z.string().min(1, "SKU is required"),
  category: z.string().min(1, "Category is required"),
  quantity: z.number().nonnegative("Quantity must be zero or greater").int("Quantity must be a whole number"),
  unitPrice: z.number().nonnegative("Unit price must be zero or greater"),
  reorderLevel: z.number().nonnegative("Reorder level must be zero or greater").int("Reorder level must be a whole number").optional(),
});

export type InventoryItemFormData = z.infer<typeof inventoryItemSchema>;
