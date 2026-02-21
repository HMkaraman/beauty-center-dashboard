import { z } from "zod";

export const tenantSettingsSchema = z.object({
  businessName: z.string().optional(),
  taxRate: z.number().nonnegative("Tax rate must be zero or greater").optional(),
  currency: z.string().optional(),
  country: z.string().optional(),
  taxEnabled: z.boolean().optional(),
  exchangeRates: z.string().optional(),
  smsEnabled: z.boolean().optional(),
  emailEnabled: z.boolean().optional(),
  // GCC/MENA compliance fields
  taxRegistrationNumber: z.string().max(50).optional(),
  businessAddress: z.string().optional(),
  businessPhone: z.string().max(20).optional(),
  eInvoicingEnabled: z.boolean().optional(),
  eInvoicingMode: z.enum(["zatca", "uae_fta", "none"]).optional(),
  invoicePrefix: z.string().max(10).optional(),
  zatcaEnvironment: z.enum(["sandbox", "production"]).optional(),
  logoUrl: z.string().optional(),
  invoiceDesign: z.string().optional(),
});

export const workingHoursSchema = z.object({
  dayOfWeek: z.number().int("Day must be a whole number").min(0, "Day must be between 0 and 6").max(6, "Day must be between 0 and 6"),
  startTime: z.string(),
  endTime: z.string(),
  isOpen: z.boolean(),
});

export type TenantSettingsFormData = z.infer<typeof tenantSettingsSchema>;
export type WorkingHoursFormData = z.infer<typeof workingHoursSchema>;
