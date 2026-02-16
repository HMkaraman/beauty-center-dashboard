import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/db/db";
import { tenants, services, employees, clients, appointments } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { success, notFound, badRequest, serverError } from "@/lib/api-utils";
import { checkConflict } from "@/lib/business-logic/scheduling";

const bookingSchema = z.object({
  clientName: z.string().min(1, "Client name is required"),
  clientPhone: z.string().min(1, "Client phone is required"),
  serviceId: z.string().min(1, "Service ID is required"),
  employeeId: z.string().min(1, "Employee ID is required"),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Time must be in HH:MM format"),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // 1. Validate request body with Zod
    const body = await req.json();
    const result = bookingSchema.safeParse(body);

    if (!result.success) {
      return badRequest(result.error.issues[0]?.message ?? "Invalid input");
    }

    const validated = result.data;

    // 2. Look up tenant by slug
    const [tenant] = await db
      .select()
      .from(tenants)
      .where(eq(tenants.slug, slug))
      .limit(1);

    if (!tenant) return notFound("Business not found");

    // 3. Look up service for name/price/duration
    const [service] = await db
      .select()
      .from(services)
      .where(eq(services.id, validated.serviceId))
      .limit(1);

    if (!service) return notFound("Service not found");

    // 4. Look up employee for name
    const [employee] = await db
      .select()
      .from(employees)
      .where(eq(employees.id, validated.employeeId))
      .limit(1);

    if (!employee) return notFound("Employee not found");

    // 5. Find or create client (by phone number within this tenant)
    let [existingClient] = await db
      .select()
      .from(clients)
      .where(
        and(
          eq(clients.tenantId, tenant.id),
          eq(clients.phone, validated.clientPhone)
        )
      )
      .limit(1);

    if (!existingClient) {
      const [newClient] = await db
        .insert(clients)
        .values({
          tenantId: tenant.id,
          name: validated.clientName,
          phone: validated.clientPhone,
          status: "active",
        })
        .returning();
      existingClient = newClient;
    }

    // 6. Check for conflicts using existing checkConflict()
    const conflict = await checkConflict({
      tenantId: tenant.id,
      employeeId: validated.employeeId,
      employee: employee.name,
      date: validated.date,
      time: validated.time,
      duration: service.duration,
    });

    if (conflict.hasConflict) {
      return badRequest(
        `This time slot is no longer available. The employee has a conflicting appointment at ${conflict.conflictingAppointment?.time}.`
      );
    }

    // 7. Create appointment with status "pending"
    const [appointment] = await db
      .insert(appointments)
      .values({
        tenantId: tenant.id,
        clientId: existingClient.id,
        clientName: validated.clientName,
        clientPhone: validated.clientPhone,
        serviceId: validated.serviceId,
        service: service.name,
        employeeId: validated.employeeId,
        employee: employee.name,
        date: validated.date,
        time: validated.time,
        duration: service.duration,
        status: "pending",
        price: service.price,
      })
      .returning();

    // 8. Return the created appointment
    return success(
      {
        id: appointment.id,
        clientName: appointment.clientName,
        service: appointment.service,
        employee: appointment.employee,
        date: appointment.date,
        time: appointment.time,
        duration: appointment.duration,
        status: appointment.status,
        price: parseFloat(appointment.price),
      },
      201
    );
  } catch (error) {
    console.error("POST /api/public/[slug]/book error:", error);
    return serverError();
  }
}
