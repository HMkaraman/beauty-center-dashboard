import { NextRequest } from "next/server";
import { db } from "@/db/db";
import { tenants, services } from "@/db/schema";
import { eq } from "drizzle-orm";
import { success, notFound, badRequest, serverError } from "@/lib/api-utils";
import { getAvailableSlots } from "@/lib/business-logic/availability";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const url = new URL(req.url);
    const date = url.searchParams.get("date");
    const serviceId = url.searchParams.get("serviceId");
    const employeeId = url.searchParams.get("employeeId") || undefined;

    if (!date) return badRequest("date is required");
    if (!serviceId) return badRequest("serviceId is required");

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return badRequest("date must be in YYYY-MM-DD format");
    }

    // 1. Look up tenant by slug
    const [tenant] = await db
      .select()
      .from(tenants)
      .where(eq(tenants.slug, slug))
      .limit(1);

    if (!tenant) return notFound("Business not found");

    // 2. Look up service to get duration
    const [service] = await db
      .select({
        id: services.id,
        duration: services.duration,
      })
      .from(services)
      .where(eq(services.id, serviceId))
      .limit(1);

    if (!service) return notFound("Service not found");

    // 3. Call getAvailableSlots
    const slots = await getAvailableSlots({
      tenantId: tenant.id,
      date,
      serviceDuration: service.duration,
      employeeId,
    });

    return success({
      date,
      slots,
    });
  } catch (error) {
    console.error("GET /api/public/[slug]/availability error:", error);
    return serverError();
  }
}
