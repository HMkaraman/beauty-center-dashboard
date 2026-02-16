import { NextRequest } from "next/server";
import { db } from "@/db/db";
import { invoices } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { success, unauthorized, serverError } from "@/lib/api-utils";
import { getClientFromToken } from "@/lib/client-auth";

export async function GET(req: NextRequest) {
  try {
    const auth = getClientFromToken(req.headers.get("authorization"));
    if (!auth) return unauthorized();

    const { clientId, tenantId } = auth;

    const data = await db
      .select()
      .from(invoices)
      .where(
        and(
          eq(invoices.clientId, clientId),
          eq(invoices.tenantId, tenantId)
        )
      )
      .orderBy(desc(invoices.date));

    return success({ data });
  } catch (error) {
    console.error("GET /api/public/portal/invoices error:", error);
    return serverError();
  }
}
