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
import { expenses, transactions } from "@/db/schema";
import { expenseSchema } from "@/lib/validations";
import { eq, and } from "drizzle-orm";
import { createExpenseTransaction } from "@/lib/business-logic/finance";
import { logActivity } from "@/lib/activity-logger";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const { id } = await params;
    const tenantId = session.user.tenantId;

    const [expense] = await db
      .select()
      .from(expenses)
      .where(and(eq(expenses.id, id), eq(expenses.tenantId, tenantId)));

    if (!expense) return notFound("Expense not found");

    return success({
      ...expense,
      amount: parseFloat(expense.amount),
    });
  } catch (error) {
    console.error("GET /api/expenses/[id] error:", error);
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
    const parsed = expenseSchema.partial().safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.issues.map((i: { message: string }) => i.message).join(", "));
    }

    const validated = parsed.data;

    const [existing] = await db
      .select()
      .from(expenses)
      .where(and(eq(expenses.id, id), eq(expenses.tenantId, tenantId)));

    if (!existing) return notFound("Expense not found");

    const updateValues: Record<string, unknown> = { updatedAt: new Date() };
    if (validated.date !== undefined) updateValues.date = validated.date;
    if (validated.description !== undefined) updateValues.description = validated.description;
    if (validated.category !== undefined) updateValues.category = validated.category;
    if (validated.amount !== undefined) updateValues.amount = String(validated.amount);
    if (validated.paymentMethod !== undefined) updateValues.paymentMethod = validated.paymentMethod;
    if (validated.status !== undefined) updateValues.status = validated.status;

    const [updated] = await db
      .update(expenses)
      .set(updateValues)
      .where(and(eq(expenses.id, id), eq(expenses.tenantId, tenantId)))
      .returning();

    // When expense status changes to "approved", create an expense transaction
    if (
      validated.status === "approved" &&
      existing.status !== "approved"
    ) {
      await createExpenseTransaction({
        tenantId,
        expenseId: id,
        description: updated.description,
        amount: parseFloat(updated.amount),
        category: updated.category,
        date: updated.date,
      });
    }

    logActivity({
      session,
      entityType: "expense",
      entityId: id,
      action: "update",
      entityLabel: `${updated.description} - ${updated.category}`,
      oldRecord: existing as unknown as Record<string, unknown>,
      newData: validated as unknown as Record<string, unknown>,
    });

    return success({
      ...updated,
      amount: parseFloat(updated.amount),
    });
  } catch (error) {
    console.error("PATCH /api/expenses/[id] error:", error);
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
      .from(expenses)
      .where(and(eq(expenses.id, id), eq(expenses.tenantId, tenantId)));

    if (!existing) return notFound("Expense not found");

    // Block deletion of approved expenses
    if (existing.status === "approved") {
      return badRequest("Cannot delete an approved expense.");
    }

    // Clean up any orphan transactions referencing this expense
    await db.delete(transactions).where(eq(transactions.expenseId, id));

    await db
      .delete(expenses)
      .where(and(eq(expenses.id, id), eq(expenses.tenantId, tenantId)));

    logActivity({
      session,
      entityType: "expense",
      entityId: id,
      action: "delete",
      entityLabel: `${existing.description} - ${existing.category}`,
    });

    return success({ message: "Expense deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/expenses/[id] error:", error);
    return serverError();
  }
}
