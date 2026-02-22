"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateHealingJourney, useUpdateHealingJourney } from "@/lib/hooks/use-healing-journeys";
import { useServices } from "@/lib/hooks";
import type { HealingJourney, HealingJourneyStatus } from "@/types";

interface NewHealingJourneySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  editItem?: HealingJourney | null;
  defaultServiceId?: string;
  defaultStartDate?: string;
}

const emptyForm = { title: "", description: "", status: "active" as HealingJourneyStatus, startDate: "", endDate: "", primaryServiceId: "" };

export function NewHealingJourneySheet({ open, onOpenChange, clientId, editItem, defaultServiceId, defaultStartDate }: NewHealingJourneySheetProps) {
  const t = useTranslations("clients");
  const tc = useTranslations("common");
  const createJourney = useCreateHealingJourney();
  const updateJourney = useUpdateHealingJourney();
  const { data: servicesData } = useServices();
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (editItem) {
      setForm({
        title: editItem.title,
        description: editItem.description ?? "",
        status: editItem.status,
        startDate: editItem.startDate,
        endDate: editItem.endDate ?? "",
        primaryServiceId: editItem.primaryServiceId ?? "",
      });
    } else {
      setForm({
        ...emptyForm,
        primaryServiceId: defaultServiceId ?? "",
        startDate: defaultStartDate ?? "",
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editItem, open]);

  const handleSubmit = () => {
    if (!form.title || !form.startDate) {
      toast.error(tc("requiredField"));
      return;
    }

    if (editItem) {
      updateJourney.mutate(
        {
          clientId,
          journeyId: editItem.id,
          data: {
            title: form.title,
            description: form.description || undefined,
            status: form.status,
            startDate: form.startDate,
            endDate: form.endDate || undefined,
            primaryServiceId: form.primaryServiceId || undefined,
          },
        },
        {
          onSuccess: () => {
            toast.success(t("journeyUpdated"));
            setForm(emptyForm);
            onOpenChange(false);
          },
        }
      );
    } else {
      createJourney.mutate(
        {
          clientId,
          data: {
            title: form.title,
            description: form.description || undefined,
            status: form.status,
            startDate: form.startDate,
            endDate: form.endDate || undefined,
            primaryServiceId: form.primaryServiceId || undefined,
          },
        },
        {
          onSuccess: () => {
            toast.success(t("journeyCreated"));
            setForm(emptyForm);
            onOpenChange(false);
          },
        }
      );
    }
  };

  const services = Array.isArray(servicesData)
    ? servicesData
    : (servicesData as { data?: { id: string; name: string }[] })?.data ?? [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{editItem ? t("editJourney") : t("newJourney")}</SheetTitle>
          <SheetDescription className="sr-only">{editItem ? t("editJourney") : t("newJourney")}</SheetDescription>
        </SheetHeader>
        <div className="flex-1 space-y-4 px-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("journeyTitle")}</label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("journeyDescription")}</label>
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("journeyStatus")}</label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as HealingJourneyStatus })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">{t("journeyStatusActive")}</SelectItem>
                <SelectItem value="completed">{t("journeyStatusCompleted")}</SelectItem>
                <SelectItem value="paused">{t("journeyStatusPaused")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("primaryService")}</label>
            <Select value={form.primaryServiceId || "_none"} onValueChange={(v) => setForm({ ...form, primaryServiceId: v === "_none" ? "" : v })}>
              <SelectTrigger>
                <SelectValue placeholder={t("selectService")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_none">—</SelectItem>
                {services.map((svc: { id: string; name: string }) => (
                  <SelectItem key={svc.id} value={svc.id}>{svc.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("journeyStartDate")}</label>
            <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="font-english" dir="ltr" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("journeyEndDate")}</label>
            <Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="font-english" dir="ltr" />
          </div>
        </div>
        <SheetFooter>
          <Button onClick={handleSubmit}>{t("save")}</Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t("close")}</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
