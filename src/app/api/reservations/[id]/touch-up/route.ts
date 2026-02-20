import { NextRequest } from "next/server";
import {
  getAuthSession,
  unauthorized,
  badRequest,
  success,
  serverError,
} from "@/lib/api-utils";
import { recordTouchUp } from "@/lib/business-logic/consumption-tracking";
import { touchUpSchema } from "@/lib/validations";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const { id } = await params;
    const body = await req.json();

    const result = touchUpSchema.safeParse({
      ...body,
      reservationId: id,
    });

    if (!result.success) {
      return badRequest(result.error.issues[0]?.message ?? "Invalid input");
    }

    const validated = result.data;

    const updated = await recordTouchUp({
      tenantId: session.user.tenantId,
      reservationId: id,
      touchUpAppointmentId: validated.touchUpAppointmentId,
      touchUpAmountUsed: validated.touchUpAmountUsed,
      touchUpIsFree: validated.touchUpIsFree,
      notes: validated.notes,
    });

    return success(updated);
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message === "Reservation not found" ||
        error.message === "Touch-up amount exceeds remaining amount"
      ) {
        return badRequest(error.message);
      }
    }
    console.error("POST /api/reservations/[id]/touch-up error:", error);
    return serverError();
  }
}
