import { NextRequest } from "next/server";
import { getAuthSession, unauthorized, badRequest, success, serverError } from "@/lib/api-utils";
import { db } from "@/db/db";
import { financialPeriods } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";

const periodSchema = z.object({
  name: z.string().min(1, "Name is required"),
  startDate: z.string(),
  endDate: z.string(),
});

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const tenantId = session.user.tenantId;

    const periods = await db
      .select()
      .from(financialPeriods)
      .where(eq(financialPeriods.tenantId, tenantId))
      .orderBy(desc(financialPeriods.startDate));

    return success(
      periods.map((p) => ({
        ...p,
        snapshotRevenue: p.snapshotRevenue ? parseFloat(p.snapshotRevenue) : null,
        snapshotExpenses: p.snapshotExpenses ? parseFloat(p.snapshotExpenses) : null,
        snapshotProfit: p.snapshotProfit ? parseFloat(p.snapshotProfit) : null,
      }))
    );
  } catch (error) {
    console.error("GET /api/finance/periods error:", error);
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const tenantId = session.user.tenantId;
    const body = await req.json();
    const parsed = periodSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.issues.map((i) => i.message).join(", "));
    }

    const [period] = await db
      .insert(financialPeriods)
      .values({
        tenantId,
        name: parsed.data.name,
        startDate: parsed.data.startDate,
        endDate: parsed.data.endDate,
        status: "open",
      })
      .returning();

    return success(period, 201);
  } catch (error) {
    console.error("POST /api/finance/periods error:", error);
    return serverError();
  }
}
