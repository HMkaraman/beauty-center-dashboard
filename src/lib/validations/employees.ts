import { z } from "zod";

export const employeeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone is required"),
  email: z.string().email("Invalid email address").optional(),
  role: z.string().min(1, "Role is required"),
  specialties: z.string().optional(),
  status: z.enum(["active", "on-leave", "inactive"]),
  commissionRate: z.number().optional(),
  nationalId: z.string().optional(),
  passportNumber: z.string().optional(),
  dateOfBirth: z.string().optional(),
  address: z.string().optional(),
  emergencyContact: z.string().optional(),
  salary: z.number().optional(),
  notes: z.string().optional(),
});

export type EmployeeFormData = z.infer<typeof employeeSchema>;
