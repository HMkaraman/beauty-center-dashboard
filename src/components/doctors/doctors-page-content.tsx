"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { Search, Trash2, UserCheck, UserX, Clock, ExternalLink } from "lucide-react";
import { useRowSelection } from "@/hooks/use-row-selection";
import { BulkActionBar } from "@/components/ui/bulk-action-bar";
import { KPICard } from "@/components/ui/kpi-card";
import { DoctorsSpecialtyChart } from "./doctors-specialty-chart";
import { DoctorsConsultationsChart } from "./doctors-consultations-chart";
import { DoctorsTable } from "./doctors-table";
import { DoctorCard } from "./doctor-card";
import { NewDoctorSheet } from "./new-doctor-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DynamicIcon } from "@/components/ui/dynamic-icon";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { doctorsKpiData, doctorsBySpecialtyData, doctorsConsultationsTrendData } from "@/lib/mock-data";
import { useDoctors, useDeleteDoctor, useBulkDeleteDoctors, useBulkUpdateDoctorStatus } from "@/lib/hooks/use-doctors";
import { Doctor } from "@/types";

export function DoctorsPageContent() {
  const t = useTranslations("doctors");
  const tc = useTranslations("common");
  const [searchQuery, setSearchQuery] = useState("");
  const { data, isLoading } = useDoctors({ search: searchQuery });
  const deleteDoctor = useDeleteDoctor();
  const bulkDeleteDoctors = useBulkDeleteDoctors();
  const bulkUpdateStatus = useBulkUpdateDoctorStatus();
  const router = useRouter();
  const doctors = data?.data ?? [];
  const [sheetOpen, setSheetOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkStatusOpen, setBulkStatusOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState("");

  const filtered = doctors;
  const ids = useMemo(() => filtered.map((d) => d.id), [filtered]);
  const { selectedIds, selectedCount, isAllSelected, isSomeSelected, toggle, toggleAll, clearSelection } = useRowSelection(ids);

  const handleEdit = (item: Doctor) => { router.push(`/doctors/${item.id}/edit`); };
  const handleDelete = (id: string) => { setDeleteId(id); };
  const confirmDelete = () => { if (deleteId) { deleteDoctor.mutate(deleteId, { onSuccess: () => { toast.success(tc("deleteSuccess")); setDeleteId(null); } }); } };
  const confirmBulkDelete = () => { bulkDeleteDoctors.mutate(selectedIds, { onSuccess: (res) => { toast.success(tc("bulkDeleteSuccess", { count: res.deleted })); clearSelection(); setBulkDeleteOpen(false); } }); };
  const handleBulkStatus = (status: string) => { setPendingStatus(status); setBulkStatusOpen(true); };
  const confirmBulkStatus = () => { bulkUpdateStatus.mutate({ ids: selectedIds, status: pendingStatus }, { onSuccess: (res) => { toast.success(tc("bulkStatusSuccess", { count: res.updated })); clearSelection(); setBulkStatusOpen(false); } }); };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{doctorsKpiData.map((kpi) => (<KPICard key={kpi.id} data={kpi} />))}</div>
      <div className="grid gap-4 lg:grid-cols-2"><DoctorsSpecialtyChart data={doctorsBySpecialtyData} /><DoctorsConsultationsChart data={doctorsConsultationsTrendData} /></div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">{t("doctorsList")}</h2>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/doctors/new">
                <ExternalLink className="h-4 w-4" />
                {t("openFullForm")}
              </Link>
            </Button>
            <Button onClick={() => setSheetOpen(true)} size="sm">
              <DynamicIcon name="Plus" className="h-4 w-4" />
              {t("newDoctor")}
            </Button>
          </div>
        </div>
        <div className="relative"><Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={tc("searchPlaceholder")} className="ps-9" /></div>
        {filtered.length === 0 ? (<p className="py-8 text-center text-sm text-muted-foreground">{tc("noResults")}</p>) : (
          <><DoctorsTable data={filtered} onEdit={handleEdit} onDelete={handleDelete} selectedIds={selectedIds} onToggle={toggle} onToggleAll={toggleAll} isAllSelected={isAllSelected} isSomeSelected={isSomeSelected} />
          <div className="space-y-3 md:hidden">{filtered.map((doctor) => (<DoctorCard key={doctor.id} data={doctor} onEdit={handleEdit} onDelete={handleDelete} />))}</div></>
        )}
      </div>
      <BulkActionBar selectedCount={selectedCount} onClearSelection={clearSelection} label={tc("selected", { count: selectedCount })} actions={[
        { id: "status-active", label: t("statusActive"), variant: "outline", icon: <UserCheck className="h-3.5 w-3.5" />, onClick: () => handleBulkStatus("active") },
        { id: "status-on-leave", label: t("statusOnLeave"), variant: "outline", icon: <Clock className="h-3.5 w-3.5" />, onClick: () => handleBulkStatus("on-leave") },
        { id: "status-inactive", label: t("statusInactive"), variant: "outline", icon: <UserX className="h-3.5 w-3.5" />, onClick: () => handleBulkStatus("inactive") },
        { id: "bulk-delete", label: tc("bulkDelete"), variant: "destructive", icon: <Trash2 className="h-3.5 w-3.5" />, onClick: () => setBulkDeleteOpen(true) },
      ]} />
      <NewDoctorSheet open={sheetOpen} onOpenChange={setSheetOpen} />
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
