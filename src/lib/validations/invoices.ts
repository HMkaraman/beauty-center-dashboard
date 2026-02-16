import { z } from "zod";

export const invoiceItemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  quantity: z.number().positive("Quantity must be a positive number"),
  unitPrice: z.number().nonnegative("Unit price must be zero or greater"),
  discount: z.number().nonnegative("Discount must be zero or greater").default(0),
  total: z.number().nonnegative("Total must be zero or greater"),
});

export const invoiceSchema = z.object({
  date: z.string(),
  clientName: z.string().min(1, "Client name is required"),
  clientPhone: z.string().optional(),
  appointmentId: z.string().optional(),
  items: z.array(invoiceItemSchema).min(1, "At least one item is required"),
  subtotal: z.number(),
  taxRate: z.number(),
  taxAmount: z.number(),
  total: z.number(),
  status: z.enum(["paid", "unpaid", "void"]),
  paymentMethod: z.enum(["cash", "card", "bank_transfer"]).optional(),
  notes: z.string().optional(),
  clientId: z.string().optional(),
});

export type InvoiceItemFormData = z.infer<typeof invoiceItemSchema>;
export type InvoiceFormData = z.infer<typeof invoiceSchema>;
