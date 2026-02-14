"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Search } from "lucide-react";
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
import { useDoctorsStore } from "@/store/useDoctorsStore";
import { Doctor } from "@/types";

export function DoctorsPageContent() {
  const t = useTranslations("doctors");
  const tc = useTranslations("common");
  const { items, searchQuery, setSearchQuery, deleteItem } = useDoctorsStore();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editItem, setEditItem] = useState<Doctor | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = items.filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return item.name.toLowerCase().includes(q) || item.specialty.toLowerCase().includes(q) || item.phone.includes(q) || item.email.toLowerCase().includes(q);
  });

  const handleEdit = (item: Doctor) => { setEditItem(item); setSheetOpen(true); };
  const handleDelete = (id: string) => { setDeleteId(id); };
  const confirmDelete = () => { if (deleteId) { deleteItem(deleteId); toast.success(tc("deleteSuccess")); setDeleteId(null); } };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{doctorsKpiData.map((kpi) => (<KPICard key={kpi.id} data={kpi} />))}</div>
      <div className="grid gap-4 lg:grid-cols-2"><DoctorsSpecialtyChart data={doctorsBySpecialtyData} /><DoctorsConsultationsChart data={doctorsConsultationsTrendData} /></div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">{t("doctorsList")}</h2>
          <Button onClick={() => { setEditItem(null); setSheetOpen(true); }} size="sm"><DynamicIcon name="Plus" className="h-4 w-4" />{t("newDoctor")}</Button>
        </div>
        <div className="relative"><Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={tc("searchPlaceholder")} className="ps-9" /></div>
        {filtered.length === 0 ? (<p className="py-8 text-center text-sm text-muted-foreground">{tc("noResults")}</p>) : (
          <><DoctorsTable data={filtered} onEdit={handleEdit} onDelete={handleDelete} />
          <div className="space-y-3 md:hidden">{filtered.map((doctor) => (<DoctorCard key={doctor.id} data={doctor} onEdit={handleEdit} onDelete={handleDelete} />))}</div></>
        )}
      </div>
      <NewDoctorSheet open={sheetOpen} onOpenChange={setSheetOpen} editItem={editItem} />
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>{tc("deleteConfirmTitle")}</AlertDialogTitle><AlertDialogDescription>{tc("deleteConfirmMessage")}</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>{tc("cancelAction")}</AlertDialogCancel><AlertDialogAction onClick={confirmDelete}>{tc("confirmDelete")}</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
