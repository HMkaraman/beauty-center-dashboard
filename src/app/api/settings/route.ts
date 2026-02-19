import { NextRequest } from "next/server";
import {
  getAuthSession,
  unauthorized,
  badRequest,
  success,
  serverError,
} from "@/lib/api-utils";
import { db } from "@/db/db";
import { tenantSettings } from "@/db/schema";
import { tenantSettingsSchema } from "@/lib/validations";
import { eq } from "drizzle-orm";

const DEFAULT_SETTINGS = {
  businessName: "",
  businessNameEn: "",
  taxRate: 15,
  nextInvoiceNumber: 1,
  currency: "SAR",
  country: "SA",
  taxEnabled: 1,
  exchangeRates: null as string | null,
  smsEnabled: 0,
  emailEnabled: 0,
};

export async function GET(_req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const tenantId = session.user.tenantId;

    const [settings] = await db
      .select()
      .from(tenantSettings)
      .where(eq(tenantSettings.tenantId, tenantId));

    if (!settings) {
      return success({
        tenantId,
        ...DEFAULT_SETTINGS,
      });
    }

    return success(settings);
  } catch (error) {
    console.error("GET /api/settings error:", error);
    return serverError();
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const body = await req.json();
    const parsed = tenantSettingsSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.issues.map((i: { message: string }) => i.message).join(", "));
    }

    const validated = parsed.data;
    const tenantId = session.user.tenantId;

    // Check if settings exist
    const [existing] = await db
      .select()
      .from(tenantSettings)
      .where(eq(tenantSettings.tenantId, tenantId));

    const updateValues: Record<string, unknown> = { updatedAt: new Date() };
    if (validated.businessName !== undefined) updateValues.businessName = validated.businessName;
    if (validated.taxRate !== undefined) updateValues.taxRate = validated.taxRate;
    if (validated.currency !== undefined) updateValues.currency = validated.currency;
    if (validated.country !== undefined) updateValues.country = validated.country;
    if (validated.taxEnabled !== undefined) updateValues.taxEnabled = validated.taxEnabled ? 1 : 0;
    if (validated.exchangeRates !== undefined) updateValues.exchangeRates = validated.exchangeRates;
    if (validated.smsEnabled !== undefined) updateValues.smsEnabled = validated.smsEnabled ? 1 : 0;
    if (validated.emailEnabled !== undefined) updateValues.emailEnabled = validated.emailEnabled ? 1 : 0;

    let result;
    if (existing) {
      // Update
      const [updated] = await db
        .update(tenantSettings)
        .set(updateValues)
        .where(eq(tenantSettings.tenantId, tenantId))
        .returning();
      result = updated;
    } else {
      // Insert (upsert)
      const [created] = await db
        .insert(tenantSettings)
        .values({
          tenantId,
          businessName: validated.businessName ?? DEFAULT_SETTINGS.businessName,
          taxRate: validated.taxRate ?? DEFAULT_SETTINGS.taxRate,
          currency: validated.currency ?? DEFAULT_SETTINGS.currency,
          country: validated.country ?? DEFAULT_SETTINGS.country,
          taxEnabled: validated.taxEnabled ? 1 : DEFAULT_SETTINGS.taxEnabled,
          exchangeRates: validated.exchangeRates ?? DEFAULT_SETTINGS.exchangeRates,
          smsEnabled: validated.smsEnabled ? 1 : DEFAULT_SETTINGS.smsEnabled,
          emailEnabled: validated.emailEnabled ? 1 : DEFAULT_SETTINGS.emailEnabled,
        })
        .returning();
      result = created;
    }

    return success(result);
  } catch (error) {
    console.error("PATCH /api/settings error:", error);
    return serverError();
  }
}
