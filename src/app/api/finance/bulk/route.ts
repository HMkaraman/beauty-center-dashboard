import { NextRequest } from "next/server";
import { getAuthSession, unauthorized, badRequest, success, serverError } from "@/lib/api-utils";
import { db } from "@/db/db";
import { transactions } from "@/db/schema";
import { and, eq, inArray } from "drizzle-orm";

export async function DELETE(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const body = await req.json();
    const ids: string[] = body.ids;

    if (!Array.isArray(ids) || ids.length === 0) {
      return badRequest("ids must be a non-empty array");
    }

    const deleted = await db
      .delete(transactions)
      .where(and(eq(transactions.tenantId, session.user.tenantId), inArray(transactions.id, ids)))
      .returning({ id: transactions.id });

    return success({ deleted: deleted.length });
  } catch (error) {
    console.error("DELETE /api/finance/bulk error:", error);
    return serverError();
  }
}
