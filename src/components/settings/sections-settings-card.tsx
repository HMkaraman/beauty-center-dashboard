"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Users, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  useSections,
  useDeleteSection,
  useSetSectionEmployees,
  useSetSectionDoctors,
} from "@/lib/hooks/use-sections";
import { useEmployees } from "@/lib/hooks/use-employees";
import { useDoctors } from "@/lib/hooks/use-doctors";
import { NewSectionSheet } from "./new-section-sheet";
import { Section } from "@/types";

export function SectionsSettingsCard() {
  const t = useTranslations("sections");
  const tc = useTranslations("common");
  const { data } = useSections({ limit: 100 });
  const sections = data?.data ?? [];
  const deleteSection = useDeleteSection();
  const setSectionEmployees = useSetSectionEmployees();
  const setSectionDoctors = useSetSectionDoctors();
  const { data: employeesData } = useEmployees({ limit: 200 });
  const { data: doctorsData } = useDoctors({ limit: 200 });
  const allEmployees = employeesData?.data ?? [];
  const allDoctors = doctorsData?.data ?? [];

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editItem, setEditItem] = useState<Section | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [assignSection, setAssignSection] = useState<Section | null>(null);

  const handleEdit = (section: Section) => {
    setEditItem(section);
    setSheetOpen(true);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteSection.mutate(deleteId, {
        onSuccess: () => {
          toast.success(tc("deleteSuccess"));
          setDeleteId(null);
        },
      });
    }
  };

  const toggleEmployee = (sectionId: string, employeeId: string, currentIds: string[]) => {
    const newIds = currentIds.includes(employeeId)
      ? currentIds.filter((id) => id !== employeeId)
      : [...currentIds, employeeId];
    setSectionEmployees.mutate({ id: sectionId, employeeIds: newIds });
  };

  const toggleDoctor = (sectionId: string, doctorId: string, currentIds: string[]) => {
    const newIds = currentIds.includes(doctorId)
      ? currentIds.filter((id) => id !== doctorId)
      : [...currentIds, doctorId];
    setSectionDoctors.mutate({ id: sectionId, doctorIds: newIds });
  };

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">{t("title")}</h2>
        <Button
          size="sm"
          onClick={() => {
            setEditItem(null);
            setSheetOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          {t("newSection")}
        </Button>
      </div>

      {sections.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">
          {t("noSections")}
        </p>
      ) : (
        <div className="space-y-3">
          {sections.map((section) => (
            <div
              key={section.id}
              className="rounded-lg border border-border p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="h-4 w-4 rounded-full shrink-0"
                    style={{ backgroundColor: section.color || "#6B7280" }}
                  />
                  <div>
                    <p className="font-medium text-foreground">
                      {section.name}
                    </p>
                    {section.nameEn && (
                      <p className="text-sm text-muted-foreground font-english">
                        {section.nameEn}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {section.employeeCount ?? 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Stethoscope className="h-3.5 w-3.5" />
                      {section.doctorCount ?? 0}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setAssignSection(
                          assignSection?.id === section.id ? null : section
                        )
                      }
                    >
                      <Users className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(section)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteId(section.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Assignment panel */}
              {assignSection?.id === section.id && (
                <div className="mt-4 space-y-4 border-t border-border pt-4">
                  {/* Employees */}
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2">
                      {t("assignEmployees")}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {allEmployees.map((emp) => {
                        const isAssigned = (section.employeeIds ?? []).includes(emp.id);
                        return (
                          <button
                            key={emp.id}
                            type="button"
                            onClick={() =>
                              toggleEmployee(
                                section.id,
                                emp.id,
                                section.employeeIds ?? []
                              )
                            }
                            className={`rounded-full px-3 py-1 text-xs border transition-colors ${
                              isAssigned
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-muted text-muted-foreground border-border hover:border-primary"
                            }`}
                          >
                            {emp.name}
                          </button>
                        );
                      })}
                      {allEmployees.length === 0 && (
                        <p className="text-xs text-muted-foreground">
                          {t("noEmployeesAvailable")}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Doctors */}
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2">
                      {t("assignDoctors")}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {allDoctors.map((doc) => {
                        const isAssigned = (section.doctorIds ?? []).includes(doc.id);
                        return (
                          <button
                            key={doc.id}
                            type="button"
                            onClick={() =>
                              toggleDoctor(
                                section.id,
                                doc.id,
                                section.doctorIds ?? []
                              )
                            }
                            className={`rounded-full px-3 py-1 text-xs border transition-colors ${
                              isAssigned
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-muted text-muted-foreground border-border hover:border-primary"
                            }`}
                          >
                            {doc.name}
                          </button>
                        );
                      })}
                      {allDoctors.length === 0 && (
                        <p className="text-xs text-muted-foreground">
                          {t("noDoctorsAvailable")}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <NewSectionSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        editItem={editItem}
      />

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tc("deleteConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {tc("deleteConfirmMessage")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tc("cancelAction")}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              {tc("confirmDelete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
