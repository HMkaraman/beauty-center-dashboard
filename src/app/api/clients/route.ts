import { NextRequest } from "next/server";
import {
  getAuthSession,
  unauthorized,
  badRequest,
  success,
  serverError,
  getPaginationParams,
} from "@/lib/api-utils";
import { db } from "@/db/db";
import { clients, appointments, invoices } from "@/db/schema";
import { clientSchema } from "@/lib/validations";
import { eq, and, ilike, sql, desc, count, inArray } from "drizzle-orm";
import { logActivity } from "@/lib/activity-logger";

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const { page, limit, offset, search } = getPaginationParams(req);
    const tenantId = session.user.tenantId;

    const conditions = [eq(clients.tenantId, tenantId)];

    if (search) {
      conditions.push(
        sql`(${ilike(clients.name, `%${search}%`)} OR ${ilike(clients.phone, `%${search}%`)} OR ${ilike(clients.email, `%${search}%`)})`
      );
    }

    const whereClause = and(...conditions);

    const [data, totalResult] = await Promise.all([
      db
        .select()
        .from(clients)
        .where(whereClause)
        .orderBy(desc(clients.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ total: count() })
        .from(clients)
        .where(whereClause),
    ]);

    const total = totalResult[0]?.total ?? 0;

    // Compute client statistics (totalAppointments, totalSpent, lastVisit)
    const clientIds = data.map(c => c.id);

    let stats: Record<string, { totalAppointments: number; totalSpent: number; lastVisit: string | null }> = {};

    if (clientIds.length > 0) {
      // Count appointments per client and get last visit date
      const appointmentCounts = await db
        .select({
          clientId: appointments.clientId,
          totalAppointments: count(),
          lastVisit: sql<string>`MAX(${appointments.date})`,
        })
        .from(appointments)
        .where(
          and(
            eq(appointments.tenantId, tenantId),
            inArray(appointments.clientId, clientIds)
          )
        )
        .groupBy(appointments.clientId);

      // Sum paid invoice totals per client
      const spentTotals = await db
        .select({
          clientId: invoices.clientId,
          totalSpent: sql<string>`COALESCE(SUM(${invoices.total}), 0)`,
        })
        .from(invoices)
        .where(
          and(
            eq(invoices.tenantId, tenantId),
            eq(invoices.status, "paid"),
            inArray(invoices.clientId, clientIds)
          )
        )
        .groupBy(invoices.clientId);

      for (const row of appointmentCounts) {
        if (row.clientId) {
          stats[row.clientId] = {
            totalAppointments: row.totalAppointments,
            totalSpent: 0,
            lastVisit: row.lastVisit,
          };
        }
      }

      for (const row of spentTotals) {
        if (row.clientId) {
          if (!stats[row.clientId]) {
            stats[row.clientId] = { totalAppointments: 0, totalSpent: 0, lastVisit: null };
          }
          stats[row.clientId].totalSpent = parseFloat(row.totalSpent);
        }
      }
    }

    // Map data to include computed stats
    const enrichedData = data.map(client => ({
      ...client,
      totalAppointments: stats[client.id]?.totalAppointments ?? 0,
      totalSpent: stats[client.id]?.totalSpent ?? 0,
      lastVisit: stats[client.id]?.lastVisit ?? "",
      joinDate: client.joinDate ? new Date(client.joinDate).toISOString().split("T")[0] : "",
    }));

    return success({
      data: enrichedData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/clients error:", error);
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const body = await req.json();
    const result = clientSchema.safeParse(body);

    if (!result.success) {
      return badRequest(result.error.issues[0]?.message ?? "Invalid input");
    }

    const validated = result.data;

    const [created] = await db
      .insert(clients)
      .values({
        tenantId: session.user.tenantId,
        name: validated.name,
        phone: validated.phone,
        email: validated.email,
        dateOfBirth: validated.dateOfBirth,
        address: validated.address,
        city: validated.city,
        country: validated.country,
        status: validated.status,
        notes: validated.notes,
      })
      .returning();

    logActivity({
      session,
      entityType: "client",
      entityId: created.id,
      action: "create",
      entityLabel: created.name,
    });

    return success(created, 201);
  } catch (error) {
    console.error("POST /api/clients error:", error);
    return serverError();
  }
}
