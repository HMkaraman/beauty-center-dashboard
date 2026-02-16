import { NextRequest } from "next/server";
import { db } from "@/db/db";
import { tenants, clients, clientOtpCodes } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { success, badRequest, notFound, serverError } from "@/lib/api-utils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, tenantSlug } = body;

    if (!phone || !tenantSlug) {
      return badRequest("Phone and tenant slug are required");
    }

    // Look up tenant by slug
    const [tenant] = await db
      .select()
      .from(tenants)
      .where(eq(tenants.slug, tenantSlug))
      .limit(1);

    if (!tenant) {
      return notFound("Business not found");
    }

    // Look up client by phone + tenantId
    const [client] = await db
      .select()
      .from(clients)
      .where(and(eq(clients.phone, phone), eq(clients.tenantId, tenant.id)))
      .limit(1);

    if (!client) {
      return notFound("Client not found");
    }

    // Generate 6-digit OTP code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Store in clientOtpCodes with 10-minute expiry
    await db.insert(clientOtpCodes).values({
      phone,
      code,
      tenantId: tenant.id,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    // In production, this would send SMS
    console.log(`[OTP] Code for ${phone}: ${code}`);

    // In dev, also return the code for testing
    const isDev = process.env.NODE_ENV !== "production";

    return success({
      success: true,
      message: "OTP sent",
      ...(isDev ? { code } : {}),
    });
  } catch (error) {
    console.error("POST /api/public/portal/send-otp error:", error);
    return serverError();
  }
}
