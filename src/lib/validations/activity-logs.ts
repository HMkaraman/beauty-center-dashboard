import { z } from "zod";

export const activityNoteSchema = z.object({
  entityType: z.enum([
    "appointment",
    "client",
    "employee",
    "doctor",
    "invoice",
    "expense",
    "service",
    "inventory_item",
    "campaign",
    "transaction",
  ]),
  entityId: z.string().min(1, "Entity ID is required"),
  content: z.string().min(1, "Content is required").max(5000, "Content too long"),
  attachments: z
    .array(
      z.object({
        url: z.string().min(1, "URL is required"),
        filename: z.string().optional(),
        mimeType: z.string().optional(),
        fileSize: z.number().optional(),
      })
    )
    .optional(),
});

export type ActivityNoteFormData = z.infer<typeof activityNoteSchema>;
