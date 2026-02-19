import { z } from "zod";

export const healingJourneySchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  status: z.enum(["active", "completed", "paused"]),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  primaryServiceId: z.string().optional(),
});

export const journeyAttachmentSchema = z.object({
  url: z.string().min(1),
  thumbnailUrl: z.string().optional(),
  filename: z.string().optional(),
  mimeType: z.string().optional(),
  fileSize: z.number().optional(),
  label: z.enum(["before", "after", "during", "prescription_scan", "general"]).optional(),
  bodyRegion: z.string().optional(),
  caption: z.string().optional(),
});

const baseEntryFields = {
  date: z.string().min(1, "Date is required"),
  notes: z.string().optional(),
  attachments: z.array(journeyAttachmentSchema).default([]),
};

export const journeyEntrySchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("session"),
    ...baseEntryFields,
    serviceName: z.string().optional(),
    serviceId: z.string().optional(),
    doctorName: z.string().optional(),
    doctorId: z.string().optional(),
    employeeName: z.string().optional(),
    employeeId: z.string().optional(),
    price: z.number().optional(),
    duration: z.number().optional(),
    appointmentId: z.string().optional(),
    invoiceId: z.string().optional(),
  }),
  z.object({
    type: z.literal("prescription"),
    ...baseEntryFields,
    prescriptionText: z.string().optional(),
    prescribedByDoctorId: z.string().optional(),
    prescribedByDoctorName: z.string().optional(),
  }),
  z.object({
    type: z.literal("note"),
    ...baseEntryFields,
  }),
  z.object({
    type: z.literal("photo"),
    ...baseEntryFields,
  }),
  z.object({
    type: z.literal("milestone"),
    ...baseEntryFields,
    milestoneLabel: z.string().optional(),
  }),
]);

export type HealingJourneyFormData = z.infer<typeof healingJourneySchema>;
export type JourneyEntryFormData = z.infer<typeof journeyEntrySchema>;
export type JourneyAttachmentFormData = z.infer<typeof journeyAttachmentSchema>;
