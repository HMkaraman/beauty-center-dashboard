import { z } from "zod";

export const doctorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  specialty: z.string().min(1, "Specialty is required"),
  phone: z.string().min(1, "Phone is required"),
  email: z.string().email("Invalid email address").optional(),
  status: z.enum(["active", "on-leave", "inactive"]),
  licenseNumber: z.string().optional(),
  bio: z.string().optional(),
  education: z.string().optional(),
  certificates: z.string().optional(),
  yearsOfExperience: z.number().int().min(0).optional(),
  compensationType: z.enum(["salary", "commission", "hybrid"]).optional(),
  salary: z.number().optional(),
  commissionRate: z.number().optional(),
  notes: z.string().optional(),
});

export type DoctorFormData = z.infer<typeof doctorSchema>;
