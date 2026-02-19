import { z } from "zod";

export const appointmentSchema = z.object({
  clientName: z.string().min(1, "Client name is required"),
  clientPhone: z.string().optional(),
  service: z.string().min(1, "Service is required"),
  employee: z.string().optional(),
  doctor: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Time must be in HH:MM format"),
  duration: z.number().positive("Duration must be a positive number"),
  status: z.enum(["confirmed", "pending", "cancelled", "completed", "no-show", "waiting", "in-progress"]),
  price: z.number().nonnegative("Price must be zero or greater"),
  notes: z.string().optional(),
  clientId: z.string().optional(),
  serviceId: z.string().optional(),
  employeeId: z.string().optional(),
  doctorId: z.string().optional(),
  groupId: z.string().optional(),
});

export type AppointmentFormData = z.infer<typeof appointmentSchema>;
