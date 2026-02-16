import { z } from "zod";

export const serviceSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  duration: z.number().positive("Duration must be a positive number"),
  price: z.number().nonnegative("Price must be zero or greater"),
  status: z.enum(["active", "inactive"]),
  description: z.string().optional(),
});

export type ServiceFormData = z.infer<typeof serviceSchema>;
