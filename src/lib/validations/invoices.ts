import { z } from "zod";

export const invoiceItemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  quantity: z.number().positive("Quantity must be a positive number"),
  unitPrice: z.number().nonnegative("Unit price must be zero or greater"),
  discount: z.number().nonnegative("Discount must be zero or greater").default(0),
  total: z.number().nonnegative("Total must be zero or greater"),
  serviceId: z.string().optional(),
  taxCategory: z.enum(["S", "Z", "E", "O"]).optional(),
  taxRate: z.number().nonnegative().optional(),
  taxAmount: z.number().nonnegative().optional(),
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
  status: z.enum(["paid", "unpaid", "void", "partially_paid"]),
  paymentMethod: z.enum(["cash", "card", "bank_transfer"]).optional(),
  notes: z.string().optional(),
  clientId: z.string().optional(),
  // GCC/MENA e-invoicing fields
  invoiceType: z.enum(["standard", "simplified", "credit_note", "debit_note"]).optional(),
  originalInvoiceId: z.string().optional(),
  buyerTrn: z.string().max(50).optional(),
  buyerName: z.string().max(255).optional(),
  buyerAddress: z.string().optional(),
  currency: z.string().max(10).optional(),
  discountTotal: z.number().nonnegative().optional(),
});

export type InvoiceItemFormData = z.infer<typeof invoiceItemSchema>;
export type InvoiceFormData = z.infer<typeof invoiceSchema>;
