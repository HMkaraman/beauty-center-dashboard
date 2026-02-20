"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRecordLaserConsumption } from "@/lib/hooks/use-consumption-tracking";
import type { Appointment, Service } from "@/types";

interface LaserConsumptionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment;
  service?: Service | null;
}

export function LaserConsumptionSheet({ open, onOpenChange, appointment, service }: LaserConsumptionSheetProps) {
  const t = useTranslations("consumptionTracking");
  const tc = useTranslations("common");
  const recordConsumption = useRecordLaserConsumption();

  const [actualShots, setActualShots] = useState("");
  const [deviceId, setDeviceId] = useState("");
  const [deviceModel, setDeviceModel] = useState("");
  const [notes, setNotes] = useState("");

  const minShots = service?.laserMinShots;
  const maxShots = service?.laserMaxShots;
  const shotsNum = Number(actualShots) || 0;

  const getDeviationColor = () => {
    if (!actualShots || !minShots || !maxShots) return "";
    if (shotsNum < minShots) return "text-amber-600";
    if (shotsNum > maxShots) return "text-red-600";
    return "text-green-600";
  };

  const getDeviationLabel = () => {
    if (!actualShots || !minShots || !maxShots) return "";
    if (shotsNum < minShots) return t("deviationBelow");
    if (shotsNum > maxShots) return t("deviationAbove");
    return t("deviationWithinRange");
  };

  const handleSubmit = () => {
    if (!actualShots || shotsNum <= 0) {
      toast.error(tc("requiredField"));
      return;
    }

    recordConsumption.mutate({
      appointmentId: appointment.id,
      serviceId: appointment.serviceId,
      clientId: appointment.clientId,
      actualShots: shotsNum,
      expectedMinShots: minShots,
      expectedMaxShots: maxShots,
      deviceId: deviceId || undefined,
      deviceModel: deviceModel || undefined,
      notes: notes || undefined,
    }, {
      onSuccess: () => {
        toast.success(t("consumptionRecorded"));
        setActualShots("");
        setDeviceId("");
        setDeviceModel("");
        setNotes("");
        onOpenChange(false);
      },
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{t("recordLaserShots")}</SheetTitle>
          <SheetDescription className="sr-only">{t("recordLaserShots")}</SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-4 px-4">
          {/* Expected Range */}
          {minShots != null && maxShots != null && (
            <div className="rounded-md border border-border bg-muted/50 p-3">
              <p className="text-sm text-muted-foreground">{t("expectedRange")}</p>
              <p className="text-lg font-semibold font-english">{minShots} - {maxShots} {t("shots")}</p>
            </div>
          )}

          {/* Actual Shots */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("actualShots")}</label>
            <Input
              type="number"
              value={actualShots}
              onChange={(e) => setActualShots(e.target.value)}
              className="font-english"
              placeholder="0"
            />
            {actualShots && minShots != null && maxShots != null && (
              <p className={`text-sm font-medium ${getDeviationColor()}`}>
                {getDeviationLabel()}
              </p>
            )}
          </div>

          {/* Device Info */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("deviceId")}</label>
            <Input value={deviceId} onChange={(e) => setDeviceId(e.target.value)} className="font-english" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("deviceModel")}</label>
            <Input value={deviceModel} onChange={(e) => setDeviceModel(e.target.value)} className="font-english" />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("notes")}</label>
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>

        <SheetFooter>
          <Button onClick={handleSubmit} disabled={recordConsumption.isPending}>
            {t("recordConsumption")}
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {tc("cancel")}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
