import { z } from "zod";

export const roleSchema = z.object({
  name: z.string().min(1, "Role name is required").max(255),
  nameEn: z.string().max(255).optional(),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with dashes"),
  description: z.string().optional(),
  permissions: z.array(z.string()).default([]),
  isDefault: z.boolean().optional(),
});

export type RoleFormData = z.infer<typeof roleSchema>;
