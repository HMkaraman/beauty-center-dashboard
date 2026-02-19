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
import { transactions } from "@/db/schema";
import { transactionSchema } from "@/lib/validations";
import { eq, and, ilike, sql, desc, count } from "drizzle-orm";
import { logActivity } from "@/lib/activity-logger";

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const { page, limit, offset, search } = getPaginationParams(req);
    const tenantId = session.user.tenantId;
    const url = new URL(req.url);
    const typeFilter = url.searchParams.get("type");

    const conditions = [eq(transactions.tenantId, tenantId)];
    if (search) {
      conditions.push(
        sql`(${ilike(transactions.description, `%${search}%`)} OR ${ilike(transactions.category, `%${search}%`)})`
      );
    }
    if (typeFilter) {
      conditions.push(
        eq(transactions.type, typeFilter as "income" | "expense")
      );
    }

    const whereClause = and(...conditions);

    const [totalResult] = await db
      .select({ total: count() })
      .from(transactions)
      .where(whereClause);

    const rows = await db
      .select()
      .from(transactions)
      .where(whereClause)
      .orderBy(desc(transactions.createdAt))
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
    console.error("GET /api/finance error:", error);
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const body = await req.json();
    const parsed = transactionSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.issues.map((i: { message: string }) => i.message).join(", "));
    }

    const validated = parsed.data;
    const tenantId = session.user.tenantId;

    const [newTransaction] = await db
      .insert(transactions)
      .values({
        tenantId,
        date: validated.date,
        description: validated.description,
        category: validated.category,
        type: validated.type,
        amount: String(validated.amount),
      })
      .returning();

    logActivity({
      session,
      entityType: "transaction",
      entityId: newTransaction.id,
      action: "create",
      entityLabel: `${validated.type} - ${validated.description}`,
    });

    return success(
      {
        ...newTransaction,
        amount: parseFloat(newTransaction.amount),
      },
      201
    );
  } catch (error) {
    console.error("POST /api/finance error:", error);
    return serverError();
  }
}
