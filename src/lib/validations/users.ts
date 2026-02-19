import { z } from "zod";

export const userCreateSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  roleId: z.string().min(1, "Role is required"),
});

export type UserCreateFormData = z.infer<typeof userCreateSchema>;

export const userUpdateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  email: z.string().email().optional(),
  roleId: z.string().optional(),
  customPermissions: z
    .object({
      granted: z.array(z.string()),
      revoked: z.array(z.string()),
    })
    .nullable()
    .optional(),
});

export type UserUpdateFormData = z.infer<typeof userUpdateSchema>;
