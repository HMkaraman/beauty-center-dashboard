import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db/db";
import { tenants, tenantSettings } from "@/db/schema";
import { onboardingSchema } from "@/lib/validations";
import {
  getAuthSession,
  unauthorized,
  badRequest,
  serverError,
  success,
} from "@/lib/api-utils";

export async function PATCH(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const body = await req.json();
    const parsed = onboardingSchema.safeParse(body);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return badRequest(firstIssue?.message || "Invalid input");
    }

    const { businessNameEn, phone, email, address, timezone, taxRate } =
      parsed.data;

    const tenantId = session.user.tenantId;

    // Update tenant settings
    await db
      .update(tenantSettings)
      .set({
        businessNameEn: businessNameEn || undefined,
        taxRate,
        updatedAt: new Date(),
      })
      .where(eq(tenantSettings.tenantId, tenantId));

    // Update tenant table with address/phone/email/timezone if provided
    const tenantUpdates: Record<string, unknown> = {
      timezone,
      updatedAt: new Date(),
    };
    if (phone) tenantUpdates.phone = phone;
    if (email) tenantUpdates.email = email;
    if (address) tenantUpdates.address = address;

    await db
      .update(tenants)
      .set(tenantUpdates)
      .where(eq(tenants.id, tenantId));

    return success({ message: "Onboarding completed successfully" });
  } catch (error) {
    console.error("Onboarding error:", error);
    return serverError("Failed to update onboarding settings");
  }
}
