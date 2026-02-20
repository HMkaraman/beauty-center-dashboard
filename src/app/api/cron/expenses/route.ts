import { NextRequest } from "next/server";
import { serverError, success, unauthorized } from "@/lib/api-utils";
import { db } from "@/db/db";
import { recurringExpenses, expenses } from "@/db/schema";
import { eq, and, lte, sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return unauthorized();
    }

    const today = new Date().toISOString().split("T")[0];
    const currentDay = new Date().getDate();

    // Find all active recurring expenses that need generation
    const recurring = await db
      .select()
      .from(recurringExpenses)
      .where(
        and(
          eq(recurringExpenses.isActive, 1),
          lte(recurringExpenses.startDate, today),
          sql`(${recurringExpenses.endDate} IS NULL OR ${recurringExpenses.endDate} >= ${today})`
        )
      );

    let generated = 0;

    for (const re of recurring) {
      const shouldGenerate = checkShouldGenerate(re, today, currentDay);
      if (!shouldGenerate) continue;

      // Create expense
      await db.insert(expenses).values({
        tenantId: re.tenantId,
        date: today,
        description: re.description,
        category: re.category,
        amount: re.amount,
        paymentMethod: re.paymentMethod,
        status: re.autoApprove === 1 ? "approved" : "pending",
        categoryId: re.categoryId,
      });

      // Update last generated date
      await db
        .update(recurringExpenses)
        .set({ lastGeneratedDate: today })
        .where(eq(recurringExpenses.id, re.id));

      generated++;
    }

    return success({
      message: "Recurring expenses cron completed",
      generated,
      checked: recurring.length,
    });
  } catch (error) {
    console.error("GET /api/cron/expenses error:", error);
    return serverError();
  }
}

function checkShouldGenerate(
  re: { frequency: string; dayOfMonth: number | null; lastGeneratedDate: string | null },
  today: string,
  currentDay: number
): boolean {
  const dayOfMonth = re.dayOfMonth ?? 1;

  // Only generate on the configured day of month
  if (currentDay !== dayOfMonth) return false;

  // Don't generate if already generated this period
  if (re.lastGeneratedDate) {
    const lastDate = new Date(re.lastGeneratedDate);
    const todayDate = new Date(today);

    switch (re.frequency) {
      case "monthly":
        if (lastDate.getMonth() === todayDate.getMonth() && lastDate.getFullYear() === todayDate.getFullYear()) return false;
        break;
      case "quarterly": {
        const lastQuarter = Math.floor(lastDate.getMonth() / 3);
        const currentQuarter = Math.floor(todayDate.getMonth() / 3);
        if (lastQuarter === currentQuarter && lastDate.getFullYear() === todayDate.getFullYear()) return false;
        break;
      }
      case "yearly":
        if (lastDate.getFullYear() === todayDate.getFullYear()) return false;
        break;
    }
  }

  return true;
}
