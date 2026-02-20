import { NextRequest } from "next/server";
import {
  getAuthSession,
  unauthorized,
  success,
  serverError,
} from "@/lib/api-utils";
import { db } from "@/db/db";
import { sessionConsumptionLogs, services } from "@/db/schema";
import { eq, and, sql, count, gte, lte } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const tenantId = session.user.tenantId;
    const url = new URL(req.url);
    const serviceId = url.searchParams.get("serviceId");
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");

    const conditions = [
      eq(sessionConsumptionLogs.tenantId, tenantId),
      eq(sessionConsumptionLogs.consumptionType, "laser_shots"),
    ];
    if (serviceId) {
      conditions.push(eq(sessionConsumptionLogs.serviceId, serviceId));
    }
    if (startDate) {
      conditions.push(gte(sessionConsumptionLogs.createdAt, new Date(startDate)));
    }
    if (endDate) {
      conditions.push(lte(sessionConsumptionLogs.createdAt, new Date(endDate)));
    }

    const whereClause = and(...conditions);

    // Average shots and total count
    const [avgResult] = await db
      .select({
        avgShots: sql<string>`COALESCE(AVG(${sessionConsumptionLogs.actualShots}), 0)`,
        totalLogs: count(),
      })
      .from(sessionConsumptionLogs)
      .where(whereClause);

    // Deviation breakdown
    const deviationRows = await db
      .select({
        deviation: sessionConsumptionLogs.shotDeviation,
        deviationCount: count(),
      })
      .from(sessionConsumptionLogs)
      .where(whereClause)
      .groupBy(sessionConsumptionLogs.shotDeviation);

    const deviationBreakdown: Record<string, number> = {
      within_range: 0,
      below: 0,
      above: 0,
    };
    for (const row of deviationRows) {
      if (row.deviation) {
        deviationBreakdown[row.deviation] = row.deviationCount;
      }
    }

    // Per-service stats
    const perServiceRows = await db
      .select({
        serviceId: sessionConsumptionLogs.serviceId,
        serviceName: services.name,
        avgShots: sql<string>`COALESCE(AVG(${sessionConsumptionLogs.actualShots}), 0)`,
        totalLogs: count(),
        withinRange: sql<number>`COUNT(CASE WHEN ${sessionConsumptionLogs.shotDeviation} = 'within_range' THEN 1 END)`,
        below: sql<number>`COUNT(CASE WHEN ${sessionConsumptionLogs.shotDeviation} = 'below' THEN 1 END)`,
        above: sql<number>`COUNT(CASE WHEN ${sessionConsumptionLogs.shotDeviation} = 'above' THEN 1 END)`,
      })
      .from(sessionConsumptionLogs)
      .leftJoin(services, eq(sessionConsumptionLogs.serviceId, services.id))
      .where(whereClause)
      .groupBy(sessionConsumptionLogs.serviceId, services.name);

    const perServiceStats = perServiceRows.map((row) => ({
      serviceId: row.serviceId,
      serviceName: row.serviceName,
      avgShots: parseFloat(row.avgShots),
      totalLogs: row.totalLogs,
      deviationBreakdown: {
        within_range: Number(row.withinRange),
        below: Number(row.below),
        above: Number(row.above),
      },
    }));

    return success({
      avgShots: parseFloat(avgResult.avgShots),
      totalLogs: avgResult.totalLogs,
      deviationBreakdown,
      perServiceStats,
    });
  } catch (error) {
    console.error("GET /api/consumption/report error:", error);
    return serverError();
  }
}
