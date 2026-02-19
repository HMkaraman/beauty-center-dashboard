import { z } from "zod";

export const sectionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  nameEn: z.string().optional(),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color").optional(),
  status: z.enum(["active", "inactive"]),
  sortOrder: z.number().int().nonnegative().optional(),
});

export type SectionFormData = z.infer<typeof sectionSchema>;

export const serviceCategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  nameEn: z.string().optional(),
  sectionId: z.string().optional(),
  sortOrder: z.number().int().nonnegative().optional(),
});

export type ServiceCategoryFormData = z.infer<typeof serviceCategorySchema>;
