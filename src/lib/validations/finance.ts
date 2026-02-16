import { z } from "zod";

export const transactionSchema = z.object({
  date: z.string(),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  type: z.enum(["income", "expense"]),
  amount: z.number().positive("Amount must be a positive number"),
});

export type TransactionFormData = z.infer<typeof transactionSchema>;
