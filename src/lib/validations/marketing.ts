import { z } from "zod";

export const campaignSchema = z.object({
  name: z.string().min(1, "Name is required"),
  channel: z.string().min(1, "Channel is required"),
  status: z.enum(["active", "paused", "completed", "draft"]),
  startDate: z.string(),
  endDate: z.string().optional(),
  budget: z.number().nonnegative("Budget must be zero or greater"),
  description: z.string().optional(),
});

export type CampaignFormData = z.infer<typeof campaignSchema>;
