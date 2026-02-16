import { z } from "zod";

export const expenseSchema = z.object({
  date: z.string(),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  amount: z.number().positive("Amount must be a positive number"),
  paymentMethod: z.string().min(1, "Payment method is required"),
  status: z.enum(["approved", "pending", "rejected"]),
});

export type ExpenseFormData = z.infer<typeof expenseSchema>;
