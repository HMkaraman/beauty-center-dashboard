"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Search } from "lucide-react";
import { KPICard } from "@/components/ui/kpi-card";
import { EmployeesDepartmentChart } from "./employees-department-chart";
import { EmployeesRevenueChart } from "./employees-revenue-chart";
import { EmployeesTable } from "./employees-table";
import { EmployeeCard } from "./employee-card";
import { NewEmployeeSheet } from "./new-employee-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DynamicIcon } from "@/components/ui/dynamic-icon";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { employeesKpiData, employeesByDepartmentData, employeesRevenueData } from "@/lib/mock-data";
import { useEmployeesStore } from "@/store/useEmployeesStore";
import { Employee } from "@/types";

export function EmployeesPageContent() {
  const t = useTranslations("employees");
  const tc = useTranslations("common");
  const { items, searchQuery, setSearchQuery, deleteItem } = useEmployeesStore();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editItem, setEditItem] = useState<Employee | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = items.filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return item.name.toLowerCase().includes(q) || item.phone.includes(q) || item.role.toLowerCase().includes(q) || item.specialties.toLowerCase().includes(q);
  });

  const handleEdit = (item: Employee) => { setEditItem(item); setSheetOpen(true); };
  const handleDelete = (id: string) => { setDeleteId(id); };
  const confirmDelete = () => { if (deleteId) { deleteItem(deleteId); toast.success(tc("deleteSuccess")); setDeleteId(null); } };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{employeesKpiData.map((kpi) => (<KPICard key={kpi.id} data={kpi} />))}</div>
      <div className="grid gap-4 lg:grid-cols-2"><EmployeesDepartmentChart data={employeesByDepartmentData} /><EmployeesRevenueChart data={employeesRevenueData} /></div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">{t("employeesList")}</h2>
          <Button onClick={() => { setEditItem(null); setSheetOpen(true); }} size="sm"><DynamicIcon name="Plus" className="h-4 w-4" />{t("newEmployee")}</Button>
        </div>
        <div className="relative"><Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={tc("searchPlaceholder")} className="ps-9" /></div>
        {filtered.length === 0 ? (<p className="py-8 text-center text-sm text-muted-foreground">{tc("noResults")}</p>) : (
          <><EmployeesTable data={filtered} onEdit={handleEdit} onDelete={handleDelete} />
          <div className="space-y-3 md:hidden">{filtered.map((employee) => (<EmployeeCard key={employee.id} data={employee} onEdit={handleEdit} onDelete={handleDelete} />))}</div></>
        )}
      </div>
      <NewEmployeeSheet open={sheetOpen} onOpenChange={setSheetOpen} editItem={editItem} />
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>{tc("deleteConfirmTitle")}</AlertDialogTitle><AlertDialogDescription>{tc("deleteConfirmMessage")}</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>{tc("cancelAction")}</AlertDialogCancel><AlertDialogAction onClick={confirmDelete}>{tc("confirmDelete")}</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
