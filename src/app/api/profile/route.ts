import { NextRequest } from "next/server";
import {
  getAuthSession,
  unauthorized,
  badRequest,
  success,
  serverError,
} from "@/lib/api-utils";
import { db } from "@/db/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(_req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        image: users.image,
        role: users.role,
      })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!user) return unauthorized();

    return success(user);
  } catch (error) {
    console.error("GET /api/profile error:", error);
    return serverError();
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const body = await req.json();
    const { name, email, image } = body;

    if (!name?.trim()) return badRequest("Name is required");

    const updateData: Record<string, string> = { name: name.trim() };
    if (email?.trim()) updateData.email = email.trim();
    if (image !== undefined) updateData.image = image;

    const [updated] = await db
      .update(users)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(users.id, session.user.id))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        image: users.image,
        role: users.role,
      });

    return success(updated);
  } catch (error) {
    console.error("PATCH /api/profile error:", error);
    return serverError();
  }
}
