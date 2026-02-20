import { NextRequest } from "next/server";
import {
  getAuthSession,
  unauthorized,
  badRequest,
  notFound,
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

    const { id } = await params;

    const [reservation] = await db
      .select()
      .from(clientProductReservations)
      .where(
        and(
          eq(clientProductReservations.id, id),
          eq(clientProductReservations.tenantId, session.user.tenantId)
        )
      );

    if (!reservation) return notFound("Reservation not found");

    return success({
      ...reservation,
      leftoverAmount: parseFloat(reservation.leftoverAmount),
      remainingAmount: parseFloat(reservation.remainingAmount),
      touchUpAmountUsed: reservation.touchUpAmountUsed
        ? parseFloat(reservation.touchUpAmountUsed)
        : undefined,
    });
  } catch (error) {
    console.error("GET /api/reservations/[id] error:", error);
    return serverError();
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const { id } = await params;
    const body = await req.json();

    const [existing] = await db
      .select()
      .from(clientProductReservations)
      .where(
        and(
          eq(clientProductReservations.id, id),
          eq(clientProductReservations.tenantId, session.user.tenantId)
        )
      );

    if (!existing) return notFound("Reservation not found");

    const updateData: Record<string, unknown> = { updatedAt: new Date() };

    if (body.status !== undefined) {
      const validStatuses = ["active", "used", "expired", "disposed"];
      if (!validStatuses.includes(body.status)) {
        return badRequest("Invalid status");
      }
      updateData.status = body.status;
    }

    if (body.notes !== undefined) {
      updateData.notes = body.notes;
    }

    if (body.expiryDate !== undefined) {
      updateData.expiryDate = body.expiryDate;
    }

    const [updated] = await db
      .update(clientProductReservations)
      .set(updateData)
      .where(
        and(
          eq(clientProductReservations.id, id),
          eq(clientProductReservations.tenantId, session.user.tenantId)
        )
      )
      .returning();

    if (!updated) return notFound("Reservation not found");

    return success({
      ...updated,
      leftoverAmount: parseFloat(updated.leftoverAmount),
      remainingAmount: parseFloat(updated.remainingAmount),
      touchUpAmountUsed: updated.touchUpAmountUsed
        ? parseFloat(updated.touchUpAmountUsed)
        : undefined,
    });
  } catch (error) {
    console.error("PATCH /api/reservations/[id] error:", error);
    return serverError();
  }
}
