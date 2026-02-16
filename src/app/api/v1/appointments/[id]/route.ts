import { NextRequest } from "next/server";
import { authenticateApiKey, checkRateLimit } from "@/lib/api-v1-auth";
import {
  unauthorized,
  badRequest,
  notFound,
  success,
  serverError,
} from "@/lib/api-utils";
import { db } from "@/db/db";
import { appointments } from "@/db/schema";
import { eq, and } from "drizzle-orm";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const auth = await authenticateApiKey(req);
    if (!auth) return unauthorized();
    if (!checkRateLimit(auth.keyId)) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded" }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }

    const { id } = await params;

    const [appointment] = await db
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
      .where(
        and(
          eq(appointments.id, id),
          eq(appointments.tenantId, auth.tenantId)
        )
      )
      .limit(1);

    if (!appointment) return notFound("Appointment not found");

    return success({
      data: {
        ...appointment,
        price: parseFloat(appointment.price),
      },
    });
  } catch (error) {
    console.error("GET /api/v1/appointments/[id] error:", error);
    return serverError();
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const auth = await authenticateApiKey(req);
    if (!auth) return unauthorized();
    if (!checkRateLimit(auth.keyId)) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded" }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }

    const { id } = await params;
    const body = await req.json();

    const { status, notes } = body;

    // Only allow updating status and notes via API
    const validStatuses = ["confirmed", "pending", "cancelled", "completed", "no-show"] as const;

    if (status && !validStatuses.includes(status)) {
      return badRequest(
        `Invalid status. Must be one of: ${validStatuses.join(", ")}`
      );
    }

    if (!status && notes === undefined) {
      return badRequest("At least one of status or notes must be provided");
    }

    // Check appointment exists and belongs to tenant
    const [existing] = await db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.id, id),
          eq(appointments.tenantId, auth.tenantId)
        )
      )
      .limit(1);

    if (!existing) return notFound("Appointment not found");

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (status) {
      updateData.status = status;
    }

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    const [updated] = await db
      .update(appointments)
      .set(updateData)
      .where(
        and(
          eq(appointments.id, id),
          eq(appointments.tenantId, auth.tenantId)
        )
      )
      .returning();

    if (!updated) return notFound("Appointment not found");

    return success({
      data: {
        id: updated.id,
        clientId: updated.clientId,
        clientName: updated.clientName,
        clientPhone: updated.clientPhone,
        serviceId: updated.serviceId,
        service: updated.service,
        employeeId: updated.employeeId,
        employee: updated.employee,
        date: updated.date,
        time: updated.time,
        duration: updated.duration,
        status: updated.status,
        price: parseFloat(updated.price),
        notes: updated.notes,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      },
    });
  } catch (error) {
    console.error("PATCH /api/v1/appointments/[id] error:", error);
    return serverError();
  }
}
