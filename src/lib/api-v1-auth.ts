import { NextRequest } from "next/server";
import { db } from "@/db/db";
import { apiKeys, subscriptions } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

interface ApiKeyAuth {
  tenantId: string;
  keyId: string;
}

export async function authenticateApiKey(req: NextRequest): Promise<ApiKeyAuth | null> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const key = authHeader.slice(7);
  if (!key || key.length < 32) return null;

  // Look up API key
  const [apiKey] = await db
    .select()
    .from(apiKeys)
    .where(and(
      eq(apiKeys.key, key),
      eq(apiKeys.isActive, 1)
    ))
    .limit(1);

  if (!apiKey) return null;

  // Check expiry
  if (apiKey.expiresAt && new Date(apiKey.expiresAt) < new Date()) return null;

  // Check subscription — API access requires professional or enterprise plan
  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.tenantId, apiKey.tenantId))
    .limit(1);

  if (sub && !["professional", "enterprise"].includes(sub.plan)) return null;

  // Update usage stats (fire and forget)
  db.update(apiKeys)
    .set({
      lastUsedAt: new Date(),
      requestCount: sql`${apiKeys.requestCount} + 1`,
    })
    .where(eq(apiKeys.id, apiKey.id))
    .then(() => {})
    .catch(() => {});

  return {
    tenantId: apiKey.tenantId,
    keyId: apiKey.id,
  };
}

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(keyId: string, limit: number = 1000): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(keyId);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(keyId, { count: 1, resetAt: now + 3600000 }); // 1 hour window
    return true;
  }

  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}
