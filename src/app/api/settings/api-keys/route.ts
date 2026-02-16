import { NextRequest } from "next/server";
import {
  getAuthSession,
  unauthorized,
  badRequest,
  success,
  serverError,
  forbidden,
} from "@/lib/api-utils";
import { db } from "@/db/db";
import { apiKeys } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

function generateApiKey(): string {
  const chars = "0123456789abcdef";
  let result = "bc_live_";
  for (let i = 0; i < 40; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export async function GET(_req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const tenantId = session.user.tenantId;

    const keys = await db
      .select({
        id: apiKeys.id,
        name: apiKeys.name,
        prefix: apiKeys.prefix,
        lastUsedAt: apiKeys.lastUsedAt,
        requestCount: apiKeys.requestCount,
        isActive: apiKeys.isActive,
        createdAt: apiKeys.createdAt,
        key: apiKeys.key,
      })
      .from(apiKeys)
      .where(eq(apiKeys.tenantId, tenantId))
      .orderBy(desc(apiKeys.createdAt));

    // Mask the key: show prefix + "..." + last 4 chars
    const maskedKeys = keys.map(({ key, ...rest }) => ({
      ...rest,
      maskedKey: `${rest.prefix}...${ key.slice(-4)}`,
      isActive: rest.isActive === 1,
    }));

    return success({ data: maskedKeys });
  } catch (error) {
    console.error("GET /api/settings/api-keys error:", error);
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    // Only owner or admin can create API keys
    const role = session.user.role;
    if (!["owner", "admin"].includes(role)) {
      return forbidden("Only owners and admins can create API keys");
    }

    const body = await req.json();
    const { name } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return badRequest("API key name is required");
    }

    if (name.trim().length > 255) {
      return badRequest("API key name must be 255 characters or less");
    }

    const fullKey = generateApiKey();
    const prefix = fullKey.slice(0, 8);

    const [created] = await db
      .insert(apiKeys)
      .values({
        tenantId: session.user.tenantId,
        name: name.trim(),
        key: fullKey,
        prefix,
      })
      .returning();

    return success(
      {
        id: created.id,
        name: created.name,
        prefix: created.prefix,
        key: fullKey, // Full key returned only on creation
        lastUsedAt: created.lastUsedAt,
        requestCount: created.requestCount,
        isActive: created.isActive === 1,
        createdAt: created.createdAt,
      },
      201
    );
  } catch (error) {
    console.error("POST /api/settings/api-keys error:", error);
    return serverError();
  }
}
