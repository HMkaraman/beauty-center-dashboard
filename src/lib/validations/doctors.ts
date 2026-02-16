import { z } from "zod";

export const doctorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  specialty: z.string().min(1, "Specialty is required"),
  phone: z.string().min(1, "Phone is required"),
  email: z.string().email("Invalid email address").optional(),
  status: z.enum(["active", "on-leave", "inactive"]),
  licenseNumber: z.string().optional(),
});

export type DoctorFormData = z.infer<typeof doctorSchema>;
