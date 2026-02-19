import { z } from "zod";

export const clientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string(),
  email: z.string().email("Invalid email address").optional(),
  dateOfBirth: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  status: z.enum(["active", "inactive"]),
  notes: z.string().optional(),
});

export type ClientFormData = z.infer<typeof clientSchema>;
