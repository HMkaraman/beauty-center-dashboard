import { NextRequest } from "next/server";
import {
  getAuthSession,
  unauthorized,
  badRequest,
  success,
  serverError,
  getPaginationParams,
} from "@/lib/api-utils";
import { db } from "@/db/db";
import { employees, appointments, invoices } from "@/db/schema";
import { employeeSchema } from "@/lib/validations";
import { eq, and, ilike, sql, desc, count, inArray } from "drizzle-orm";
import { logActivity } from "@/lib/activity-logger";

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const { page, limit, offset, search } = getPaginationParams(req);
    const tenantId = session.user.tenantId;

    const conditions = [eq(employees.tenantId, tenantId)];

    if (search) {
      conditions.push(
        sql`(${ilike(employees.name, `%${search}%`)} OR ${ilike(employees.role, `%${search}%`)})`
      );
    }

    const whereClause = and(...conditions);

    const [data, totalResult] = await Promise.all([
      db
        .select()
        .from(employees)
        .where(whereClause)
        .orderBy(desc(employees.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ total: count() })
        .from(employees)
        .where(whereClause),
    ]);

    const total = totalResult[0]?.total ?? 0;

    // Compute real stats for employees
    const employeeIds = data.map((e) => e.id);

    let appointmentCountMap: Record<string, number> = {};
    let revenueMap: Record<string, number> = {};

    if (employeeIds.length > 0) {
      const appointmentCounts = await db
        .select({
          employeeId: appointments.employeeId,
          count: count(),
        })
        .from(appointments)
        .where(
          and(
            eq(appointments.tenantId, tenantId),
            inArray(appointments.employeeId, employeeIds)
          )
        )
        .groupBy(appointments.employeeId);

      appointmentCountMap = Object.fromEntries(
        appointmentCounts.map((r) => [r.employeeId, r.count])
      );

      const revenueTotals = await db
        .select({
          employeeId: appointments.employeeId,
          revenue: sql<string>`COALESCE(SUM(${invoices.total}), 0)`,
        })
        .from(appointments)
        .innerJoin(
          invoices,
          and(
            eq(invoices.appointmentId, appointments.id),
            eq(invoices.status, "paid")
          )
        )
        .where(
          and(
            eq(appointments.tenantId, tenantId),
            inArray(appointments.employeeId, employeeIds)
          )
        )
        .groupBy(appointments.employeeId);

      revenueMap = Object.fromEntries(
        revenueTotals.map((r) => [r.employeeId, parseFloat(r.revenue)])
      );
    }

    return success({
      data: data.map((row) => ({
        ...row,
        commissionRate: row.commissionRate ? parseFloat(row.commissionRate) : 0,
        salary: row.salary ? parseFloat(row.salary) : 0,
        appointments: appointmentCountMap[row.id] ?? 0,
        revenue: revenueMap[row.id] ?? 0,
        rating: 0,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/employees error:", error);
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const body = await req.json();
    const result = employeeSchema.safeParse(body);

    if (!result.success) {
      return badRequest(result.error.issues[0]?.message ?? "Invalid input");
    }

    const validated = result.data;

    const [created] = await db
      .insert(employees)
      .values({
        tenantId: session.user.tenantId,
        name: validated.name,
        phone: validated.phone,
        email: validated.email,
        role: validated.role,
        specialties: validated.specialties,
        status: validated.status,
        commissionRate: validated.commissionRate !== undefined
          ? String(validated.commissionRate)
          : undefined,
        nationalId: validated.nationalId,
        passportNumber: validated.passportNumber,
        dateOfBirth: validated.dateOfBirth,
        address: validated.address,
        emergencyContact: validated.emergencyContact,
        salary: validated.salary !== undefined ? String(validated.salary) : undefined,
        notes: validated.notes,
      })
      .returning();

    logActivity({
      session,
      entityType: "employee",
      entityId: created.id,
      action: "create",
      entityLabel: created.name,
    });

    return success(
      {
        ...created,
        commissionRate: created.commissionRate ? parseFloat(created.commissionRate) : 0,
        salary: created.salary ? parseFloat(created.salary) : 0,
      },
      201
    );
  } catch (error) {
    console.error("POST /api/employees error:", error);
    return serverError();
  }
}
