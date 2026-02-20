import { NextRequest } from "next/server";
import {
  getAuthSession,
  unauthorized,
  success,
  serverError,
} from "@/lib/api-utils";
import { getLeftoverDashboardData } from "@/lib/business-logic/consumption-tracking";

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const tenantId = session.user.tenantId;
    const data = await getLeftoverDashboardData(tenantId);

    return success(data);
  } catch (error) {
    console.error("GET /api/reservations/dashboard error:", error);
    return serverError();
  }
}
