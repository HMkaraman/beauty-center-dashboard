"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { KPICard } from "@/components/ui/kpi-card";
import { EmployeesDepartmentChart } from "./employees-department-chart";
import { EmployeesRevenueChart } from "./employees-revenue-chart";
import { EmployeesTable } from "./employees-table";
import { EmployeeCard } from "./employee-card";
import { NewEmployeeSheet } from "./new-employee-sheet";
import { Button } from "@/components/ui/button";
import { DynamicIcon } from "@/components/ui/dynamic-icon";
import {
  employeesKpiData,
  employeesByDepartmentData,
  employeesRevenueData,
  employeesListData,
} from "@/lib/mock-data";

export function EmployeesPageContent() {
  const t = useTranslations("employees");
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {employeesKpiData.map((kpi) => (
          <KPICard key={kpi.id} data={kpi} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <EmployeesDepartmentChart data={employeesByDepartmentData} />
        <EmployeesRevenueChart data={employeesRevenueData} />
      </div>

      {/* Employees List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">{t("employeesList")}</h2>
          <Button onClick={() => setSheetOpen(true)} size="sm">
            <DynamicIcon name="Plus" className="h-4 w-4" />
            {t("newEmployee")}
          </Button>
        </div>

        <EmployeesTable data={employeesListData} />

        <div className="space-y-3 md:hidden">
          {employeesListData.map((employee) => (
            <EmployeeCard key={employee.id} data={employee} />
          ))}
        </div>
      </div>

      <NewEmployeeSheet open={sheetOpen} onOpenChange={setSheetOpen} />
    </div>
  );
}
