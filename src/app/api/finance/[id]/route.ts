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
import { transactions } from "@/db/schema";
import { transactionSchema } from "@/lib/validations";
import { eq, and } from "drizzle-orm";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const { id } = await params;
    const tenantId = session.user.tenantId;

    const [transaction] = await db
      .select()
      .from(transactions)
      .where(and(eq(transactions.id, id), eq(transactions.tenantId, tenantId)));

    if (!transaction) return notFound("Transaction not found");

    return success({
      ...transaction,
      amount: parseFloat(transaction.amount),
    });
  } catch (error) {
    console.error("GET /api/finance/[id] error:", error);
    return serverError();
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const { id } = await params;
    const tenantId = session.user.tenantId;

    const body = await req.json();
    const parsed = transactionSchema.partial().safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.issues.map((i: { message: string }) => i.message).join(", "));
    }

    const validated = parsed.data;

    const [existing] = await db
      .select()
      .from(transactions)
      .where(and(eq(transactions.id, id), eq(transactions.tenantId, tenantId)));

    if (!existing) return notFound("Transaction not found");

    const updateValues: Record<string, unknown> = {};
    if (validated.date !== undefined) updateValues.date = validated.date;
    if (validated.description !== undefined) updateValues.description = validated.description;
    if (validated.category !== undefined) updateValues.category = validated.category;
    if (validated.type !== undefined) updateValues.type = validated.type;
    if (validated.amount !== undefined) updateValues.amount = String(validated.amount);

    const [updated] = await db
      .update(transactions)
      .set(updateValues)
      .where(and(eq(transactions.id, id), eq(transactions.tenantId, tenantId)))
      .returning();

    return success({
      ...updated,
      amount: parseFloat(updated.amount),
    });
  } catch (error) {
    console.error("PATCH /api/finance/[id] error:", error);
    return serverError();
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const { id } = await params;
    const tenantId = session.user.tenantId;

    const [existing] = await db
      .select()
      .from(transactions)
      .where(and(eq(transactions.id, id), eq(transactions.tenantId, tenantId)));

    if (!existing) return notFound("Transaction not found");

    await db
      .delete(transactions)
      .where(and(eq(transactions.id, id), eq(transactions.tenantId, tenantId)));

    return success({ message: "Transaction deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/finance/[id] error:", error);
    return serverError();
  }
}
