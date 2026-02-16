import { NextRequest } from "next/server";
import { db } from "@/db/db";
import { tenants, tenantSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
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

    const [settings] = await db
      .select()
      .from(tenantSettings)
      .where(eq(tenantSettings.tenantId, tenant.id))
      .limit(1);

    return success({
      name: settings?.businessName || tenant.name,
      nameEn: settings?.businessNameEn || "",
      logo: tenant.logo,
      phone: tenant.phone,
      currency: settings?.currency || tenant.currency,
    });
  } catch (error) {
    console.error("GET /api/public/[slug]/info error:", error);
    return serverError();
  }
}
