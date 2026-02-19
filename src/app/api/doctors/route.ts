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
import { doctors } from "@/db/schema";
import { doctorSchema } from "@/lib/validations";
import { eq, and, ilike, sql, desc, count } from "drizzle-orm";
import { logActivity } from "@/lib/activity-logger";

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const { page, limit, offset, search } = getPaginationParams(req);
    const tenantId = session.user.tenantId;

    const conditions = [eq(doctors.tenantId, tenantId)];

    if (search) {
      conditions.push(
        sql`(${ilike(doctors.name, `%${search}%`)} OR ${ilike(doctors.specialty, `%${search}%`)})`
      );
    }

    const whereClause = and(...conditions);

    const [data, totalResult] = await Promise.all([
      db
        .select()
        .from(doctors)
        .where(whereClause)
        .orderBy(desc(doctors.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ total: count() })
        .from(doctors)
        .where(whereClause),
    ]);

    const total = totalResult[0]?.total ?? 0;

    return success({
      data: data.map((row) => ({
        ...row,
        rating: row.rating ? parseFloat(row.rating) : 0,
        salary: row.salary ? parseFloat(row.salary) : 0,
        commissionRate: row.commissionRate ? parseFloat(row.commissionRate) : 0,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/doctors error:", error);
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const body = await req.json();
    const result = doctorSchema.safeParse(body);

    if (!result.success) {
      return badRequest(result.error.issues[0]?.message ?? "Invalid input");
    }

    const validated = result.data;

    const [created] = await db
      .insert(doctors)
      .values({
        tenantId: session.user.tenantId,
        name: validated.name,
        specialty: validated.specialty,
        phone: validated.phone,
        email: validated.email,
        status: validated.status,
        licenseNumber: validated.licenseNumber,
        bio: validated.bio,
        education: validated.education,
        certificates: validated.certificates,
        yearsOfExperience: validated.yearsOfExperience,
        compensationType: validated.compensationType,
        salary: validated.salary !== undefined ? String(validated.salary) : undefined,
        commissionRate: validated.commissionRate !== undefined ? String(validated.commissionRate) : undefined,
        notes: validated.notes,
      })
      .returning();

    logActivity({
      session,
      entityType: "doctor",
      entityId: created.id,
      action: "create",
      entityLabel: `${created.name} - ${created.specialty}`,
    });

    return success(
      {
        ...created,
        rating: created.rating ? parseFloat(created.rating) : 0,
        salary: created.salary ? parseFloat(created.salary) : 0,
        commissionRate: created.commissionRate ? parseFloat(created.commissionRate) : 0,
      },
      201
    );
  } catch (error) {
    console.error("POST /api/doctors error:", error);
    return serverError();
  }
}
