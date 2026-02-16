import { NextRequest } from "next/server";
import { db } from "@/db/db";
import { tenants, clients, clientOtpCodes } from "@/db/schema";
import { eq, and, gt, isNull } from "drizzle-orm";
import { success, badRequest, notFound, serverError, unauthorized } from "@/lib/api-utils";
import { createClientToken } from "@/lib/client-auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, code, tenantSlug } = body;

    if (!phone || !code || !tenantSlug) {
      return badRequest("Phone, code, and tenant slug are required");
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

    // Look up OTP code (matching phone, tenantId, code, not expired, not used)
    const [otpRecord] = await db
      .select()
      .from(clientOtpCodes)
      .where(
        and(
          eq(clientOtpCodes.phone, phone),
          eq(clientOtpCodes.tenantId, tenant.id),
          eq(clientOtpCodes.code, code),
          gt(clientOtpCodes.expiresAt, new Date()),
          isNull(clientOtpCodes.usedAt)
        )
      )
      .limit(1);

    if (!otpRecord) {
      return unauthorized();
    }

    // Mark OTP as used
    await db
      .update(clientOtpCodes)
      .set({ usedAt: new Date() })
      .where(eq(clientOtpCodes.id, otpRecord.id));

    // Find the client
    const [client] = await db
      .select()
      .from(clients)
      .where(and(eq(clients.phone, phone), eq(clients.tenantId, tenant.id)))
      .limit(1);

    if (!client) {
      return notFound("Client not found");
    }

    // Generate token
    const token = createClientToken(client.id, tenant.id);

    return success({
      token,
      client: {
        id: client.id,
        name: client.name,
        phone: client.phone,
        email: client.email,
      },
    });
  } catch (error) {
    console.error("POST /api/public/portal/verify-otp error:", error);
    return serverError();
  }
}
