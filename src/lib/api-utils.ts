import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { hasPermission, type Permission, type Role } from "./permissions";

export interface AuthenticatedSession {
  user: {
    id: string;
    email: string;
    name: string;
    tenantId: string;
    role: string;
  };
}

export async function getAuthSession(): Promise<AuthenticatedSession | null> {
  const session = await auth();
  if (!session?.user?.email) return null;
  return session as unknown as AuthenticatedSession;
}

export function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function notFound(message = "Not found") {
  return NextResponse.json({ error: message }, { status: 404 });
}

export function serverError(message = "Internal server error") {
  return NextResponse.json({ error: message }, { status: 500 });
}

export function success<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function getPaginationParams(req: NextRequest) {
  const url = new URL(req.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") || "20")));
  const search = url.searchParams.get("search") || "";
  const offset = (page - 1) * limit;

  return { page, limit, offset, search };
}

export function forbidden(message = "Forbidden") {
  return NextResponse.json({ error: message }, { status: 403 });
}

export function requirePermission(
  session: AuthenticatedSession,
  permission: Permission
): NextResponse | null {
  const role = session.user.role as Role;
  if (!hasPermission(role, permission)) {
    return forbidden();
  }
  return null; // null means permission granted
}

export async function getTenantFromSubdomain(
  req: NextRequest
): Promise<string | null> {
  const slug = req.headers.get("x-tenant-slug");
  if (!slug) return null;

  // Look up tenant by slug
  const { db } = await import("@/db/db");
  const { tenants } = await import("@/db/schema");
  const { eq } = await import("drizzle-orm");

  const [tenant] = await db
    .select({ id: tenants.id })
    .from(tenants)
    .where(eq(tenants.slug, slug))
    .limit(1);

  return tenant?.id ?? null;
}
