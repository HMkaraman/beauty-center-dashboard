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
import { campaigns } from "@/db/schema";
import { campaignSchema } from "@/lib/validations";
import { eq, and, ilike, sql, desc, count } from "drizzle-orm";
import { logActivity } from "@/lib/activity-logger";

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const { page, limit, offset, search } = getPaginationParams(req);
    const tenantId = session.user.tenantId;

    const conditions = [eq(campaigns.tenantId, tenantId)];
    if (search) {
      conditions.push(
        sql`(${ilike(campaigns.name, `%${search}%`)} OR ${ilike(campaigns.channel, `%${search}%`)})`
      );
    }

    const whereClause = and(...conditions);

    const [totalResult] = await db
      .select({ total: count() })
      .from(campaigns)
      .where(whereClause);

    const rows = await db
      .select()
      .from(campaigns)
      .where(whereClause)
      .orderBy(desc(campaigns.createdAt))
      .limit(limit)
      .offset(offset);

    const data = rows.map((row) => ({
      ...row,
      budget: parseFloat(row.budget),
    }));

    return success({
      data,
      pagination: {
        page,
        limit,
        total: totalResult.total,
        totalPages: Math.ceil(totalResult.total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/marketing error:", error);
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const body = await req.json();
    const parsed = campaignSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.issues.map((i: { message: string }) => i.message).join(", "));
    }

    const validated = parsed.data;
    const tenantId = session.user.tenantId;

    const [newCampaign] = await db
      .insert(campaigns)
      .values({
        tenantId,
        name: validated.name,
        channel: validated.channel,
        status: validated.status,
        startDate: validated.startDate,
        endDate: validated.endDate,
        budget: String(validated.budget),
        description: validated.description,
      })
      .returning();

    logActivity({
      session,
      entityType: "campaign",
      entityId: newCampaign.id,
      action: "create",
      entityLabel: newCampaign.name,
    });

    return success(
      {
        ...newCampaign,
        budget: parseFloat(newCampaign.budget),
      },
      201
    );
  } catch (error) {
    console.error("POST /api/marketing error:", error);
    return serverError();
  }
}
