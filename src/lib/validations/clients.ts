import { z } from "zod";

export const clientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone is required"),
  email: z.string().email("Invalid email address").optional(),
  status: z.enum(["active", "inactive"]),
  notes: z.string().optional(),
});

export type ClientFormData = z.infer<typeof clientSchema>;
