import { z } from "zod";

export const laserConsumptionSchema = z.object({
  appointmentId: z.string().min(1, "Appointment is required"),
  serviceId: z.string().optional(),
  clientId: z.string().optional(),
  actualShots: z.number().int().positive("Actual shots must be a positive number"),
  expectedMinShots: z.number().int().optional(),
  expectedMaxShots: z.number().int().optional(),
  deviceId: z.string().optional(),
  deviceModel: z.string().optional(),
  notes: z.string().optional(),
});

export type LaserConsumptionFormData = z.infer<typeof laserConsumptionSchema>;

export const injectableConsumptionSchema = z.object({
  appointmentId: z.string().min(1, "Appointment is required"),
  serviceId: z.string().optional(),
  clientId: z.string().optional(),
  inventoryItemId: z.string().optional(),
  productName: z.string().min(1, "Product name is required"),
  totalAllocated: z.number().positive("Total allocated must be positive"),
  amountUsed: z.number().nonnegative("Amount used must be zero or greater"),
  unit: z.enum(["units", "cc"]),
  notes: z.string().optional(),
}).refine((data) => data.amountUsed <= data.totalAllocated, {
  message: "Amount used cannot exceed total allocated",
  path: ["amountUsed"],
});

export type InjectableConsumptionFormData = z.infer<typeof injectableConsumptionSchema>;

export const touchUpSchema = z.object({
  reservationId: z.string().min(1, "Reservation is required"),
  touchUpAppointmentId: z.string().optional(),
  touchUpAmountUsed: z.number().positive("Amount used must be positive"),
  touchUpIsFree: z.boolean().optional(),
  notes: z.string().optional(),
});

export type TouchUpFormData = z.infer<typeof touchUpSchema>;
