"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Search, Trash2, UserCheck, UserX, Clock } from "lucide-react";
import { useRowSelection } from "@/hooks/use-row-selection";
import { BulkActionBar } from "@/components/ui/bulk-action-bar";
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
import { useEmployees, useDeleteEmployee, useBulkDeleteEmployees, useBulkUpdateEmployeeStatus } from "@/lib/hooks/use-employees";
import { Employee } from "@/types";

export function EmployeesPageContent() {
  const t = useTranslations("employees");
  const tc = useTranslations("common");
  const [searchQuery, setSearchQuery] = useState("");
  const { data } = useEmployees();
  const items = data?.data ?? [];
  const deleteEmployee = useDeleteEmployee();
  const bulkDeleteEmployees = useBulkDeleteEmployees();
  const bulkUpdateStatus = useBulkUpdateEmployeeStatus();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editItem, setEditItem] = useState<Employee | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkStatusOpen, setBulkStatusOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState("");

  const filtered = items.filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return item.name.toLowerCase().includes(q) || item.phone.includes(q) || item.role.toLowerCase().includes(q) || item.specialties.toLowerCase().includes(q);
  });

  const ids = useMemo(() => filtered.map((e) => e.id), [filtered]);
  const { selectedIds, selectedCount, isAllSelected, isSomeSelected, toggle, toggleAll, clearSelection } = useRowSelection(ids);

  const handleEdit = (item: Employee) => { setEditItem(item); setSheetOpen(true); };
  const handleDelete = (id: string) => { setDeleteId(id); };
  const confirmDelete = () => { if (deleteId) { deleteEmployee.mutate(deleteId, { onSuccess: () => { toast.success(tc("deleteSuccess")); } }); setDeleteId(null); } };
  const confirmBulkDelete = () => { bulkDeleteEmployees.mutate(selectedIds, { onSuccess: (res) => { toast.success(tc("bulkDeleteSuccess", { count: res.deleted })); clearSelection(); setBulkDeleteOpen(false); } }); };
  const handleBulkStatus = (status: string) => { setPendingStatus(status); setBulkStatusOpen(true); };
  const confirmBulkStatus = () => { bulkUpdateStatus.mutate({ ids: selectedIds, status: pendingStatus }, { onSuccess: (res) => { toast.success(tc("bulkStatusSuccess", { count: res.updated })); clearSelection(); setBulkStatusOpen(false); } }); };

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
          <><EmployeesTable data={filtered} onEdit={handleEdit} onDelete={handleDelete} selectedIds={selectedIds} onToggle={toggle} onToggleAll={toggleAll} isAllSelected={isAllSelected} isSomeSelected={isSomeSelected} />
          <div className="space-y-3 md:hidden">{filtered.map((employee) => (<EmployeeCard key={employee.id} data={employee} onEdit={handleEdit} onDelete={handleDelete} />))}</div></>
        )}
      </div>
      <BulkActionBar selectedCount={selectedCount} onClearSelection={clearSelection} label={tc("selected", { count: selectedCount })} actions={[
        { id: "status-active", label: t("statusActive"), variant: "outline", icon: <UserCheck className="h-3.5 w-3.5" />, onClick: () => handleBulkStatus("active") },
        { id: "status-on-leave", label: t("statusOnLeave"), variant: "outline", icon: <Clock className="h-3.5 w-3.5" />, onClick: () => handleBulkStatus("on-leave") },
        { id: "status-inactive", label: t("statusInactive"), variant: "outline", icon: <UserX className="h-3.5 w-3.5" />, onClick: () => handleBulkStatus("inactive") },
        { id: "bulk-delete", label: tc("bulkDelete"), variant: "destructive", icon: <Trash2 className="h-3.5 w-3.5" />, onClick: () => setBulkDeleteOpen(true) },
      ]} />
      <NewEmployeeSheet open={sheetOpen} onOpenChange={setSheetOpen} editItem={editItem} />
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>{tc("deleteConfirmTitle")}</AlertDialogTitle><AlertDialogDescription>{tc("deleteConfirmMessage")}</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>{tc("cancelAction")}</AlertDialogCancel><AlertDialogAction onClick={confirmDelete}>{tc("confirmDelete")}</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>{tc("bulkDeleteConfirmTitle")}</AlertDialogTitle><AlertDialogDescription>{tc("bulkDeleteConfirmMessage", { count: selectedCount })}</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>{tc("cancelAction")}</AlertDialogCancel><AlertDialogAction onClick={confirmBulkDelete}>{tc("confirmDelete")}</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={bulkStatusOpen} onOpenChange={setBulkStatusOpen}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>{tc("bulkStatusConfirmTitle")}</AlertDialogTitle><AlertDialogDescription>{tc("bulkStatusConfirmMessage", { count: selectedCount, status: pendingStatus })}</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>{tc("cancelAction")}</AlertDialogCancel><AlertDialogAction onClick={confirmBulkStatus}>{tc("bulkStatusChange")}</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
