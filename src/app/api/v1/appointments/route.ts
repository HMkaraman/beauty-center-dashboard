import { NextRequest } from "next/server";
import { authenticateApiKey, checkRateLimit } from "@/lib/api-v1-auth";
import {
  unauthorized,
  badRequest,
  success,
  serverError,
  getPaginationParams,
} from "@/lib/api-utils";
import { db } from "@/db/db";
import { appointments, clients, services, employees } from "@/db/schema";
import { eq, and, ilike, sql, desc, count, gte, lte } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateApiKey(req);
    if (!auth) return unauthorized();
    if (!checkRateLimit(auth.keyId)) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded" }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }

    const { page, limit, offset, search } = getPaginationParams(req);
    const url = new URL(req.url);
    const status = url.searchParams.get("status");
    const dateFrom = url.searchParams.get("date_from");
    const dateTo = url.searchParams.get("date_to");
    const clientId = url.searchParams.get("client_id");
    const employeeId = url.searchParams.get("employee_id");

    const conditions = [eq(appointments.tenantId, auth.tenantId)];

    if (search) {
      conditions.push(
        sql`(${ilike(appointments.clientName, `%${search}%`)} OR ${ilike(appointments.service, `%${search}%`)} OR ${ilike(appointments.employee, `%${search}%`)})`
      );
    }

    if (status) {
      const validStatuses = ["confirmed", "pending", "cancelled", "completed", "no-show"] as const;
      if (validStatuses.includes(status as typeof validStatuses[number])) {
        conditions.push(
          eq(appointments.status, status as typeof validStatuses[number])
        );
      }
    }

    if (dateFrom) {
      conditions.push(gte(appointments.date, dateFrom));
    }

    if (dateTo) {
      conditions.push(lte(appointments.date, dateTo));
    }

    if (clientId) {
      conditions.push(eq(appointments.clientId, clientId));
    }

    if (employeeId) {
      conditions.push(eq(appointments.employeeId, employeeId));
    }

    const whereClause = and(...conditions);

    const [data, totalResult] = await Promise.all([
      db
        .select({
          id: appointments.id,
          clientId: appointments.clientId,
          clientName: appointments.clientName,
          clientPhone: appointments.clientPhone,
          serviceId: appointments.serviceId,
          service: appointments.service,
          employeeId: appointments.employeeId,
          employee: appointments.employee,
          date: appointments.date,
          time: appointments.time,
          duration: appointments.duration,
          status: appointments.status,
          price: appointments.price,
          notes: appointments.notes,
          createdAt: appointments.createdAt,
          updatedAt: appointments.updatedAt,
        })
        .from(appointments)
        .where(whereClause)
        .orderBy(desc(appointments.date), desc(appointments.time))
        .limit(limit)
        .offset(offset),
      db
        .select({ total: count() })
        .from(appointments)
        .where(whereClause),
    ]);

    const total = totalResult[0]?.total ?? 0;

    return success({
      data: data.map((a) => ({
        ...a,
        price: parseFloat(a.price),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/v1/appointments error:", error);
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticateApiKey(req);
    if (!auth) return unauthorized();
    if (!checkRateLimit(auth.keyId)) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded" }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();

    // Validate required fields
    const { clientId, serviceId, employeeId, date, time, notes } = body;

    if (!clientId || !serviceId || !employeeId || !date || !time) {
      return badRequest("clientId, serviceId, employeeId, date, and time are required");
    }

    // Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return badRequest("date must be in YYYY-MM-DD format");
    }

    // Validate time format (HH:MM)
    if (!/^\d{2}:\d{2}$/.test(time)) {
      return badRequest("time must be in HH:MM format");
    }

    // Look up client
    const [client] = await db
      .select({ id: clients.id, name: clients.name, phone: clients.phone })
      .from(clients)
      .where(and(eq(clients.id, clientId), eq(clients.tenantId, auth.tenantId)))
      .limit(1);

    if (!client) return badRequest("Client not found");

    // Look up service
    const [service] = await db
      .select({
        id: services.id,
        name: services.name,
        duration: services.duration,
        price: services.price,
      })
      .from(services)
      .where(
        and(
          eq(services.id, serviceId),
          eq(services.tenantId, auth.tenantId),
          eq(services.status, "active")
        )
      )
      .limit(1);

    if (!service) return badRequest("Service not found or inactive");

    // Look up employee
    const [employee] = await db
      .select({ id: employees.id, name: employees.name })
      .from(employees)
      .where(
        and(
          eq(employees.id, employeeId),
          eq(employees.tenantId, auth.tenantId),
          eq(employees.status, "active")
        )
      )
      .limit(1);

    if (!employee) return badRequest("Employee not found or inactive");

    const [created] = await db
      .insert(appointments)
      .values({
        tenantId: auth.tenantId,
        clientId: client.id,
        clientName: client.name,
        clientPhone: client.phone,
        serviceId: service.id,
        service: service.name,
        employeeId: employee.id,
        employee: employee.name,
        date,
        time,
        duration: service.duration,
        status: "pending",
        price: service.price,
        notes: notes || null,
      })
      .returning();

    return success(
      {
        data: {
          ...created,
          price: parseFloat(created.price),
        },
      },
      201
    );
  } catch (error) {
    console.error("POST /api/v1/appointments error:", error);
    return serverError();
  }
}
