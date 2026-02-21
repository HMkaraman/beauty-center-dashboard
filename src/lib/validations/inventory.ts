import { z } from "zod";

export const inventoryItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  nameEn: z.string().optional(),
  brand: z.string().optional(),
  sku: z.string().min(1, "SKU is required"),
  barcode: z.string().optional(),
  description: z.string().optional(),
  image: z.string().optional().nullable(),
  categoryId: z.string().min(1, "Category is required"),
  category: z.string().optional(),
  productType: z.enum(["injectable", "skincare", "consumable", "retail", "equipment", "device_supply", "medication", "chemical"]).optional().nullable(),
  unitOfMeasure: z.enum(["units", "ml", "cc", "syringe", "vial", "piece", "box", "g", "bottle", "tube", "ampule", "sachet"]).optional().nullable(),
  unitsPerPackage: z.number().int().positive().optional().nullable(),
  quantity: z.number().nonnegative("Quantity must be zero or greater").int("Quantity must be a whole number"),
  reorderLevel: z.number().nonnegative("Reorder level must be zero or greater").int("Reorder level must be a whole number").optional().nullable(),
  costPrice: z.number().min(0).optional().nullable(),
  unitPrice: z.number().nonnegative("Unit price must be zero or greater"),
  expiryDate: z.string().optional().nullable(),
  batchNumber: z.string().optional().nullable(),
  isRetail: z.boolean().optional(),
  isActive: z.boolean().optional(),
  supplierName: z.string().optional().nullable(),
  storageConditions: z.enum(["ambient", "refrigerated", "frozen"]).optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const inventoryCategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  nameEn: z.string().optional(),
  description: z.string().optional(),
  color: z.string().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export type InventoryItemFormData = z.infer<typeof inventoryItemSchema>;
export type InventoryCategoryFormData = z.infer<typeof inventoryCategorySchema>;
