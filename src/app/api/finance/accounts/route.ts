import { NextRequest } from "next/server";
import { getAuthSession, unauthorized, badRequest, success, serverError } from "@/lib/api-utils";
import { db } from "@/db/db";
import { accounts } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { z } from "zod";

const accountSchema = z.object({
  code: z.string().min(1, "Code is required"),
  name: z.string().min(1, "Name is required"),
  nameEn: z.string().optional(),
  type: z.enum(["revenue", "cogs", "expense", "asset", "liability"]),
  parentCode: z.string().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().optional(),
});

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const tenantId = session.user.tenantId;

    const accountsList = await db
      .select()
      .from(accounts)
      .where(eq(accounts.tenantId, tenantId))
      .orderBy(asc(accounts.code));

    return success(
      accountsList.map((a) => ({
        ...a,
        isSystem: a.isSystem === 1,
        isActive: a.isActive === 1,
      }))
    );
  } catch (error) {
    console.error("GET /api/finance/accounts error:", error);
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const body = await req.json();
    const parsed = accountSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.issues.map((i) => i.message).join(", "));
    }

    const tenantId = session.user.tenantId;

    const [created] = await db
      .insert(accounts)
      .values({
        tenantId,
        code: parsed.data.code,
        name: parsed.data.name,
        nameEn: parsed.data.nameEn,
        type: parsed.data.type,
        parentCode: parsed.data.parentCode,
        isActive: parsed.data.isActive === false ? 0 : 1,
        sortOrder: parsed.data.sortOrder || 0,
      })
      .returning();

    return success(
      { ...created, isSystem: created.isSystem === 1, isActive: created.isActive === 1 },
      201
    );
  } catch (error) {
    console.error("POST /api/finance/accounts error:", error);
    return serverError();
  }
}
