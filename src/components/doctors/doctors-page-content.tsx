"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { KPICard } from "@/components/ui/kpi-card";
import { DoctorsSpecialtyChart } from "./doctors-specialty-chart";
import { DoctorsConsultationsChart } from "./doctors-consultations-chart";
import { DoctorsTable } from "./doctors-table";
import { DoctorCard } from "./doctor-card";
import { NewDoctorSheet } from "./new-doctor-sheet";
import { Button } from "@/components/ui/button";
import { DynamicIcon } from "@/components/ui/dynamic-icon";
import {
  doctorsKpiData,
  doctorsBySpecialtyData,
  doctorsConsultationsTrendData,
  doctorsListData,
} from "@/lib/mock-data";

export function DoctorsPageContent() {
  const t = useTranslations("doctors");
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {doctorsKpiData.map((kpi) => (
          <KPICard key={kpi.id} data={kpi} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <DoctorsSpecialtyChart data={doctorsBySpecialtyData} />
        <DoctorsConsultationsChart data={doctorsConsultationsTrendData} />
      </div>

      {/* Doctors List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">{t("doctorsList")}</h2>
          <Button onClick={() => setSheetOpen(true)} size="sm">
            <DynamicIcon name="Plus" className="h-4 w-4" />
            {t("newDoctor")}
          </Button>
        </div>

        <DoctorsTable data={doctorsListData} />

        <div className="space-y-3 md:hidden">
          {doctorsListData.map((doctor) => (
            <DoctorCard key={doctor.id} data={doctor} />
          ))}
        </div>
      </div>

      <NewDoctorSheet open={sheetOpen} onOpenChange={setSheetOpen} />
    </div>
  );
}
