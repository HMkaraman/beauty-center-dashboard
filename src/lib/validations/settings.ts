import { z } from "zod";

export const tenantSettingsSchema = z.object({
  businessName: z.string().optional(),
  taxRate: z.number().nonnegative("Tax rate must be zero or greater").optional(),
  currency: z.string().optional(),
  smsEnabled: z.boolean().optional(),
  emailEnabled: z.boolean().optional(),
});

export const workingHoursSchema = z.object({
  dayOfWeek: z.number().int("Day must be a whole number").min(0, "Day must be between 0 and 6").max(6, "Day must be between 0 and 6"),
  startTime: z.string(),
  endTime: z.string(),
  isOpen: z.boolean(),
});

export type TenantSettingsFormData = z.infer<typeof tenantSettingsSchema>;
export type WorkingHoursFormData = z.infer<typeof workingHoursSchema>;
