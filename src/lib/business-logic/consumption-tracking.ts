import { db } from "@/db/db";
import {
  sessionConsumptionLogs,
  clientProductReservations,
  services,
  clients,
} from "@/db/schema";
import { eq, and, lte, sql, count } from "drizzle-orm";

export async function recordLaserConsumption(params: {
  tenantId: string;
  appointmentId: string;
  serviceId?: string;
  clientId?: string;
  actualShots: number;
  deviceId?: string;
  deviceModel?: string;
  notes?: string;
  recordedById?: string;
}) {
  // Get service config for expected range
  let expectedMinShots: number | undefined;
  let expectedMaxShots: number | undefined;

  if (params.serviceId) {
    const [service] = await db
      .select({ laserMinShots: services.laserMinShots, laserMaxShots: services.laserMaxShots })
      .from(services)
      .where(eq(services.id, params.serviceId))
      .limit(1);
    if (service) {
      expectedMinShots = service.laserMinShots ?? undefined;
      expectedMaxShots = service.laserMaxShots ?? undefined;
    }
  }

  // Compute deviation
  let shotDeviation: "within_range" | "below" | "above" = "within_range";
  if (expectedMinShots != null && params.actualShots < expectedMinShots) {
    shotDeviation = "below";
  } else if (expectedMaxShots != null && params.actualShots > expectedMaxShots) {
    shotDeviation = "above";
  }

  const [log] = await db
    .insert(sessionConsumptionLogs)
    .values({
      tenantId: params.tenantId,
      appointmentId: params.appointmentId,
      serviceId: params.serviceId,
      clientId: params.clientId,
      consumptionType: "laser_shots",
      actualShots: params.actualShots,
      expectedMinShots: expectedMinShots ?? null,
      expectedMaxShots: expectedMaxShots ?? null,
      shotDeviation,
      deviceId: params.deviceId,
      deviceModel: params.deviceModel,
      notes: params.notes,
      recordedById: params.recordedById,
    })
    .returning();

  return log;
}

export async function recordInjectableConsumption(params: {
  tenantId: string;
  appointmentId: string;
  serviceId?: string;
  clientId?: string;
  inventoryItemId?: string;
  productName: string;
  totalAllocated: number;
  amountUsed: number;
  unit: string;
  notes?: string;
  recordedById?: string;
}) {
  const leftoverAmount = params.totalAllocated - params.amountUsed;

  const [log] = await db
    .insert(sessionConsumptionLogs)
    .values({
      tenantId: params.tenantId,
      appointmentId: params.appointmentId,
      serviceId: params.serviceId,
      clientId: params.clientId,
      consumptionType: "injectable",
      inventoryItemId: params.inventoryItemId,
      productName: params.productName,
      totalAllocated: String(params.totalAllocated),
      amountUsed: String(params.amountUsed),
      leftoverAmount: String(leftoverAmount),
      unit: params.unit,
      notes: params.notes,
      recordedById: params.recordedById,
    })
    .returning();

  // If leftover > 0 and client exists, auto-create reservation
  let reservation = null;
  if (leftoverAmount > 0 && params.clientId) {
    // Get expiry days from service config
    let expiryDays = 14; // default
    if (params.serviceId) {
      const [service] = await db
        .select({ injectableExpiryDays: services.injectableExpiryDays })
        .from(services)
        .where(eq(services.id, params.serviceId))
        .limit(1);
      if (service?.injectableExpiryDays) {
        expiryDays = service.injectableExpiryDays;
      }
    }

    const today = new Date().toISOString().split("T")[0];
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + expiryDays);
    const expiryDateStr = expiryDate.toISOString().split("T")[0];

    [reservation] = await db
      .insert(clientProductReservations)
      .values({
        tenantId: params.tenantId,
        clientId: params.clientId,
        consumptionLogId: log.id,
        inventoryItemId: params.inventoryItemId,
        productName: params.productName,
        leftoverAmount: String(leftoverAmount),
        remainingAmount: String(leftoverAmount),
        unit: params.unit,
        originalAppointmentId: params.appointmentId,
        openedDate: today,
        expiryDate: expiryDateStr,
        expiryDays,
        status: "active",
      })
      .returning();
  }

  return { log, reservation };
}

export async function recordTouchUp(params: {
  tenantId: string;
  reservationId: string;
  touchUpAppointmentId?: string;
  touchUpAmountUsed: number;
  touchUpIsFree?: boolean;
  notes?: string;
}) {
  // Get current reservation
  const [reservation] = await db
    .select()
    .from(clientProductReservations)
    .where(
      and(
        eq(clientProductReservations.id, params.reservationId),
        eq(clientProductReservations.tenantId, params.tenantId)
      )
    )
    .limit(1);

  if (!reservation) {
    throw new Error("Reservation not found");
  }

  const currentRemaining = parseFloat(reservation.remainingAmount);
  if (params.touchUpAmountUsed > currentRemaining) {
    throw new Error("Touch-up amount exceeds remaining amount");
  }

  const newRemaining = currentRemaining - params.touchUpAmountUsed;
  const today = new Date().toISOString().split("T")[0];

  const [updated] = await db
    .update(clientProductReservations)
    .set({
      remainingAmount: String(newRemaining),
      touchUpAppointmentId: params.touchUpAppointmentId,
      touchUpDate: today,
      touchUpAmountUsed: String(params.touchUpAmountUsed),
      touchUpIsFree: params.touchUpIsFree ? 1 : 0,
      notes: params.notes || reservation.notes,
      status: newRemaining <= 0 ? "used" : "active",
      updatedAt: new Date(),
    })
    .where(eq(clientProductReservations.id, params.reservationId))
    .returning();

  return updated;
}

export async function expireReservations(tenantId?: string) {
  const today = new Date().toISOString().split("T")[0];

  const conditions = [
    eq(clientProductReservations.status, "active"),
    sql`${clientProductReservations.expiryDate} < ${today}`,
  ];

  if (tenantId) {
    conditions.push(eq(clientProductReservations.tenantId, tenantId));
  }

  const expired = await db
    .update(clientProductReservations)
    .set({
      status: "expired",
      updatedAt: new Date(),
    })
    .where(and(...conditions))
    .returning();

  return expired;
}

export async function getReservationsNearingExpiry(daysAhead: number, tenantId?: string) {
  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + daysAhead);
  const todayStr = today.toISOString().split("T")[0];
  const futureDateStr = futureDate.toISOString().split("T")[0];

  const conditions = [
    eq(clientProductReservations.status, "active"),
    sql`${clientProductReservations.expiryDate} >= ${todayStr}`,
    sql`${clientProductReservations.expiryDate} <= ${futureDateStr}`,
  ];

  if (tenantId) {
    conditions.push(eq(clientProductReservations.tenantId, tenantId));
  }

  const nearingExpiry = await db
    .select({
      reservation: clientProductReservations,
      clientName: clients.name,
      clientPhone: clients.phone,
    })
    .from(clientProductReservations)
    .innerJoin(clients, eq(clientProductReservations.clientId, clients.id))
    .where(and(...conditions));

  return nearingExpiry;
}

export async function getLeftoverDashboardData(tenantId: string) {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const threeDaysLater = new Date();
  threeDaysLater.setDate(today.getDate() + 7);
  const threeDaysStr = threeDaysLater.toISOString().split("T")[0];

  // Start of current month
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split("T")[0];

  const [activeCountResult, expiringSoonResult, monthlyExpiredResult] = await Promise.all([
    db
      .select({ total: count() })
      .from(clientProductReservations)
      .where(
        and(
          eq(clientProductReservations.tenantId, tenantId),
          eq(clientProductReservations.status, "active")
        )
      ),
    db
      .select({
        reservation: clientProductReservations,
        clientName: clients.name,
      })
      .from(clientProductReservations)
      .innerJoin(clients, eq(clientProductReservations.clientId, clients.id))
      .where(
        and(
          eq(clientProductReservations.tenantId, tenantId),
          eq(clientProductReservations.status, "active"),
          sql`${clientProductReservations.expiryDate} >= ${todayStr}`,
          sql`${clientProductReservations.expiryDate} <= ${threeDaysStr}`
        )
      )
      .orderBy(clientProductReservations.expiryDate)
      .limit(5),
    db
      .select({ total: count() })
      .from(clientProductReservations)
      .where(
        and(
          eq(clientProductReservations.tenantId, tenantId),
          eq(clientProductReservations.status, "expired"),
          sql`${clientProductReservations.updatedAt} >= ${monthStart}`
        )
      ),
  ]);

  const activeCount = activeCountResult[0]?.total ?? 0;
  const monthlyExpiredCount = monthlyExpiredResult[0]?.total ?? 0;

  const expiringSoonList = expiringSoonResult.map((row) => {
    const expiryDate = row.reservation.expiryDate;
    const daysLeft = expiryDate
      ? Math.ceil((new Date(expiryDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      : 0;
    return {
      ...row.reservation,
      leftoverAmount: parseFloat(row.reservation.leftoverAmount),
      remainingAmount: parseFloat(row.reservation.remainingAmount),
      touchUpAmountUsed: row.reservation.touchUpAmountUsed ? parseFloat(row.reservation.touchUpAmountUsed) : undefined,
      clientName: row.clientName,
      daysLeft,
    };
  });

  return {
    activeCount,
    expiringSoonCount: expiringSoonList.length,
    monthlyExpiredCount,
    expiringSoonList,
  };
}
