import { NextRequest } from "next/server";
import { getAuthSession, unauthorized, badRequest, success, serverError } from "@/lib/api-utils";
import { db } from "@/db/db";
import { invoices } from "@/db/schema";
import { and, eq, inArray, ne } from "drizzle-orm";

export async function PATCH(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const body = await req.json();
    const ids: string[] = body.ids;

    if (!Array.isArray(ids) || ids.length === 0) {
      return badRequest("ids must be a non-empty array");
    }

    const updated = await db
      .update(invoices)
      .set({ status: "void" })
      .where(
        and(
          eq(invoices.tenantId, session.user.tenantId),
          inArray(invoices.id, ids),
          ne(invoices.status, "void")
        )
      )
      .returning({ id: invoices.id });

    return success({ voided: updated.length });
  } catch (error) {
    console.error("PATCH /api/invoices/bulk error:", error);
    return serverError();
  }
}
