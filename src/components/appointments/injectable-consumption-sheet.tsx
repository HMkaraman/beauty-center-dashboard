"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRecordInjectableConsumption } from "@/lib/hooks/use-consumption-tracking";
import type { Appointment, Service } from "@/types";

interface InjectableConsumptionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment;
  service?: Service | null;
}

export function InjectableConsumptionSheet({ open, onOpenChange, appointment, service }: InjectableConsumptionSheetProps) {
  const t = useTranslations("consumptionTracking");
  const tc = useTranslations("common");
  const recordConsumption = useRecordInjectableConsumption();

  const [productName, setProductName] = useState(service?.name || "");
  const [totalAllocated, setTotalAllocated] = useState("");
  const [amountUsed, setAmountUsed] = useState("");
  const [unit, setUnit] = useState(service?.injectableUnit || "units");
  const [notes, setNotes] = useState("");

  const allocated = Number(totalAllocated) || 0;
  const used = Number(amountUsed) || 0;
  const leftover = Math.max(0, allocated - used);

  const handleSubmit = () => {
    if (!productName || !totalAllocated || !amountUsed) {
      toast.error(tc("requiredField"));
      return;
    }
    if (used > allocated) {
      toast.error(t("amountExceedsAllocated"));
      return;
    }

    recordConsumption.mutate({
      appointmentId: appointment.id,
      serviceId: appointment.serviceId,
      clientId: appointment.clientId,
      productName,
      totalAllocated: allocated,
      amountUsed: used,
      unit,
      notes: notes || undefined,
    }, {
      onSuccess: () => {
        toast.success(t("consumptionRecorded"));
        if (leftover > 0) {
          toast.info(t("leftoverReserved", { amount: String(leftover), unit }));
        }
        setProductName("");
        setTotalAllocated("");
        setAmountUsed("");
        setNotes("");
        onOpenChange(false);
      },
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{t("recordInjectableConsumption")}</SheetTitle>
          <SheetDescription className="sr-only">{t("recordInjectableConsumption")}</SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-4 px-4">
          {/* Product Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("productName")}</label>
            <Input value={productName} onChange={(e) => setProductName(e.target.value)} />
          </div>

          {/* Unit */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("unit")}</label>
            <Select value={unit} onValueChange={setUnit}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="units">{t("unitUnits")}</SelectItem>
                <SelectItem value="cc">{t("unitCc")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Total Allocated */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("totalAllocated")}</label>
            <Input
              type="number"
              step="0.1"
              value={totalAllocated}
              onChange={(e) => setTotalAllocated(e.target.value)}
              className="font-english"
            />
          </div>

          {/* Amount Used */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("amountUsed")}</label>
            <Input
              type="number"
              step="0.1"
              value={amountUsed}
              onChange={(e) => setAmountUsed(e.target.value)}
              className="font-english"
            />
          </div>

          {/* Leftover display */}
          {totalAllocated && amountUsed && (
            <div className={`rounded-md border p-3 ${leftover > 0 ? "border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/50" : "border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-950/50"}`}>
              <p className="text-sm font-medium">
                {t("leftover")}: <span className="font-english">{leftover} {unit}</span>
              </p>
              {leftover > 0 && appointment.clientId && (
                <p className="text-xs text-muted-foreground mt-1">{t("leftoverWillBeReserved")}</p>
              )}
            </div>
          )}

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
