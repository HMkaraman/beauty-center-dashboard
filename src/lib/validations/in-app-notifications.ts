import { z } from "zod";

export const notificationPreferenceSchema = z.object({
  category: z.enum(["appointment", "inventory", "financial", "staff", "client", "system", "marketing"]),
  inAppEnabled: z.boolean(),
});

export type NotificationPreferenceFormData = z.infer<typeof notificationPreferenceSchema>;
