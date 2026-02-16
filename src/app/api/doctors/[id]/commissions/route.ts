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
import { doctors, doctorCommissions } from "@/db/schema";
import { eq, and, desc, count } from "drizzle-orm";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const { id } = await params;
    const tenantId = session.user.tenantId;
    const { page, limit, offset } = getPaginationParams(req);

    // Verify doctor exists and belongs to tenant
    const [doctor] = await db
      .select()
      .from(doctors)
      .where(and(eq(doctors.id, id), eq(doctors.tenantId, tenantId)));

    if (!doctor) return notFound("Doctor not found");

    const whereClause = and(
      eq(doctorCommissions.doctorId, id),
      eq(doctorCommissions.tenantId, tenantId)
    );

    const [data, totalResult] = await Promise.all([
      db
        .select()
        .from(doctorCommissions)
        .where(whereClause)
        .orderBy(desc(doctorCommissions.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ total: count() })
        .from(doctorCommissions)
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
    console.error("GET /api/doctors/[id]/commissions error:", error);
    return serverError();
  }
}
