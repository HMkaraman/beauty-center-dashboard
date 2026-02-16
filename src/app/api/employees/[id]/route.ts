import { NextRequest } from "next/server";
import {
  getAuthSession,
  unauthorized,
  badRequest,
  notFound,
  success,
  serverError,
} from "@/lib/api-utils";
import { db } from "@/db/db";
import { employees } from "@/db/schema";
import { employeeSchema } from "@/lib/validations";
import { eq, and } from "drizzle-orm";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const { id } = await params;

    const [employee] = await db
      .select()
      .from(employees)
      .where(and(eq(employees.id, id), eq(employees.tenantId, session.user.tenantId)));

    if (!employee) return notFound("Employee not found");

    return success({
      ...employee,
      commissionRate: employee.commissionRate ? parseFloat(employee.commissionRate) : 0,
      salary: employee.salary ? parseFloat(employee.salary) : 0,
    });
  } catch (error) {
    console.error("GET /api/employees/[id] error:", error);
    return serverError();
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const { id } = await params;
    const body = await req.json();
    const result = employeeSchema.partial().safeParse(body);

    if (!result.success) {
      return badRequest(result.error.issues[0]?.message ?? "Invalid input");
    }

    const validated = result.data;

    const updateData: Record<string, unknown> = {
      ...validated,
      updatedAt: new Date(),
    };

    if (validated.commissionRate !== undefined) {
      updateData.commissionRate = String(validated.commissionRate);
    }
    if (validated.salary !== undefined) {
      updateData.salary = String(validated.salary);
    }

    const [updated] = await db
      .update(employees)
      .set(updateData)
      .where(and(eq(employees.id, id), eq(employees.tenantId, session.user.tenantId)))
      .returning();

    if (!updated) return notFound("Employee not found");

    return success({
      ...updated,
      commissionRate: updated.commissionRate ? parseFloat(updated.commissionRate) : 0,
      salary: updated.salary ? parseFloat(updated.salary) : 0,
    });
  } catch (error) {
    console.error("PATCH /api/employees/[id] error:", error);
    return serverError();
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const { id } = await params;

    const [deleted] = await db
      .delete(employees)
      .where(and(eq(employees.id, id), eq(employees.tenantId, session.user.tenantId)))
      .returning();

    if (!deleted) return notFound("Employee not found");

    return success({ message: "Employee deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/employees/[id] error:", error);
    return serverError();
  }
}
