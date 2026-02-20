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
import { sessionConsumptionLogs } from "@/db/schema";
import { laserConsumptionSchema, injectableConsumptionSchema } from "@/lib/validations";
import {
  recordLaserConsumption,
  recordInjectableConsumption,
} from "@/lib/business-logic/consumption-tracking";
import { eq, and, desc, count } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const { page, limit, offset } = getPaginationParams(req);
    const tenantId = session.user.tenantId;
    const url = new URL(req.url);
    const appointmentId = url.searchParams.get("appointmentId");
    const clientId = url.searchParams.get("clientId");

    const conditions = [eq(sessionConsumptionLogs.tenantId, tenantId)];
    if (appointmentId) {
      conditions.push(eq(sessionConsumptionLogs.appointmentId, appointmentId));
    }
    if (clientId) {
      conditions.push(eq(sessionConsumptionLogs.clientId, clientId));
    }

    const whereClause = and(...conditions);

    const [totalResult] = await db
      .select({ total: count() })
      .from(sessionConsumptionLogs)
      .where(whereClause);

    const rows = await db
      .select()
      .from(sessionConsumptionLogs)
      .where(whereClause)
      .orderBy(desc(sessionConsumptionLogs.createdAt))
      .limit(limit)
      .offset(offset);

    const data = rows.map((row) => ({
      ...row,
      totalAllocated: row.totalAllocated ? parseFloat(row.totalAllocated) : null,
      amountUsed: row.amountUsed ? parseFloat(row.amountUsed) : null,
      leftoverAmount: row.leftoverAmount ? parseFloat(row.leftoverAmount) : null,
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
    console.error("GET /api/consumption error:", error);
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const body = await req.json();
    const tenantId = session.user.tenantId;
    const recordedById = session.user.id;

    if (body.consumptionType === "laser_shots") {
      const parsed = laserConsumptionSchema.safeParse(body);
      if (!parsed.success) {
        return badRequest(parsed.error.issues.map((i: { message: string }) => i.message).join(", "));
      }

      const validated = parsed.data;
      const log = await recordLaserConsumption({
        tenantId,
        appointmentId: validated.appointmentId,
        serviceId: validated.serviceId,
        clientId: validated.clientId,
        actualShots: validated.actualShots,
        deviceId: validated.deviceId,
        deviceModel: validated.deviceModel,
        notes: validated.notes,
        recordedById,
      });

      return success(log, 201);
    }

    if (body.consumptionType === "injectable") {
      const parsed = injectableConsumptionSchema.safeParse(body);
      if (!parsed.success) {
        return badRequest(parsed.error.issues.map((i: { message: string }) => i.message).join(", "));
      }

      const validated = parsed.data;
      const result = await recordInjectableConsumption({
        tenantId,
        appointmentId: validated.appointmentId,
        serviceId: validated.serviceId,
        clientId: validated.clientId,
        inventoryItemId: validated.inventoryItemId,
        productName: validated.productName,
        totalAllocated: validated.totalAllocated,
        amountUsed: validated.amountUsed,
        unit: validated.unit,
        notes: validated.notes,
        recordedById,
      });

      return success(result, 201);
    }

    return badRequest("Invalid consumptionType. Must be 'laser_shots' or 'injectable'.");
  } catch (error) {
    console.error("POST /api/consumption error:", error);
    return serverError();
  }
}
