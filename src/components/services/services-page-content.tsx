"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Search, Trash2, CheckCircle, XCircle } from "lucide-react";
import { useRowSelection } from "@/hooks/use-row-selection";
import { BulkActionBar } from "@/components/ui/bulk-action-bar";
import { KPICard } from "@/components/ui/kpi-card";
import { ServicesCategoryChart } from "./services-category-chart";
import { ServicesBookingsChart } from "./services-bookings-chart";
import { ServicesTable } from "./services-table";
import { ServiceCard } from "./service-card";
import { NewServiceSheet } from "./new-service-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DynamicIcon } from "@/components/ui/dynamic-icon";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { servicesKpiData, servicesByCategoryData, servicesBookingsTrendData } from "@/lib/mock-data";
import { useServices, useDeleteService, useBulkDeleteServices, useBulkUpdateServiceStatus } from "@/lib/hooks/use-services";
import { Service } from "@/types";

export function ServicesPageContent() {
  const t = useTranslations("services");
  const tc = useTranslations("common");
  const [searchQuery, setSearchQuery] = useState("");
  const { data, isLoading } = useServices({ search: searchQuery });
  const deleteService = useDeleteService();
  const bulkDeleteServices = useBulkDeleteServices();
  const bulkUpdateStatus = useBulkUpdateServiceStatus();
  const services = data?.data ?? [];
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editItem, setEditItem] = useState<Service | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkStatusOpen, setBulkStatusOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState("");

  const filtered = services;
  const ids = useMemo(() => filtered.map((s) => s.id), [filtered]);
  const { selectedIds, selectedCount, isAllSelected, isSomeSelected, toggle, toggleAll, clearSelection } = useRowSelection(ids);

  const handleEdit = (item: Service) => { setEditItem(item); setSheetOpen(true); };
  const handleDelete = (id: string) => { setDeleteId(id); };
  const confirmDelete = () => { if (deleteId) { deleteService.mutate(deleteId, { onSuccess: () => { toast.success(tc("deleteSuccess")); setDeleteId(null); } }); } };
  const confirmBulkDelete = () => { bulkDeleteServices.mutate(selectedIds, { onSuccess: (res) => { toast.success(tc("bulkDeleteSuccess", { count: res.deleted })); clearSelection(); setBulkDeleteOpen(false); } }); };
  const handleBulkStatus = (status: string) => { setPendingStatus(status); setBulkStatusOpen(true); };
  const confirmBulkStatus = () => { bulkUpdateStatus.mutate({ ids: selectedIds, status: pendingStatus }, { onSuccess: (res) => { toast.success(tc("bulkStatusSuccess", { count: res.updated })); clearSelection(); setBulkStatusOpen(false); } }); };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{servicesKpiData.map((kpi) => (<KPICard key={kpi.id} data={kpi} />))}</div>
      <div className="grid gap-4 lg:grid-cols-2"><ServicesCategoryChart data={servicesByCategoryData} /><ServicesBookingsChart data={servicesBookingsTrendData} /></div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">{t("servicesList")}</h2>
          <Button onClick={() => { setEditItem(null); setSheetOpen(true); }} size="sm"><DynamicIcon name="Plus" className="h-4 w-4" />{t("newService")}</Button>
        </div>
        <div className="relative"><Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={tc("searchPlaceholder")} className="ps-9" /></div>
        {filtered.length === 0 ? (<p className="py-8 text-center text-sm text-muted-foreground">{tc("noResults")}</p>) : (
          <><ServicesTable data={filtered} onEdit={handleEdit} onDelete={handleDelete} selectedIds={selectedIds} onToggle={toggle} onToggleAll={toggleAll} isAllSelected={isAllSelected} isSomeSelected={isSomeSelected} />
          <div className="space-y-3 md:hidden">{filtered.map((service) => (<ServiceCard key={service.id} data={service} onEdit={handleEdit} onDelete={handleDelete} />))}</div></>
        )}
      </div>
      <BulkActionBar selectedCount={selectedCount} onClearSelection={clearSelection} label={tc("selected", { count: selectedCount })} actions={[
        { id: "status-active", label: t("statusActive"), variant: "outline", icon: <CheckCircle className="h-3.5 w-3.5" />, onClick: () => handleBulkStatus("active") },
        { id: "status-inactive", label: t("statusInactive"), variant: "outline", icon: <XCircle className="h-3.5 w-3.5" />, onClick: () => handleBulkStatus("inactive") },
        { id: "bulk-delete", label: tc("bulkDelete"), variant: "destructive", icon: <Trash2 className="h-3.5 w-3.5" />, onClick: () => setBulkDeleteOpen(true) },
      ]} />
      <NewServiceSheet open={sheetOpen} onOpenChange={setSheetOpen} editItem={editItem} />
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
