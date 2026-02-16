import { NextRequest } from "next/server";
import {
  getAuthSession,
  unauthorized,
  badRequest,
  success,
  getPaginationParams,
  serverError,
} from "@/lib/api-utils";
import { db } from "@/db/db";
import { reports } from "@/db/schema";
import { eq, and, desc, count } from "drizzle-orm";
import { z } from "zod";

const reportSchema = z.object({
  type: z.enum([
    "financial",
    "appointments",
    "clients",
    "employees",
    "inventory",
    "marketing",
  ]),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  fileSize: z.string().optional(),
  fileUrl: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const { page, limit, offset } = getPaginationParams(req);
    const tenantId = session.user.tenantId;

    const whereClause = eq(reports.tenantId, tenantId);

    const [totalResult] = await db
      .select({ total: count() })
      .from(reports)
      .where(whereClause);

    const rows = await db
      .select()
      .from(reports)
      .where(whereClause)
      .orderBy(desc(reports.createdAt))
      .limit(limit)
      .offset(offset);

    return success({
      data: rows,
      pagination: {
        page,
        limit,
        total: totalResult.total,
        totalPages: Math.ceil(totalResult.total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/reports error:", error);
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const body = await req.json();
    const parsed = reportSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.issues.map((i: { message: string }) => i.message).join(", "));
    }

    const validated = parsed.data;
    const tenantId = session.user.tenantId;

    const [newReport] = await db
      .insert(reports)
      .values({
        tenantId,
        type: validated.type,
        name: validated.name,
        description: validated.description,
        fileSize: validated.fileSize,
        fileUrl: validated.fileUrl,
      })
      .returning();

    return success(newReport, 201);
  } catch (error) {
    console.error("POST /api/reports error:", error);
    return serverError();
  }
}
