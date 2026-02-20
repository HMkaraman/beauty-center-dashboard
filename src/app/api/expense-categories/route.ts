import { NextRequest } from "next/server";
import { getAuthSession, unauthorized, badRequest, success, serverError } from "@/lib/api-utils";
import { db } from "@/db/db";
import { expenseCategories } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { z } from "zod";

const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  nameEn: z.string().optional(),
  code: z.string().optional(),
  parentId: z.string().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().optional(),
});

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const tenantId = session.user.tenantId;

    const categories = await db
      .select()
      .from(expenseCategories)
      .where(eq(expenseCategories.tenantId, tenantId))
      .orderBy(asc(expenseCategories.sortOrder), asc(expenseCategories.name));

    return success(
      categories.map((c) => ({
        ...c,
        isDefault: c.isDefault === 1,
        isActive: c.isActive === 1,
      }))
    );
  } catch (error) {
    console.error("GET /api/expense-categories error:", error);
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const body = await req.json();
    const parsed = categorySchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.issues.map((i) => i.message).join(", "));
    }

    const tenantId = session.user.tenantId;

    // If this is the first call, seed defaults
    const existing = await db
      .select({ id: expenseCategories.id })
      .from(expenseCategories)
      .where(eq(expenseCategories.tenantId, tenantId))
      .limit(1);

    if (existing.length === 0) {
      await seedDefaultCategories(tenantId);
    }

    const [created] = await db
      .insert(expenseCategories)
      .values({
        tenantId,
        name: parsed.data.name,
        nameEn: parsed.data.nameEn,
        code: parsed.data.code,
        parentId: parsed.data.parentId,
        isActive: parsed.data.isActive === false ? 0 : 1,
        sortOrder: parsed.data.sortOrder || 0,
      })
      .returning();

    return success(
      { ...created, isDefault: created.isDefault === 1, isActive: created.isActive === 1 },
      201
    );
  } catch (error) {
    console.error("POST /api/expense-categories error:", error);
    return serverError();
  }
}

async function seedDefaultCategories(tenantId: string) {
  const defaults = [
    { name: "إيجار", nameEn: "Rent", code: "7400", sortOrder: 1 },
    { name: "رواتب", nameEn: "Salaries", code: "7750", sortOrder: 2 },
    { name: "مرافق", nameEn: "Utilities", code: "7800", sortOrder: 3 },
    { name: "مستلزمات", nameEn: "Supplies", code: "7550", sortOrder: 4 },
    { name: "تسويق", nameEn: "Marketing", code: "6010", sortOrder: 5 },
    { name: "تأمين", nameEn: "Insurance", code: "6700", sortOrder: 6 },
    { name: "صيانة", nameEn: "Maintenance", code: "7000", sortOrder: 7 },
    { name: "تدريب", nameEn: "Training", code: "7100", sortOrder: 8 },
    { name: "معدات", nameEn: "Equipment", code: "1500", sortOrder: 9 },
    { name: "أخرى", nameEn: "Other", code: "9000", sortOrder: 10 },
  ];

  await db.insert(expenseCategories).values(
    defaults.map((d) => ({
      tenantId,
      name: d.name,
      nameEn: d.nameEn,
      code: d.code,
      isDefault: 1,
      isActive: 1,
      sortOrder: d.sortOrder,
    }))
  );
}
