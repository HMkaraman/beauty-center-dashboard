"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Heart, Plus, Eye, Pencil, Trash2, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HealingJourneyStatusBadge } from "@/components/clients/client-healing-journeys-table";
import { ConsentStatusBadge } from "@/components/clients/consent-status-badge";
import { HealingJourneyUpdatesSheet } from "@/components/clients/healing-journey-updates-sheet";
import { NewHealingJourneySheet } from "@/components/clients/new-healing-journey-sheet";
import { useHealingJourneys, useDeleteHealingJourney } from "@/lib/hooks/use-healing-journeys";
import type { Appointment, HealingJourney } from "@/types";

interface AppointmentHealingJourneysProps {
  appointment: Appointment;
}

export function AppointmentHealingJourneys({ appointment }: AppointmentHealingJourneysProps) {
  const t = useTranslations("appointments");
  const tc = useTranslations("clients");
  const tcom = useTranslations("common");
  const { data: journeys, isLoading } = useHealingJourneys(appointment.clientId!);
  const deleteJourney = useDeleteHealingJourney();

  const [updatesSheetOpen, setUpdatesSheetOpen] = useState(false);
  const [viewingJourney, setViewingJourney] = useState<HealingJourney | null>(null);
  const [shouldPrefill, setShouldPrefill] = useState(false);
  const [journeySheetOpen, setJourneySheetOpen] = useState(false);
  const [editingJourney, setEditingJourney] = useState<HealingJourney | null>(null);

  const handleView = (journey: HealingJourney) => {
    setViewingJourney(journey);
    setShouldPrefill(false);
    setUpdatesSheetOpen(true);
  };

  const handleAddSession = (journey: HealingJourney) => {
    setViewingJourney(journey);
    setShouldPrefill(true);
    setUpdatesSheetOpen(true);
  };

  const handleEdit = (journey: HealingJourney) => {
    setEditingJourney(journey);
    setJourneySheetOpen(true);
  };

  const handleDelete = (journey: HealingJourney) => {
    if (!confirm(tcom("confirmDelete"))) return;
    deleteJourney.mutate(
      { clientId: appointment.clientId!, journeyId: journey.id },
      { onSuccess: () => toast.success(tc("journeyDeleted")) }
    );
  };

  const handleNewJourney = () => {
    setEditingJourney(null);
    setJourneySheetOpen(true);
  };

  const journeyList = journeys ?? [];

  const prefillData = shouldPrefill
    ? {
        appointmentId: appointment.id,
        serviceName: appointment.service,
        serviceId: appointment.serviceId,
        doctorName: appointment.doctor,
        doctorId: appointment.doctorId,
        employeeName: appointment.employee,
        employeeId: appointment.employeeId,
        price: appointment.price,
        duration: appointment.duration,
        date: appointment.date,
      }
    : undefined;

  return (
    <>
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Heart className="h-4 w-4 text-rose-500" />
            {t("healingJourneys")} {!isLoading && `(${journeyList.length})`}
          </h2>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={handleNewJourney}>
            <Plus className="h-3.5 w-3.5" />
            {tc("newJourney")}
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2].map((i) => (
              <div key={i} className="h-14 rounded-md bg-muted" />
            ))}
          </div>
        ) : journeyList.length === 0 ? (
          <div className="rounded-md border border-dashed border-border p-6 text-center">
            <p className="text-sm text-muted-foreground mb-3">{t("noHealingJourneys")}</p>
            <Button variant="outline" size="sm" onClick={handleNewJourney}>
              {t("createFirstJourney")}
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {journeyList.map((journey) => (
              <div
                key={journey.id}
                className="flex items-center justify-between rounded-md border border-border p-3"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{journey.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {journey.entriesCount} {tc("entries")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <HealingJourneyStatusBadge status={journey.status} />
                  <ConsentStatusBadge status={journey.consentStatus} />
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleView(journey)} title={tc("view")}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleAddSession(journey)} title={t("addSessionEntry")}>
                    <Stethoscope className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(journey)} title={tc("edit")}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(journey)} title={tc("delete")}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <HealingJourneyUpdatesSheet
        open={updatesSheetOpen}
        onOpenChange={setUpdatesSheetOpen}
        clientId={appointment.clientId!}
        journey={viewingJourney}
        clientName={appointment.clientName}
        prefillSessionEntry={prefillData}
      />

      <NewHealingJourneySheet
        open={journeySheetOpen}
        onOpenChange={setJourneySheetOpen}
        clientId={appointment.clientId!}
        editItem={editingJourney}
        defaultServiceId={appointment.serviceId}
        defaultStartDate={appointment.date}
      />
    </>
  );
}
