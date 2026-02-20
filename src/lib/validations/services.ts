import { z } from "zod";

export const serviceSchema = z.object({
  name: z.string().min(1, "Name is required"),
  nameEn: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  categoryId: z.string().optional(),
  duration: z.number().positive("Duration must be a positive number"),
  price: z.number().nonnegative("Price must be zero or greater"),
  status: z.enum(["active", "inactive"]),
  description: z.string().optional(),
  image: z.string().nullable().optional(),
  serviceType: z.enum(["laser", "injectable"]).nullable().optional(),
  laserMinShots: z.number().int().positive().nullable().optional(),
  laserMaxShots: z.number().int().positive().nullable().optional(),
  injectableUnit: z.enum(["units", "cc"]).nullable().optional(),
  injectableExpiryDays: z.number().int().positive().nullable().optional(),
}).refine((data) => {
  if (data.serviceType === "laser") {
    return data.laserMinShots != null && data.laserMaxShots != null;
  }
  return true;
}, {
  message: "Laser services require min and max shots",
  path: ["laserMinShots"],
}).refine((data) => {
  if (data.serviceType === "injectable") {
    return data.injectableUnit != null && data.injectableExpiryDays != null;
  }
  return true;
}, {
  message: "Injectable services require unit and expiry days",
  path: ["injectableUnit"],
}).refine((data) => {
  if (data.serviceType === "laser" && data.laserMinShots != null && data.laserMaxShots != null) {
    return data.laserMinShots <= data.laserMaxShots;
  }
  return true;
}, {
  message: "Min shots must be less than or equal to max shots",
  path: ["laserMinShots"],
});

export type ServiceFormData = z.infer<typeof serviceSchema>;
