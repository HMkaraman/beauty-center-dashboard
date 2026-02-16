import { NextRequest } from "next/server";
import { db } from "@/db/db";
import { tenants, services } from "@/db/schema";
import { eq } from "drizzle-orm";
import { success, notFound, badRequest, serverError } from "@/lib/api-utils";
import { getAvailableDates } from "@/lib/business-logic/availability";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const url = new URL(req.url);
    const serviceId = url.searchParams.get("serviceId");

    if (!serviceId) return badRequest("serviceId is required");

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

    // 3. Get available dates for the next 30 days
    const dates = await getAvailableDates({
      tenantId: tenant.id,
      serviceDuration: service.duration,
    });

    return success({
      dates,
    });
  } catch (error) {
    console.error("GET /api/public/[slug]/dates error:", error);
    return serverError();
  }
}
