import { NextRequest } from "next/server";
import { getAuthSession, unauthorized, badRequest, success, serverError } from "@/lib/api-utils";
import { generateReport } from "@/lib/business-logic/reporting";

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const body = await req.json();
    const { type, startDate, endDate } = body;

    if (!type || !startDate || !endDate) {
      return badRequest("type, startDate, and endDate are required");
    }

    const data = await generateReport(
      type,
      session.user.tenantId,
      startDate,
      endDate
    );

    return success(data);
  } catch (error) {
    console.error("POST /api/reports/generate error:", error);
    return serverError();
  }
}
