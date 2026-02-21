"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft, User, Phone, Calendar, Clock, DollarSign,
  Scissors, UserCheck, Zap, Syringe, Pencil, Users,
  TrendingUp, Image as ImageIcon, Stethoscope, Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AppointmentStatusBadge } from "./appointment-status-badge";
import { CheckoutSheet } from "@/components/invoices/checkout-sheet";
import { ActivityTimeline } from "@/components/activity/activity-timeline";
import { ClientLeftoverBanner } from "./client-leftover-banner";
import { LaserConsumptionSheet } from "./laser-consumption-sheet";
import { InjectableConsumptionSheet } from "./injectable-consumption-sheet";
import { useAppointmentDetails, useUpdateAppointment, useDeleteAppointmentAttachment } from "@/lib/hooks/use-appointments";
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
  const { data, isLoading, error } = useAppointmentDetails(appointmentId);
  const updateAppointment = useUpdateAppointment();
  const deleteAttachment = useDeleteAppointmentAttachment();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [laserSheetOpen, setLaserSheetOpen] = useState(false);
  const [injectableSheetOpen, setInjectableSheetOpen] = useState(false);

  const appointment = data?.appointment;
  const kpis = data?.kpis;
  const groupAppointments = data?.groupAppointments ?? [];
  const attachments = data?.attachments ?? [];

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

  const handleDeleteAttachment = (attachmentId: string) => {
    deleteAttachment.mutate(
      { id: appointmentId, attachmentId },
      { onSuccess: () => toast.success(tc("deleteSuccess")) }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
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

  const canCheckout = !appointment.hasInvoice && appointment.status !== "cancelled" && appointment.status !== "no-show";
  const isLaserService = service?.serviceType === "laser";
  const isInjectableService = service?.serviceType === "injectable";
  const hasConsumptionLog = consumptionLogs.length > 0;

  const kpiCards = kpis
    ? [
        {
          label: t("clientVisitCount"),
          value: String(kpis.clientVisitCount),
          icon: <Users className="h-5 w-5 text-gold" />,
        },
        {
          label: t("clientTotalSpend"),
          value: <Price value={kpis.clientTotalSpend} />,
          icon: <DollarSign className="h-5 w-5 text-gold" />,
        },
        {
          label: t("servicePopularity"),
          value: String(kpis.servicePopularity),
          icon: <TrendingUp className="h-5 w-5 text-gold" />,
        },
        {
          label: t("employeeCompletionRate"),
          value: `${kpis.employeeCompletionRate}%`,
          icon: <UserCheck className="h-5 w-5 text-gold" />,
        },
      ]
    : [];

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
          <Button asChild>
            <Link href={`/appointments/${appointmentId}/edit`}>
              <Pencil className="h-4 w-4 me-2" />
              {t("editAppointment")}
            </Link>
          </Button>
        </div>
      </div>

      {/* Client Leftover Banner */}
      {appointment.clientId && (
        <ClientLeftoverBanner clientId={appointment.clientId} />
      )}

      {/* KPI Grid */}
      {kpiCards.length > 0 && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {kpiCards.map((kpi) => (
            <div
              key={kpi.label}
              className="rounded-lg border border-border bg-card p-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                  {kpi.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground truncate">{kpi.label}</p>
                  <p className="text-lg font-semibold text-foreground font-english">{kpi.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
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
          {appointment.doctor && (
            <DetailItem icon={Stethoscope} label={t("doctor")} value={appointment.doctor} />
          )}
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

      {/* Group Appointments */}
      {groupAppointments.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="mb-4 text-sm font-semibold text-foreground">{t("groupAppointments")}</h2>
          <div className="space-y-3">
            {groupAppointments.map((ga) => (
              <Link
                key={ga.id}
                href={`/appointments/${ga.id}`}
                className="flex items-center justify-between rounded-md border border-border p-3 transition-colors hover:bg-secondary/20"
              >
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{ga.service}</p>
                    <p className="text-xs text-muted-foreground">{ga.employee}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-english text-muted-foreground">{ga.date} {ga.time}</span>
                  <AppointmentStatusBadge status={ga.status} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Photo Gallery */}
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-foreground">{t("photosSection")}</h2>
        </div>
        {attachments.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("noPhotos")}</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {attachments.map((att) => (
              <div key={att.id} className="group relative rounded-lg border border-border overflow-hidden">
                <div className="aspect-square bg-muted">
                  {att.mimeType?.startsWith("image/") ? (
                    <img src={att.url} alt={att.caption || att.filename || ""} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="p-2">
                  {att.label && (
                    <span className="text-xs font-medium text-muted-foreground capitalize">{t(`label${att.label.charAt(0).toUpperCase() + att.label.slice(1)}` as "labelBefore")}</span>
                  )}
                  {att.caption && (
                    <p className="text-xs text-muted-foreground truncate">{att.caption}</p>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteAttachment(att.id)}
                  className="absolute top-2 end-2 rounded-full bg-background/80 p-1 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <Trash2 className="h-3 w-3 text-destructive" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Activity Timeline */}
      <div className="rounded-lg border border-border bg-card p-6">
        <ActivityTimeline entityType="appointment" entityId={appointmentId} />
      </div>

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
