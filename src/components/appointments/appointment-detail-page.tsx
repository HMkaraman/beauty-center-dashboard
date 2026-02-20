"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, User, Phone, Calendar, Clock, DollarSign, Scissors, UserCheck, Zap, Syringe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AppointmentStatusBadge } from "./appointment-status-badge";
import { NewAppointmentSheet } from "./new-appointment-sheet";
import { CheckoutSheet } from "@/components/invoices/checkout-sheet";
import { ActivityTimeline } from "@/components/activity/activity-timeline";
import { ClientLeftoverBanner } from "./client-leftover-banner";
import { LaserConsumptionSheet } from "./laser-consumption-sheet";
import { InjectableConsumptionSheet } from "./injectable-consumption-sheet";
import { useAppointment, useUpdateAppointment } from "@/lib/hooks/use-appointments";
import { useService } from "@/lib/hooks/use-services";
import { useConsumptionLogs } from "@/lib/hooks/use-consumption-tracking";
import { Price } from "@/components/ui/price";
import type { Appointment, AppointmentStatus } from "@/types";

const STATUSES: AppointmentStatus[] = ["confirmed", "pending", "waiting", "in-progress", "cancelled", "completed", "no-show"];

const STATUS_KEYS: Record<AppointmentStatus, string> = {
  confirmed: "statusConfirmed",
  pending: "statusPending",
  cancelled: "statusCancelled",
  completed: "statusCompleted",
  "no-show": "statusNoShow",
  waiting: "statusWaiting",
  "in-progress": "statusInProgress",
};

interface AppointmentDetailPageProps {
  appointmentId: string;
}

export function AppointmentDetailPage({ appointmentId }: AppointmentDetailPageProps) {
  const t = useTranslations("appointments");
  const tc = useTranslations("common");
  const tct = useTranslations("consumptionTracking");
  const router = useRouter();
  const { data: appointment, isLoading, error } = useAppointment(appointmentId);
  const updateAppointment = useUpdateAppointment();
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [laserSheetOpen, setLaserSheetOpen] = useState(false);
  const [injectableSheetOpen, setInjectableSheetOpen] = useState(false);

  // Get service details for consumption type
  const { data: service } = useService(appointment?.serviceId || "");
  // Get existing consumption logs for this appointment
  const { data: logsData } = useConsumptionLogs({ appointmentId });
  const consumptionLogs = logsData?.data ?? [];

  const handleStatusChange = (status: string) => {
    updateAppointment.mutate(
      { id: appointmentId, data: { status: status as AppointmentStatus } },
      { onSuccess: () => toast.success(tc("updateSuccess")) }
    );
  };

  const handleCheckoutComplete = () => {
    updateAppointment.mutate({ id: appointmentId, data: { status: "completed" } });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="h-64 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.push("/appointments")} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          {t("title")}
        </Button>
        <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
          {error?.message || "Appointment not found"}
        </div>
      </div>
    );
  }

  const canCheckout = appointment.status === "confirmed" || appointment.status === "pending";
  const isLaserService = service?.serviceType === "laser";
  const isInjectableService = service?.serviceType === "injectable";
  const hasConsumptionLog = consumptionLogs.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push("/appointments")} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          {t("title")}
        </Button>
        <div className="flex items-center gap-2">
          {canCheckout && (
            <Button variant="outline" onClick={() => setCheckoutOpen(true)}>
              {t("checkout")}
            </Button>
          )}
          <Button onClick={() => setEditSheetOpen(true)}>
            {t("edit")}
          </Button>
        </div>
      </div>

      {/* Client Leftover Banner */}
      {appointment.clientId && (
        <ClientLeftoverBanner clientId={appointment.clientId} />
      )}

      {/* Main Card */}
      <div className="rounded-lg border border-border bg-card">
        {/* Client + Status Header */}
        <div className="flex items-center justify-between border-b border-border p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <User className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">{appointment.clientName}</h1>
              {appointment.clientPhone && (
                <p className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Phone className="h-3 w-3" />
                  <span className="font-english" dir="ltr">{appointment.clientPhone}</span>
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <AppointmentStatusBadge status={appointment.status} />
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3">
          <DetailItem icon={Scissors} label={t("service")} value={appointment.service} />
          <DetailItem icon={UserCheck} label={t("employee")} value={appointment.employee} />
          <DetailItem icon={Calendar} label={t("date")} value={appointment.date} isLtr />
          <DetailItem icon={Clock} label={t("time")} value={appointment.time} isLtr />
          <DetailItem icon={Clock} label={t("duration")} value={`${appointment.duration} ${t("minutes")}`} isLtr />
          <DetailItem icon={DollarSign} label={t("price")} value={<Price value={appointment.price} />} isLtr />
        </div>

        {/* Notes */}
        {appointment.notes && (
          <div className="border-t border-border p-6">
            <p className="text-sm font-medium text-muted-foreground">{t("notes")}</p>
            <p className="mt-1 text-sm text-foreground">{appointment.notes}</p>
          </div>
        )}

        {/* Consumption Recording */}
        {(isLaserService || isInjectableService) && (
          <div className="border-t border-border p-6">
            <p className="mb-3 text-sm font-medium text-muted-foreground">{tct("recordConsumption")}</p>
            <div className="flex flex-wrap gap-2">
              {isLaserService && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLaserSheetOpen(true)}
                  className="gap-2"
                >
                  <Zap className="h-4 w-4" />
                  {tct("recordLaserShots")}
                </Button>
              )}
              {isInjectableService && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInjectableSheetOpen(true)}
                  className="gap-2"
                >
                  <Syringe className="h-4 w-4" />
                  {tct("recordInjectableConsumption")}
                </Button>
              )}
            </div>

            {/* Show existing consumption logs */}
            {hasConsumptionLog && (
              <div className="mt-4 space-y-2">
                {consumptionLogs.map((log) => (
                  <div key={log.id} className="rounded-md border border-border bg-muted/30 p-3 text-sm">
                    {log.consumptionType === "laser_shots" ? (
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-amber-500" />
                        <span className="font-english">{log.actualShots} {tct("shots")}</span>
                        {log.shotDeviation && (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            log.shotDeviation === "within_range" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                            log.shotDeviation === "below" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                            "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          }`}>
                            {tct(`deviation${log.shotDeviation === "within_range" ? "WithinRange" : log.shotDeviation === "below" ? "Below" : "Above"}`)}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Syringe className="h-4 w-4 text-blue-500" />
                        <span>{log.productName}</span>
                        <span className="font-english">{log.amountUsed}/{log.totalAllocated} {log.unit}</span>
                        {Number(log.leftoverAmount) > 0 && (
                          <span className="text-xs text-amber-600">({tct("leftover")}: {log.leftoverAmount} {log.unit})</span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Status Change */}
        <div className="border-t border-border p-6">
          <p className="mb-2 text-sm font-medium text-muted-foreground">{t("status")}</p>
          <Select value={appointment.status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {t(STATUS_KEYS[status] as "statusConfirmed")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="rounded-lg border border-border bg-card p-6">
        <ActivityTimeline entityType="appointment" entityId={appointmentId} />
      </div>

      <NewAppointmentSheet
        open={editSheetOpen}
        onOpenChange={setEditSheetOpen}
        editItem={appointment}
      />

      <CheckoutSheet
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        appointment={appointment}
        onComplete={handleCheckoutComplete}
      />

      {isLaserService && (
        <LaserConsumptionSheet
          open={laserSheetOpen}
          onOpenChange={setLaserSheetOpen}
          appointment={appointment}
          service={service}
        />
      )}

      {isInjectableService && (
        <InjectableConsumptionSheet
          open={injectableSheetOpen}
          onOpenChange={setInjectableSheetOpen}
          appointment={appointment}
          service={service}
        />
      )}
    </div>
  );
}

function DetailItem({
  icon: Icon,
  label,
  value,
  isLtr,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
  isLtr?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`text-sm font-medium text-foreground ${isLtr ? "font-english" : ""}`} dir={isLtr ? "ltr" : undefined}>
          {value}
        </p>
      </div>
    </div>
  );
}
