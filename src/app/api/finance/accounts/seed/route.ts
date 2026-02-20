import { getAuthSession, unauthorized, success, serverError } from "@/lib/api-utils";
import { db } from "@/db/db";
import { accounts } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST() {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const tenantId = session.user.tenantId;

    // Check if already seeded
    const existing = await db
      .select({ id: accounts.id })
      .from(accounts)
      .where(eq(accounts.tenantId, tenantId))
      .limit(1);

    if (existing.length > 0) {
      return success({ seeded: 0, message: "Accounts already exist" });
    }

    const defaultAccounts = [
      // Revenue accounts
      { code: "4000", name: "إيرادات الخدمات", nameEn: "Service Revenue", type: "revenue", sortOrder: 1 },
      { code: "4040", name: "مبيعات التجزئة", nameEn: "Retail Sales", type: "revenue", sortOrder: 2 },
      { code: "4080", name: "إيرادات أخرى", nameEn: "Other Income", type: "revenue", sortOrder: 3 },
      // COGS accounts
      { code: "5000", name: "تكلفة الخدمات", nameEn: "Service COGS", type: "cogs", sortOrder: 10 },
      { code: "5250", name: "عمولات الموظفين", nameEn: "Employee Commissions", type: "cogs", sortOrder: 11 },
      { code: "5260", name: "عمولات الأطباء", nameEn: "Doctor Commissions", type: "cogs", sortOrder: 12 },
      // Expense accounts
      { code: "6010", name: "تسويق وإعلان", nameEn: "Marketing & Advertising", type: "expense", sortOrder: 20 },
      { code: "6700", name: "تأمين", nameEn: "Insurance", type: "expense", sortOrder: 21 },
      { code: "7000", name: "صيانة", nameEn: "Maintenance", type: "expense", sortOrder: 22 },
      { code: "7100", name: "تدريب وتطوير", nameEn: "Training & Development", type: "expense", sortOrder: 23 },
      { code: "7400", name: "إيجار", nameEn: "Rent", type: "expense", sortOrder: 24 },
      { code: "7550", name: "مستلزمات", nameEn: "Supplies", type: "expense", sortOrder: 25 },
      { code: "7750", name: "رواتب وأجور", nameEn: "Salaries & Wages", type: "expense", sortOrder: 26 },
      { code: "7800", name: "مرافق", nameEn: "Utilities", type: "expense", sortOrder: 27 },
      { code: "7900", name: "مصروفات إدارية", nameEn: "Admin Expenses", type: "expense", sortOrder: 28 },
      // Asset accounts
      { code: "1500", name: "معدات", nameEn: "Equipment", type: "asset", sortOrder: 30 },
    ];

    await db.insert(accounts).values(
      defaultAccounts.map((a) => ({
        tenantId,
        code: a.code,
        name: a.name,
        nameEn: a.nameEn,
        type: a.type,
        isSystem: 1,
        isActive: 1,
        sortOrder: a.sortOrder,
      }))
    );

    return success({ seeded: defaultAccounts.length });
  } catch (error) {
    console.error("POST /api/finance/accounts/seed error:", error);
    return serverError();
  }
}
