"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Phone, Mail, Calendar, Clock, TrendingUp,
  DollarSign, XCircle, Users, Star, BarChart3, Award, Briefcase, GraduationCap, FileText,
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
import { DoctorStatusBadge } from "./doctor-status-badge";
import { DoctorPerformanceBadge } from "./doctor-performance-badge";
import { DoctorInsightsPanel } from "./doctor-insights-panel";
import { DoctorDetailAppointmentsTable } from "./doctor-detail-appointments-table";
import { DoctorDetailCommissionsTable } from "./doctor-detail-commissions-table";
import { DoctorAppointmentCard } from "./doctor-appointment-card";
import { DoctorCommissionCard } from "./doctor-commission-card";
import { useDoctorDetails, useUpdateAppointment, useDeleteAppointment } from "@/lib/hooks";
import { ActivityTimeline } from "@/components/activity/activity-timeline";
import { DoctorScheduleCard } from "./doctor-schedule-card";
import { Price } from "@/components/ui/price";
import type { AppointmentStatus } from "@/types";

interface DoctorDetailPageProps {
  doctorId: string;
}

export function DoctorDetailPage({ doctorId }: DoctorDetailPageProps) {
  const t = useTranslations("doctors");
  const tc = useTranslations("common");
  const router = useRouter();
  const { data, isLoading, error } = useDoctorDetails(doctorId);
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
        <Button variant="ghost" onClick={() => router.push("/doctors")} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          {t("backToDoctors")}
        </Button>
        <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
          {error?.message || "Doctor not found"}
        </div>
      </div>
    );
  }

  const { doctor, kpis, analytics, recentAppointments, recentCommissions } = data;

  const kpiCards = [
    {
      label: t("kpiTotalConsultations"),
      value: String(kpis.totalConsultations),
      icon: <Calendar className="h-5 w-5 text-gold" />,
    },
    {
      label: t("kpiRevenueGenerated"),
      value: <Price value={kpis.revenueGenerated} />,
      icon: <DollarSign className="h-5 w-5 text-gold" />,
    },
    {
      label: t("kpiAvgRevenuePerConsultation"),
      value: <Price value={kpis.avgRevenuePerConsultation} />,
      icon: <TrendingUp className="h-5 w-5 text-gold" />,
    },
    {
      label: t("kpiCommissionEarned"),
      value: <Price value={kpis.commissionEarned} />,
      icon: <Briefcase className="h-5 w-5 text-gold" />,
    },
    {
      label: t("kpiUniquePatients"),
      value: String(kpis.uniquePatients),
      icon: <Users className="h-5 w-5 text-gold" />,
    },
    {
      label: t("kpiRetentionRate"),
      value: `${kpis.patientRetentionRate}%`,
      icon: <BarChart3 className="h-5 w-5 text-gold" />,
    },
    {
      label: t("kpiCancellationRate"),
      value: `${kpis.cancellationRate}%`,
      icon: <XCircle className="h-5 w-5 text-gold" />,
    },
    {
      label: t("kpiRating"),
      value: kpis.rating > 0 ? String(kpis.rating) : "—",
      icon: <Star className="h-5 w-5 text-gold" />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button variant="ghost" onClick={() => router.push("/doctors")} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        {t("backToDoctors")}
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
              <AvatarFallback className="text-lg">{doctor.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-foreground">{doctor.name}</h1>
                <DoctorStatusBadge status={doctor.status} />
                <DoctorPerformanceBadge tier={analytics.performanceTier} />
              </div>
              <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                {doctor.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" />
                    <span className="font-english">{doctor.phone}</span>
                  </span>
                )}
                {doctor.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5" />
                    <span className="font-english">{doctor.email}</span>
                  </span>
                )}
                {doctor.licenseNumber && (
                  <span className="flex items-center gap-1">
                    <Award className="h-3.5 w-3.5" />
                    <span className="font-english">{doctor.licenseNumber}</span>
                  </span>
                )}
              </div>
              {doctor.rating > 0 && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground/60">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span className="font-english">{doctor.rating}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bio, Education, Certificates, Compensation info */}
        <div className="mt-4 space-y-3">
          {doctor.bio && (
            <div className="rounded-md bg-secondary/30 p-3 text-sm text-muted-foreground">
              <span className="font-semibold">{t("bio")}:</span> {doctor.bio}
            </div>
          )}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {doctor.education && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <GraduationCap className="h-3.5 w-3.5" />
                <span>{t("education")}: {doctor.education}</span>
              </div>
            )}
            {doctor.certificates && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-3.5 w-3.5" />
                <span>{t("certificates")}: {doctor.certificates}</span>
              </div>
            )}
            {doctor.yearsOfExperience > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span>{t("yearsOfExperience")}: <span className="font-english">{doctor.yearsOfExperience}</span></span>
              </div>
            )}
            {doctor.salary > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <DollarSign className="h-3.5 w-3.5" />
                <span>{t("monthlySalary")}: <span className="font-english"><Price value={doctor.salary} /></span></span>
              </div>
            )}
            {doctor.commissionRate > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Briefcase className="h-3.5 w-3.5" />
                <span>{t("commissionRatePercent")}: <span className="font-english">{doctor.commissionRate}%</span></span>
              </div>
            )}
          </div>
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
      <DoctorInsightsPanel analytics={analytics} />

      {/* Tabs: Consultations & Commissions */}
      <Tabs defaultValue="consultations">
        <TabsList>
          <TabsTrigger value="consultations">
            {t("tabConsultations")} ({recentAppointments.length})
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

        <TabsContent value="consultations">
          <DoctorDetailAppointmentsTable data={recentAppointments} onStatusChange={handleApptStatusChange} onDelete={handleApptDelete} />
          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {recentAppointments.length === 0 ? (
              <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
                {t("noConsultations")}
              </div>
            ) : (
              recentAppointments.map((appt) => (
                <DoctorAppointmentCard key={appt.id} data={appt} onStatusChange={handleApptStatusChange} onDelete={handleApptDelete} />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="commissions">
          <DoctorDetailCommissionsTable data={recentCommissions} />
          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {recentCommissions.length === 0 ? (
              <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
                {t("noCommissions")}
              </div>
            ) : (
              recentCommissions.map((comm) => (
                <DoctorCommissionCard key={comm.id} data={comm} />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="schedule">
          <DoctorScheduleCard doctorId={doctorId} />
        </TabsContent>

        <TabsContent value="activity">
          <div className="rounded-lg border border-border bg-card p-6">
            <ActivityTimeline entityType="doctor" entityId={doctorId} />
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
