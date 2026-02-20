import { NextRequest } from "next/server";
import {
  getAuthSession,
  unauthorized,
  badRequest,
  success,
  serverError,
} from "@/lib/api-utils";
import { db } from "@/db/db";
import { serviceEmployees, employees } from "@/db/schema";
import { eq, and } from "drizzle-orm";

type RouteParams = { params: Promise<{ id: string }> };

// GET - list assigned employees for a service
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const { id } = await params;
    const tenantId = session.user.tenantId;

    const rows = await db
      .select({
        id: employees.id,
        name: employees.name,
        role: employees.role,
      })
      .from(serviceEmployees)
      .innerJoin(employees, eq(serviceEmployees.employeeId, employees.id))
      .where(
        and(
          eq(serviceEmployees.serviceId, id),
          eq(serviceEmployees.tenantId, tenantId)
        )
      );

    return success(rows);
  } catch (error) {
    console.error("GET /api/services/[id]/employees error:", error);
    return serverError();
  }
}

// PUT - replace all assigned employees for a service
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const { id } = await params;
    const tenantId = session.user.tenantId;
    const body = await req.json();

    if (!Array.isArray(body.employeeIds)) {
      return badRequest("employeeIds array is required");
    }

    // Delete existing assignments
    await db
      .delete(serviceEmployees)
      .where(
        and(
          eq(serviceEmployees.serviceId, id),
          eq(serviceEmployees.tenantId, tenantId)
        )
      );

    // Insert new assignments
    if (body.employeeIds.length > 0) {
      await db.insert(serviceEmployees).values(
        body.employeeIds.map((employeeId: string) => ({
          tenantId,
          serviceId: id,
          employeeId,
        }))
      );
    }

    // Return updated list
    const rows = await db
      .select({
        id: employees.id,
        name: employees.name,
        role: employees.role,
      })
      .from(serviceEmployees)
      .innerJoin(employees, eq(serviceEmployees.employeeId, employees.id))
      .where(
        and(
          eq(serviceEmployees.serviceId, id),
          eq(serviceEmployees.tenantId, tenantId)
        )
      );

    return success(rows);
  } catch (error) {
    console.error("PUT /api/services/[id]/employees error:", error);
    return serverError();
  }
}
