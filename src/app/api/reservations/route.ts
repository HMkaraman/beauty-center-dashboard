import { NextRequest } from "next/server";
import {
  getAuthSession,
  unauthorized,
  success,
  serverError,
  getPaginationParams,
} from "@/lib/api-utils";
import { db } from "@/db/db";
import { clientProductReservations, clients } from "@/db/schema";
import { eq, and, desc, count, sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const { page, limit, offset } = getPaginationParams(req);
    const tenantId = session.user.tenantId;
    const url = new URL(req.url);

    const clientId = url.searchParams.get("clientId");
    const status = url.searchParams.get("status");
    const expiringBefore = url.searchParams.get("expiringBefore");

    const conditions = [eq(clientProductReservations.tenantId, tenantId)];

    if (clientId) {
      conditions.push(eq(clientProductReservations.clientId, clientId));
    }

    if (status) {
      conditions.push(eq(clientProductReservations.status, status as "active" | "used" | "expired" | "disposed"));
    }

    if (expiringBefore) {
      conditions.push(
        sql`${clientProductReservations.expiryDate} <= ${expiringBefore}`
      );
    }

    const whereClause = and(...conditions);

    const [data, totalResult] = await Promise.all([
      db
        .select({
          reservation: clientProductReservations,
          clientName: clients.name,
          clientPhone: clients.phone,
        })
        .from(clientProductReservations)
        .innerJoin(clients, eq(clientProductReservations.clientId, clients.id))
        .where(whereClause)
        .orderBy(desc(clientProductReservations.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ total: count() })
        .from(clientProductReservations)
        .where(whereClause),
    ]);

    const total = totalResult[0]?.total ?? 0;

    const enrichedData = data.map((row) => ({
      ...row.reservation,
      leftoverAmount: parseFloat(row.reservation.leftoverAmount),
      remainingAmount: parseFloat(row.reservation.remainingAmount),
      touchUpAmountUsed: row.reservation.touchUpAmountUsed
        ? parseFloat(row.reservation.touchUpAmountUsed)
        : undefined,
      clientName: row.clientName,
      clientPhone: row.clientPhone,
    }));

    return success({
      data: enrichedData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/reservations error:", error);
    return serverError();
  }
}
