"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { KPICard } from "@/components/ui/kpi-card";
import { AppointmentsStatusChart } from "./appointments-status-chart";
import { AppointmentsTrendChart } from "@/components/charts/appointments-trend-chart";
import { AppointmentsTable } from "./appointments-table";
import { AppointmentCard } from "./appointment-card";
import { NewAppointmentSheet } from "./new-appointment-sheet";
import { Button } from "@/components/ui/button";
import { DynamicIcon } from "@/components/ui/dynamic-icon";
import {
  appointmentsKpiData,
  appointmentsByStatusData,
  appointmentsTrendData,
  appointmentsListData,
} from "@/lib/mock-data";

export function AppointmentsPageContent() {
  const t = useTranslations("appointments");
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {appointmentsKpiData.map((kpi) => (
          <KPICard key={kpi.id} data={kpi} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <AppointmentsStatusChart data={appointmentsByStatusData} />
        <AppointmentsTrendChart data={appointmentsTrendData} />
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">{t("appointmentsList")}</h2>
          <Button onClick={() => setSheetOpen(true)} size="sm">
            <DynamicIcon name="Plus" className="h-4 w-4" />
            {t("newAppointment")}
          </Button>
        </div>

        <AppointmentsTable data={appointmentsListData} />

        <div className="space-y-3 md:hidden">
          {appointmentsListData.map((appointment) => (
            <AppointmentCard key={appointment.id} data={appointment} />
          ))}
        </div>
      </div>

      <NewAppointmentSheet open={sheetOpen} onOpenChange={setSheetOpen} />
    </div>
  );
}
