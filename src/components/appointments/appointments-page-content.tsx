"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { toast } from "sonner";
import { Search, Trash2, CheckCircle, XCircle, Clock, AlertTriangle, ExternalLink } from "lucide-react";
import { useRowSelection } from "@/hooks/use-row-selection";
import { BulkActionBar } from "@/components/ui/bulk-action-bar";
import { KPICard } from "@/components/ui/kpi-card";
import { AppointmentsStatusChart } from "./appointments-status-chart";
import { AppointmentsTrendChart } from "@/components/charts/appointments-trend-chart";
import { AppointmentsTable } from "./appointments-table";
import { AppointmentCard } from "./appointment-card";
import { NewAppointmentSheet } from "./new-appointment-sheet";
import { CheckoutSheet } from "@/components/invoices/checkout-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DynamicIcon } from "@/components/ui/dynamic-icon";
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
import {
  appointmentsKpiData,
  appointmentsByStatusData,
  appointmentsTrendData,
} from "@/lib/mock-data";
import { useAppointments, useDeleteAppointment, useUpdateAppointment, useBulkDeleteAppointments, useBulkUpdateAppointmentStatus } from "@/lib/hooks/use-appointments";
import { Appointment, AppointmentStatus } from "@/types";

export function AppointmentsPageContent() {
  const t = useTranslations("appointments");
  const tc = useTranslations("common");
  const [searchQuery, setSearchQuery] = useState("");
  const { data } = useAppointments();
  const items = data?.data ?? [];
  const deleteAppointment = useDeleteAppointment();
  const bulkDeleteAppointments = useBulkDeleteAppointments();
  const bulkUpdateStatus = useBulkUpdateAppointmentStatus();
  const updateAppointment = useUpdateAppointment();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editItem, setEditItem] = useState<Appointment | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkStatusOpen, setBulkStatusOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState("");
  const [checkoutItem, setCheckoutItem] = useState<Appointment | null>(null);

  const filtered = items.filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.clientName.toLowerCase().includes(q) ||
      item.clientPhone.includes(q) ||
      item.service.toLowerCase().includes(q) ||
      item.employee.toLowerCase().includes(q)
    );
  });

  const ids = useMemo(() => filtered.map((a) => a.id), [filtered]);
  const { selectedIds, selectedCount, isAllSelected, isSomeSelected, toggle, toggleAll, clearSelection } = useRowSelection(ids);

  const handleEdit = (item: Appointment) => {
    setEditItem(item);
    setSheetOpen(true);
  };

  const handleCheckout = (item: Appointment) => {
    setCheckoutItem(item);
  };

  const handleCheckoutComplete = () => {
    if (checkoutItem) {
      updateAppointment.mutate({ id: checkoutItem.id, data: { status: "completed" } });
    }
  };

  const handleStatusChange = (id: string, status: AppointmentStatus) => {
    updateAppointment.mutate(
      { id, data: { status } },
      { onSuccess: () => { toast.success(tc("updateSuccess")); } }
    );
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteAppointment.mutate(deleteId, { onSuccess: () => { toast.success(tc("deleteSuccess")); } });
      setDeleteId(null);
    }
  };

  const confirmBulkDelete = () => { bulkDeleteAppointments.mutate(selectedIds, { onSuccess: (res) => { toast.success(tc("bulkDeleteSuccess", { count: res.deleted })); clearSelection(); setBulkDeleteOpen(false); } }); };
  const handleBulkStatus = (status: string) => { setPendingStatus(status); setBulkStatusOpen(true); };
  const confirmBulkStatus = () => { bulkUpdateStatus.mutate({ ids: selectedIds, status: pendingStatus }, { onSuccess: (res) => { toast.success(tc("bulkStatusSuccess", { count: res.updated })); clearSelection(); setBulkStatusOpen(false); } }); };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {appointmentsKpiData.map((kpi) => (
          <KPICard key={kpi.id} data={kpi} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <AppointmentsStatusChart data={appointmentsByStatusData} />
        <AppointmentsTrendChart data={appointmentsTrendData} />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">{t("appointmentsList")}</h2>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/appointments/new">
                <ExternalLink className="h-4 w-4" />
                {t("openFullForm")}
              </Link>
            </Button>
            <Button onClick={() => { setEditItem(null); setSheetOpen(true); }} size="sm">
              <DynamicIcon name="Plus" className="h-4 w-4" />
              {t("newAppointment")}
            </Button>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={tc("searchPlaceholder")}
            className="ps-9"
          />
        </div>

        {filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">{tc("noResults")}</p>
        ) : (
          <>
            <AppointmentsTable data={filtered} onEdit={handleEdit} onDelete={handleDelete} onCheckout={handleCheckout} onStatusChange={handleStatusChange} selectedIds={selectedIds} onToggle={toggle} onToggleAll={toggleAll} isAllSelected={isAllSelected} isSomeSelected={isSomeSelected} />
            <div className="space-y-3 md:hidden">
              {filtered.map((appointment) => (
                <AppointmentCard key={appointment.id} data={appointment} onEdit={handleEdit} onDelete={handleDelete} onCheckout={handleCheckout} onStatusChange={handleStatusChange} />
              ))}
            </div>
          </>
        )}
      </div>

      <BulkActionBar selectedCount={selectedCount} onClearSelection={clearSelection} label={tc("selected", { count: selectedCount })} actions={[
        { id: "status-confirmed", label: t("statusConfirmed"), variant: "outline", icon: <CheckCircle className="h-3.5 w-3.5" />, onClick: () => handleBulkStatus("confirmed") },
        { id: "status-completed", label: t("statusCompleted"), variant: "outline", icon: <CheckCircle className="h-3.5 w-3.5" />, onClick: () => handleBulkStatus("completed") },
        { id: "status-cancelled", label: t("statusCancelled"), variant: "outline", icon: <XCircle className="h-3.5 w-3.5" />, onClick: () => handleBulkStatus("cancelled") },
        { id: "status-no-show", label: t("statusNoShow"), variant: "outline", icon: <AlertTriangle className="h-3.5 w-3.5" />, onClick: () => handleBulkStatus("no-show") },
        { id: "bulk-delete", label: tc("bulkDelete"), variant: "destructive", icon: <Trash2 className="h-3.5 w-3.5" />, onClick: () => setBulkDeleteOpen(true) },
      ]} />

      <NewAppointmentSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        editItem={editItem}
      />

      <CheckoutSheet
        open={!!checkoutItem}
        onOpenChange={(open) => !open && setCheckoutItem(null)}
        appointment={checkoutItem}
        onComplete={handleCheckoutComplete}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tc("deleteConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{tc("deleteConfirmMessage")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tc("cancelAction")}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>{tc("confirmDelete")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tc("bulkDeleteConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{tc("bulkDeleteConfirmMessage", { count: selectedCount })}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tc("cancelAction")}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmBulkDelete}>{tc("confirmDelete")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={bulkStatusOpen} onOpenChange={setBulkStatusOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tc("bulkStatusConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{tc("bulkStatusConfirmMessage", { count: selectedCount, status: pendingStatus })}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tc("cancelAction")}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmBulkStatus}>{tc("bulkStatusChange")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
