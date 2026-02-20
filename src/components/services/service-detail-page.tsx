"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Calendar, DollarSign, TrendingUp, Users,
  XCircle, Clock, Pencil, Package, Zap, Syringe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ServiceStatusBadge } from "./service-status-badge";
import { ServiceInsightsPanel } from "./service-insights-panel";
import { AppointmentStatusBadge } from "@/components/appointments/appointment-status-badge";
import { ActivityTimeline } from "@/components/activity/activity-timeline";
import { useServiceDetails } from "@/lib/hooks/use-services";
import { Price } from "@/components/ui/price";
import { Badge } from "@/components/ui/badge";

interface ServiceDetailPageProps {
  serviceId: string;
}

export function ServiceDetailPage({ serviceId }: ServiceDetailPageProps) {
  const t = useTranslations("services");
  const router = useRouter();
  const { data, isLoading, error } = useServiceDetails(serviceId);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.push("/services")} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          {t("backToServices")}
        </Button>
        <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
          {error?.message || "Service not found"}
        </div>
      </div>
    );
  }

  const { service, kpis, analytics, recentAppointments, inventoryRequirements, assignedEmployees } = data;

  const serviceTypeBadge = service.serviceType === "laser" ? (
    <Badge variant="outline" className="border-blue-500/30 bg-blue-500/10 text-blue-400">
      <Zap className="h-3 w-3 me-1" />{t("laser")}
    </Badge>
  ) : service.serviceType === "injectable" ? (
    <Badge variant="outline" className="border-purple-500/30 bg-purple-500/10 text-purple-400">
      <Syringe className="h-3 w-3 me-1" />{t("injectable")}
    </Badge>
  ) : null;

  const kpiCards = [
    {
      label: t("totalBookings"),
      value: String(kpis.totalBookings),
      icon: <Calendar className="h-5 w-5 text-gold" />,
    },
    {
      label: t("totalRevenue"),
      value: <Price value={kpis.totalRevenue} />,
      icon: <DollarSign className="h-5 w-5 text-gold" />,
    },
    {
      label: t("avgRevenue"),
      value: <Price value={kpis.avgRevenuePerBooking} />,
      icon: <TrendingUp className="h-5 w-5 text-gold" />,
    },
    {
      label: t("uniqueClients"),
      value: String(kpis.uniqueClients),
      icon: <Users className="h-5 w-5 text-gold" />,
    },
    {
      label: t("cancellationRate"),
      value: `${kpis.cancellationRate}%`,
      icon: <XCircle className="h-5 w-5 text-gold" />,
    },
    {
      label: t("lastBooked"),
      value: kpis.lastBooked || "—",
      icon: <Clock className="h-5 w-5 text-gold" />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button variant="ghost" onClick={() => router.push("/services")} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        {t("backToServices")}
      </Button>

      {/* Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-lg border border-border bg-card p-6"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <Avatar size="lg" className="!size-16">
              {service.image && <AvatarImage src={service.image} alt={service.name} />}
              <AvatarFallback className="text-lg">{service.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-foreground">{service.name}</h1>
                <ServiceStatusBadge status={service.status} />
                {serviceTypeBadge}
              </div>
              {service.nameEn && (
                <p className="text-sm text-muted-foreground font-english" dir="ltr">{service.nameEn}</p>
              )}
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span>{service.category}</span>
                <span className="font-english">{service.duration}{t("minutes")}</span>
                <span className="font-english font-medium text-foreground"><Price value={service.price} /></span>
              </div>
            </div>
          </div>
          <Button onClick={() => router.push(`/services/${serviceId}/edit`)} size="sm" className="gap-2">
            <Pencil className="h-4 w-4" />
            {t("editService")}
          </Button>
        </div>
        {service.description && (
          <div className="mt-4 rounded-md bg-secondary/30 p-3 text-sm text-muted-foreground">
            {service.description}
          </div>
        )}
        {/* Laser/Injectable info */}
        {service.serviceType === "laser" && service.laserMinShots != null && (
          <div className="mt-3 text-sm text-muted-foreground">
            <Zap className="inline h-3.5 w-3.5 me-1" />
            {service.laserMinShots} – {service.laserMaxShots} shots
          </div>
        )}
        {service.serviceType === "injectable" && service.injectableUnit && (
          <div className="mt-3 text-sm text-muted-foreground">
            <Syringe className="inline h-3.5 w-3.5 me-1" />
            {service.injectableUnit} · {service.injectableExpiryDays} days expiry
          </div>
        )}
      </motion.div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {kpiCards.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -2, boxShadow: "0 8px 30px rgba(196, 149, 106, 0.15)" }}
            className="rounded-lg border border-border bg-gradient-to-br from-card to-card/80 p-4"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold/15">
              {kpi.icon}
            </div>
            <div className="mt-3">
              <p className="text-lg font-bold font-english text-foreground">{kpi.value}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{kpi.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Insights Panel */}
      <ServiceInsightsPanel analytics={analytics} />

      {/* Tabs */}
      <Tabs defaultValue="appointments">
        <TabsList>
          <TabsTrigger value="appointments">
            {t("tabAppointments")} ({recentAppointments.length})
          </TabsTrigger>
          <TabsTrigger value="team">
            {t("tabTeam")} ({assignedEmployees.length})
          </TabsTrigger>
          <TabsTrigger value="inventory">
            {t("tabInventory")} ({inventoryRequirements.length})
          </TabsTrigger>
          <TabsTrigger value="activity">
            {t("tabActivity")}
          </TabsTrigger>
        </TabsList>

        {/* Appointments Tab */}
        <TabsContent value="appointments">
          {recentAppointments.length === 0 ? (
            <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
              {t("noAppointments")}
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block rounded-lg border border-border bg-card overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("name")}</th>
                      <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("date")}</th>
                      <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("duration")}</th>
                      <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("status")}</th>
                      <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("price")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentAppointments.map((appt) => (
                      <tr key={appt.id} className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors">
                        <td className="px-4 py-3 text-foreground">{appt.clientName}</td>
                        <td className="px-4 py-3 font-english text-muted-foreground">{appt.date} {appt.time}</td>
                        <td className="px-4 py-3 font-english text-muted-foreground">{appt.duration}{t("minutes")}</td>
                        <td className="px-4 py-3"><AppointmentStatusBadge status={appt.status} /></td>
                        <td className="px-4 py-3 font-english text-foreground"><Price value={appt.price} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Mobile cards */}
              <div className="space-y-3 md:hidden">
                {recentAppointments.map((appt) => (
                  <div key={appt.id} className="rounded-lg border border-border bg-card p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-foreground">{appt.clientName}</p>
                      <AppointmentStatusBadge status={appt.status} />
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                      <span className="font-english">{appt.date} {appt.time}</span>
                      <span className="font-english font-medium text-foreground"><Price value={appt.price} /></span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team">
          {assignedEmployees.length === 0 ? (
            <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
              {t("noTeamAssigned")}
            </div>
          ) : (
            <div className="rounded-lg border border-border bg-card divide-y divide-border">
              {assignedEmployees.map((emp) => (
                <div key={emp.id} className="flex items-center gap-3 p-4">
                  <Avatar size="sm">
                    <AvatarFallback>{emp.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-foreground">{emp.name}</p>
                    <p className="text-xs text-muted-foreground">{emp.role}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Inventory Tab */}
        <TabsContent value="inventory">
          {inventoryRequirements.length === 0 ? (
            <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
              {t("noInventory")}
            </div>
          ) : (
            <div className="rounded-lg border border-border bg-card divide-y divide-border">
              {inventoryRequirements.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">{item.inventoryItemName}</span>
                  </div>
                  <span className="text-sm font-english text-muted-foreground">x{item.quantityRequired}</span>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity">
          <div className="rounded-lg border border-border bg-card p-6">
            <ActivityTimeline entityType="service" entityId={serviceId} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-9 w-32 rounded-md bg-secondary/50" />
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 rounded-full bg-secondary/50" />
          <div className="space-y-2 flex-1">
            <div className="h-6 w-48 rounded bg-secondary/50" />
            <div className="h-4 w-64 rounded bg-secondary/50" />
            <div className="h-3 w-32 rounded bg-secondary/50" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border bg-card p-4 space-y-3">
            <div className="h-8 w-8 rounded-full bg-secondary/50" />
            <div className="space-y-1">
              <div className="h-5 w-16 rounded bg-secondary/50" />
              <div className="h-3 w-24 rounded bg-secondary/50" />
            </div>
          </div>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border bg-card p-5 h-32" />
        ))}
      </div>
      <div className="h-10 w-64 rounded-lg bg-secondary/50" />
      <div className="rounded-lg border border-border bg-card h-48" />
    </div>
  );
}
