import { NextRequest } from "next/server";
import { db } from "@/db/db";
import { tenants, services } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { success, notFound, serverError } from "@/lib/api-utils";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const [tenant] = await db
      .select()
      .from(tenants)
      .where(eq(tenants.slug, slug))
      .limit(1);

    if (!tenant) return notFound("Business not found");

    const activeServices = await db
      .select({
        id: services.id,
        name: services.name,
        nameEn: services.nameEn,
        category: services.category,
        duration: services.duration,
        price: services.price,
        description: services.description,
      })
      .from(services)
      .where(
        and(
          eq(services.tenantId, tenant.id),
          eq(services.status, "active")
        )
      );

    // Group services by category
    const grouped: Record<
      string,
      Array<{
        id: string;
        name: string;
        nameEn: string | null;
        duration: number;
        price: number;
        description: string | null;
      }>
    > = {};

    for (const svc of activeServices) {
      const category = svc.category || "Other";
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push({
        id: svc.id,
        name: svc.name,
        nameEn: svc.nameEn,
        duration: svc.duration,
        price: parseFloat(svc.price),
        description: svc.description,
      });
    }

    return success({
      services: grouped,
    });
  } catch (error) {
    console.error("GET /api/public/[slug]/services error:", error);
    return serverError();
  }
}
