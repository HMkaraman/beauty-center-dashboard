import { NextRequest } from "next/server";
import {
  getAuthSession,
  unauthorized,
  success,
  serverError,
} from "@/lib/api-utils";
import { db } from "@/db/db";
import { clientProductReservations } from "@/db/schema";
import { eq, and } from "drizzle-orm";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const { id: clientId } = await params;
    const url = new URL(req.url);
    const status = url.searchParams.get("status");

    const conditions = [
      eq(clientProductReservations.tenantId, session.user.tenantId),
      eq(clientProductReservations.clientId, clientId),
    ];

    if (status) {
      conditions.push(
        eq(clientProductReservations.status, status as "active" | "used" | "expired" | "disposed")
      );
    }

    const data = await db
      .select()
      .from(clientProductReservations)
      .where(and(...conditions))
      .orderBy(clientProductReservations.createdAt);

    return success({
      data: data.map((row) => ({
        ...row,
        leftoverAmount: parseFloat(row.leftoverAmount),
        remainingAmount: parseFloat(row.remainingAmount),
        touchUpAmountUsed: row.touchUpAmountUsed ? parseFloat(row.touchUpAmountUsed) : null,
      })),
    });
  } catch (error) {
    console.error("GET /api/clients/[id]/reservations error:", error);
    return serverError();
  }
}
