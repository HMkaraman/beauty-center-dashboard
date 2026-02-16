import { z } from "zod";

export const registerSchema = z.object({
  businessName: z.string().min(2).max(255),
  ownerName: z.string().min(2).max(255),
  email: z.string().email(),
  password: z.string().min(6).max(100),
  phone: z.string().min(8).max(20).optional(),
  currency: z.enum(["SAR", "AED", "IQD"]).default("SAR"),
  locale: z.enum(["ar", "en"]).default("ar"),
});

export type RegisterFormData = z.infer<typeof registerSchema>;

export const onboardingSchema = z.object({
  businessNameEn: z.string().max(255).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email().optional(),
  address: z.string().max(500).optional(),
  timezone: z
    .enum(["Asia/Riyadh", "Asia/Dubai", "Asia/Kuwait", "Asia/Baghdad"])
    .default("Asia/Riyadh"),
  taxRate: z.number().min(0).max(100).default(15),
});

export type OnboardingFormData = z.infer<typeof onboardingSchema>;
