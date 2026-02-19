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
import { sections, employeeSections, doctorSections } from "@/db/schema";
import { sectionSchema } from "@/lib/validations";
import { eq, and, ilike, sql, desc, count } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const { page, limit, offset, search } = getPaginationParams(req);
    const tenantId = session.user.tenantId;

    const conditions = [eq(sections.tenantId, tenantId)];

    if (search) {
      conditions.push(
        sql`(${ilike(sections.name, `%${search}%`)} OR ${ilike(sections.nameEn, `%${search}%`)})`
      );
    }

    const whereClause = and(...conditions);

    const [data, totalResult] = await Promise.all([
      db
        .select()
        .from(sections)
        .where(whereClause)
        .orderBy(sections.sortOrder, desc(sections.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ total: count() })
        .from(sections)
        .where(whereClause),
    ]);

    const total = totalResult[0]?.total ?? 0;

    // Get employee and doctor counts for each section
    const sectionIds = data.map((s) => s.id);
    let employeeCountMap: Record<string, number> = {};
    let doctorCountMap: Record<string, number> = {};
    let employeeIdsMap: Record<string, string[]> = {};
    let doctorIdsMap: Record<string, string[]> = {};

    if (sectionIds.length > 0) {
      const employeeCounts = await db
        .select({
          sectionId: employeeSections.sectionId,
          count: count(),
        })
        .from(employeeSections)
        .where(sql`${employeeSections.sectionId} IN ${sectionIds}`)
        .groupBy(employeeSections.sectionId);

      employeeCountMap = Object.fromEntries(
        employeeCounts.map((r) => [r.sectionId, r.count])
      );

      const doctorCounts = await db
        .select({
          sectionId: doctorSections.sectionId,
          count: count(),
        })
        .from(doctorSections)
        .where(sql`${doctorSections.sectionId} IN ${sectionIds}`)
        .groupBy(doctorSections.sectionId);

      doctorCountMap = Object.fromEntries(
        doctorCounts.map((r) => [r.sectionId, r.count])
      );

      // Get employee IDs per section
      const empRows = await db
        .select({
          sectionId: employeeSections.sectionId,
          employeeId: employeeSections.employeeId,
        })
        .from(employeeSections)
        .where(sql`${employeeSections.sectionId} IN ${sectionIds}`);

      for (const row of empRows) {
        if (!employeeIdsMap[row.sectionId]) employeeIdsMap[row.sectionId] = [];
        employeeIdsMap[row.sectionId].push(row.employeeId);
      }

      // Get doctor IDs per section
      const docRows = await db
        .select({
          sectionId: doctorSections.sectionId,
          doctorId: doctorSections.doctorId,
        })
        .from(doctorSections)
        .where(sql`${doctorSections.sectionId} IN ${sectionIds}`);

      for (const row of docRows) {
        if (!doctorIdsMap[row.sectionId]) doctorIdsMap[row.sectionId] = [];
        doctorIdsMap[row.sectionId].push(row.doctorId);
      }
    }

    return success({
      data: data.map((row) => ({
        ...row,
        employeeCount: employeeCountMap[row.id] ?? 0,
        doctorCount: doctorCountMap[row.id] ?? 0,
        employeeIds: employeeIdsMap[row.id] ?? [],
        doctorIds: doctorIdsMap[row.id] ?? [],
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/sections error:", error);
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const body = await req.json();
    const result = sectionSchema.safeParse(body);

    if (!result.success) {
      return badRequest(result.error.issues[0]?.message ?? "Invalid input");
    }

    const validated = result.data;

    const [created] = await db
      .insert(sections)
      .values({
        tenantId: session.user.tenantId,
        name: validated.name,
        nameEn: validated.nameEn,
        description: validated.description,
        color: validated.color,
        status: validated.status,
        sortOrder: validated.sortOrder ?? 0,
      })
      .returning();

    return success(
      {
        ...created,
        employeeCount: 0,
        doctorCount: 0,
        employeeIds: [],
        doctorIds: [],
      },
      201
    );
  } catch (error) {
    console.error("POST /api/sections error:", error);
    return serverError();
  }
}
