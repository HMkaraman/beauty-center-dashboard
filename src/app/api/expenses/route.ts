import { NextRequest } from "next/server";
import {
  getAuthSession,
  unauthorized,
  badRequest,
  success,
  getPaginationParams,
  serverError,
} from "@/lib/api-utils";
import { db } from "@/db/db";
import { expenses } from "@/db/schema";
import { expenseSchema } from "@/lib/validations";
import { eq, and, ilike, sql, desc, count } from "drizzle-orm";
import { logActivity } from "@/lib/activity-logger";

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const { page, limit, offset, search } = getPaginationParams(req);
    const tenantId = session.user.tenantId;
    const url = new URL(req.url);
    const statusFilter = url.searchParams.get("status");

    const conditions = [eq(expenses.tenantId, tenantId)];
    if (search) {
      conditions.push(
        sql`(${ilike(expenses.description, `%${search}%`)} OR ${ilike(expenses.category, `%${search}%`)})`
      );
    }
    if (statusFilter) {
      conditions.push(
        eq(expenses.status, statusFilter as "approved" | "pending" | "rejected")
      );
    }

    const whereClause = and(...conditions);

    const [totalResult] = await db
      .select({ total: count() })
      .from(expenses)
      .where(whereClause);

    const rows = await db
      .select()
      .from(expenses)
      .where(whereClause)
      .orderBy(desc(expenses.createdAt))
      .limit(limit)
      .offset(offset);

    const data = rows.map((row) => ({
      ...row,
      amount: parseFloat(row.amount),
    }));

    return success({
      data,
      pagination: {
        page,
        limit,
        total: totalResult.total,
        totalPages: Math.ceil(totalResult.total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/expenses error:", error);
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const body = await req.json();
    const parsed = expenseSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.issues.map((i: { message: string }) => i.message).join(", "));
    }

    const validated = parsed.data;
    const tenantId = session.user.tenantId;

    const [newExpense] = await db
      .insert(expenses)
      .values({
        tenantId,
        date: validated.date,
        description: validated.description,
        category: validated.category,
        amount: String(validated.amount),
        paymentMethod: validated.paymentMethod,
        status: validated.status,
      })
      .returning();

    logActivity({
      session,
      entityType: "expense",
      entityId: newExpense.id,
      action: "create",
      entityLabel: `${validated.description} - ${validated.category}`,
    });

    return success(
      {
        ...newExpense,
        amount: parseFloat(newExpense.amount),
      },
      201
    );
  } catch (error) {
    console.error("POST /api/expenses error:", error);
    return serverError();
  }
}
