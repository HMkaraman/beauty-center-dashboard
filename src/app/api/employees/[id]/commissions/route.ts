import { NextRequest } from "next/server";
import {
  getAuthSession,
  unauthorized,
  notFound,
  success,
  serverError,
  getPaginationParams,
} from "@/lib/api-utils";
import { db } from "@/db/db";
import { employees, employeeCommissions } from "@/db/schema";
import { eq, and, desc, count } from "drizzle-orm";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const { id } = await params;
    const tenantId = session.user.tenantId;
    const { page, limit, offset } = getPaginationParams(req);

    // Verify employee exists and belongs to tenant
    const [employee] = await db
      .select()
      .from(employees)
      .where(and(eq(employees.id, id), eq(employees.tenantId, tenantId)));

    if (!employee) return notFound("Employee not found");

    const whereClause = and(
      eq(employeeCommissions.employeeId, id),
      eq(employeeCommissions.tenantId, tenantId)
    );

    const [data, totalResult] = await Promise.all([
      db
        .select()
        .from(employeeCommissions)
        .where(whereClause)
        .orderBy(desc(employeeCommissions.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ total: count() })
        .from(employeeCommissions)
        .where(whereClause),
    ]);

    const total = totalResult[0]?.total ?? 0;

    return success({
      data: data.map((row) => ({
        ...row,
        amount: parseFloat(row.amount),
        rate: parseFloat(row.rate),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/employees/[id]/commissions error:", error);
    return serverError();
  }
}
