import { NextRequest } from "next/server";
import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/db/db";
import { tenants, users, tenantSettings, workingHours } from "@/db/schema";
import { registerSchema } from "@/lib/validations";
import { badRequest, serverError, success } from "@/lib/api-utils";

function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .substring(0, 50) || "center"
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return badRequest(firstIssue?.message || "Invalid input");
    }

    const { businessName, ownerName, email, password, phone, currency, locale } =
      parsed.data;

    // Check if email already exists
    const [existingUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser) {
      return badRequest("Email already exists");
    }

    // Create slug and ensure uniqueness
    let slug = slugify(businessName);
    const [existingTenant] = await db
      .select({ id: tenants.id })
      .from(tenants)
      .where(eq(tenants.slug, slug))
      .limit(1);

    if (existingTenant) {
      const suffix = Math.random().toString(36).substring(2, 6);
      slug = `${slug}-${suffix}`;
    }

    // Hash password
    const passwordHash = await hash(password, 12);

    // Sequential inserts (Neon HTTP doesn't support transactions)

    // 1. Insert tenant
    const [tenant] = await db
      .insert(tenants)
      .values({
        name: businessName,
        slug,
        currency,
        locale,
        phone: phone || null,
        email,
      })
      .returning();

    // 2. Insert tenant settings
    await db.insert(tenantSettings).values({
      tenantId: tenant.id,
      businessName,
      currency,
      taxRate: 15,
    });

    // 3. Insert user with role "owner"
    const [user] = await db
      .insert(users)
      .values({
        tenantId: tenant.id,
        email,
        passwordHash,
        name: ownerName,
        role: "owner",
      })
      .returning({
        id: users.id,
        tenantId: users.tenantId,
        email: users.email,
        name: users.name,
        role: users.role,
        createdAt: users.createdAt,
      });

    // 4. Insert 7 working hours rows (Sat=0 through Fri=6)
    // Friday (dayOfWeek=6) is closed, others open 09:00-21:00
    const workingHoursValues = Array.from({ length: 7 }, (_, i) => ({
      tenantId: tenant.id,
      dayOfWeek: i,
      startTime: "09:00",
      endTime: "21:00",
      isOpen: i === 6 ? 0 : 1, // Friday closed
    }));

    await db.insert(workingHours).values(workingHoursValues);

    return success({ user, tenant }, 201);
  } catch (error) {
    console.error("Registration error:", error);
    return serverError("Failed to create account");
  }
}
