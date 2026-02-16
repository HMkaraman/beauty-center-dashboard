import { NextRequest } from "next/server";
import { db } from "@/db/db";
import { tenants, employees } from "@/db/schema";
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

    const activeEmployees = await db
      .select({
        id: employees.id,
        name: employees.name,
        role: employees.role,
        image: employees.image,
      })
      .from(employees)
      .where(
        and(
          eq(employees.tenantId, tenant.id),
          eq(employees.status, "active")
        )
      );

    return success({
      employees: activeEmployees,
    });
  } catch (error) {
    console.error("GET /api/public/[slug]/employees error:", error);
    return serverError();
  }
}
