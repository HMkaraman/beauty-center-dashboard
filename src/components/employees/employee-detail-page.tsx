"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Phone, Mail, Calendar, Clock, TrendingUp,
  DollarSign, XCircle, Users, Percent, BarChart3, Briefcase,
  IdCard, AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { EmployeeStatusBadge } from "./employee-status-badge";
import { EmployeePerformanceBadge } from "./employee-performance-badge";
import { EmployeeInsightsPanel } from "./employee-insights-panel";
import { EmployeeDetailAppointmentsTable } from "./employee-detail-appointments-table";
import { EmployeeDetailCommissionsTable } from "./employee-detail-commissions-table";
import { EmployeeAppointmentCard } from "./employee-appointment-card";
import { EmployeeCommissionCard } from "./employee-commission-card";
import { useEmployeeDetails, useUpdateAppointment, useDeleteAppointment } from "@/lib/hooks";
import { ActivityTimeline } from "@/components/activity/activity-timeline";
import { EmployeeScheduleCard } from "./employee-schedule-card";
import { Price } from "@/components/ui/price";
import type { AppointmentStatus } from "@/types";

interface EmployeeDetailPageProps {
  employeeId: string;
}

export function EmployeeDetailPage({ employeeId }: EmployeeDetailPageProps) {
  const t = useTranslations("employees");
  const tc = useTranslations("common");
  const router = useRouter();
  const { data, isLoading, error } = useEmployeeDetails(employeeId);
  const updateAppointment = useUpdateAppointment();
  const deleteAppointment = useDeleteAppointment();
  const [deleteApptId, setDeleteApptId] = useState<string | null>(null);

  const handleApptStatusChange = (id: string, status: AppointmentStatus) => {
    updateAppointment.mutate(
      { id, data: { status } },
      { onSuccess: () => { toast.success(tc("updateSuccess")); } }
    );
  };

  const handleApptDelete = (id: string) => {
    setDeleteApptId(id);
  };

  const confirmApptDelete = () => {
    if (deleteApptId) {
      deleteAppointment.mutate(deleteApptId, { onSuccess: () => { toast.success(tc("deleteSuccess")); } });
      setDeleteApptId(null);
    }
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.push("/employees")} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          {t("backToEmployees")}
        </Button>
        <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
          {error?.message || "Employee not found"}
        </div>
      </div>
    );
  }

  const { employee, kpis, analytics, recentAppointments, recentCommissions } = data;

  const kpiCards = [
    {
      label: t("kpiTotalAppointments"),
      value: String(kpis.totalAppointments),
      icon: <Calendar className="h-5 w-5 text-gold" />,
    },
    {
      label: t("kpiRevenueGenerated"),
      value: <Price value={kpis.revenueGenerated} />,
      icon: <DollarSign className="h-5 w-5 text-gold" />,
    },
    {
      label: t("kpiAvgRevenuePerVisit"),
      value: <Price value={kpis.avgRevenuePerVisit} />,
      icon: <TrendingUp className="h-5 w-5 text-gold" />,
    },
    {
      label: t("kpiCommissionEarned"),
      value: <Price value={kpis.commissionEarned} />,
      icon: <Briefcase className="h-5 w-5 text-gold" />,
    },
    {
      label: t("kpiUniqueClients"),
      value: String(kpis.uniqueClients),
      icon: <Users className="h-5 w-5 text-gold" />,
    },
    {
      label: t("kpiRetentionRate"),
      value: `${kpis.clientRetentionRate}%`,
      icon: <BarChart3 className="h-5 w-5 text-gold" />,
    },
    {
      label: t("kpiCancellationRate"),
      value: `${kpis.cancellationRate}%`,
      icon: <XCircle className="h-5 w-5 text-gold" />,
    },
    {
      label: t("kpiUtilizationRate"),
      value: `${kpis.utilizationRate}%`,
      icon: <Percent className="h-5 w-5 text-gold" />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button variant="ghost" onClick={() => router.push("/employees")} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        {t("backToEmployees")}
      </Button>

      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-lg border border-border bg-card p-6"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <Avatar size="lg" className="!size-16">
              <AvatarFallback className="text-lg">{employee.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-foreground">{employee.name}</h1>
                <EmployeeStatusBadge status={employee.status} />
                <EmployeePerformanceBadge tier={analytics.performanceTier} />
              </div>
              <p className="text-sm text-muted-foreground">{employee.role}</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                {employee.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" />
                    <span className="font-english">{employee.phone}</span>
                  </span>
                )}
                {employee.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5" />
                    <span className="font-english">{employee.email}</span>
                  </span>
                )}
              </div>
              {employee.hireDate && (
                <p className="text-xs text-muted-foreground/60">
                  {t("hireDate")}: <span className="font-english">{employee.hireDate}</span>
                </p>
              )}
            </div>
          </div>
        </div>
        {employee.specialties && (
          <div className="mt-4 rounded-md bg-secondary/30 p-3 text-sm text-muted-foreground">
            {t("specialties")}: {employee.specialties}
          </div>
        )}
        {/* Additional profile info */}
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {employee.salary > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <DollarSign className="h-3.5 w-3.5" />
              <span>{t("monthlySalary")}: <span className="font-english"><Price value={employee.salary} /></span></span>
            </div>
          )}
          {employee.nationalId && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <IdCard className="h-3.5 w-3.5" />
              <span>{t("nationalId")}: <span className="font-english">{employee.nationalId}</span></span>
            </div>
          )}
          {employee.emergencyContact && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>{t("emergencyContact")}: {employee.emergencyContact}</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-8">
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
      <EmployeeInsightsPanel analytics={analytics} />

      {/* Tabs: Appointments & Commissions */}
      <Tabs defaultValue="appointments">
        <TabsList>
          <TabsTrigger value="appointments">
            {t("tabAppointments")} ({recentAppointments.length})
          </TabsTrigger>
          <TabsTrigger value="commissions">
            {t("tabCommissions")} ({recentCommissions.length})
          </TabsTrigger>
          <TabsTrigger value="schedule">
            {t("tabSchedule")}
          </TabsTrigger>
          <TabsTrigger value="activity">
            {t("tabActivity")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="appointments">
          <EmployeeDetailAppointmentsTable data={recentAppointments} onStatusChange={handleApptStatusChange} onDelete={handleApptDelete} />
          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {recentAppointments.length === 0 ? (
              <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
                {t("noAppointments")}
              </div>
            ) : (
              recentAppointments.map((appt) => (
                <EmployeeAppointmentCard key={appt.id} data={appt} onStatusChange={handleApptStatusChange} onDelete={handleApptDelete} />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="commissions">
          <EmployeeDetailCommissionsTable data={recentCommissions} />
          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {recentCommissions.length === 0 ? (
              <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
                {t("noCommissions")}
              </div>
            ) : (
              recentCommissions.map((comm) => (
                <EmployeeCommissionCard key={comm.id} data={comm} />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="schedule">
          <EmployeeScheduleCard employeeId={employeeId} />
        </TabsContent>

        <TabsContent value="activity">
          <div className="rounded-lg border border-border bg-card p-6">
            <ActivityTimeline entityType="employee" entityId={employeeId} />
          </div>
        </TabsContent>
      </Tabs>

      <AlertDialog open={!!deleteApptId} onOpenChange={(open) => !open && setDeleteApptId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tc("deleteConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{tc("deleteConfirmMessage")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tc("cancelAction")}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmApptDelete}>{tc("confirmDelete")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-8">
        {Array.from({ length: 8 }).map((_, i) => (
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
