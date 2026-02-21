import { NextRequest } from "next/server";
import {
  getAuthSession,
  unauthorized,
  badRequest,
  success,
  serverError,
} from "@/lib/api-utils";
import { db } from "@/db/db";
import { notificationPreferences } from "@/db/schema";
import { eq, and } from "drizzle-orm";

const CATEGORIES = ["appointment", "inventory", "financial", "staff", "client", "system", "marketing"] as const;

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const prefs = await db
      .select()
      .from(notificationPreferences)
      .where(
        and(
          eq(notificationPreferences.userId, session.user.id),
          eq(notificationPreferences.tenantId, session.user.tenantId)
        )
      );

    // Build a map with defaults (all enabled)
    const prefsMap: Record<string, { inAppEnabled: boolean }> = {};
    for (const cat of CATEGORIES) {
      prefsMap[cat] = { inAppEnabled: true };
    }
    for (const pref of prefs) {
      prefsMap[pref.category] = { inAppEnabled: pref.inAppEnabled === 1 };
    }

    return success(prefsMap);
  } catch (error) {
    console.error("GET /api/in-app-notifications/preferences error:", error);
    return serverError();
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const body = await req.json();
    const { category, inAppEnabled } = body;

    if (!category || !CATEGORIES.includes(category)) {
      return badRequest("Invalid category");
    }

    if (typeof inAppEnabled !== "boolean") {
      return badRequest("inAppEnabled must be a boolean");
    }

    // Upsert the preference
    const [existing] = await db
      .select()
      .from(notificationPreferences)
      .where(
        and(
          eq(notificationPreferences.userId, session.user.id),
          eq(notificationPreferences.tenantId, session.user.tenantId),
          eq(notificationPreferences.category, category)
        )
      );

    if (existing) {
      await db
        .update(notificationPreferences)
        .set({ inAppEnabled: inAppEnabled ? 1 : 0, updatedAt: new Date() })
        .where(eq(notificationPreferences.id, existing.id));
    } else {
      await db
        .insert(notificationPreferences)
        .values({
          userId: session.user.id,
          tenantId: session.user.tenantId,
          category,
          inAppEnabled: inAppEnabled ? 1 : 0,
        });
    }

    return success({ message: "Preferences updated" });
  } catch (error) {
    console.error("PUT /api/in-app-notifications/preferences error:", error);
    return serverError();
  }
}
