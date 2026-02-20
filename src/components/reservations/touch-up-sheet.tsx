"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRecordTouchUp } from "@/lib/hooks/use-reservations";
import type { ClientProductReservation } from "@/types";

interface TouchUpSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reservation: ClientProductReservation | null;
}

export function TouchUpSheet({ open, onOpenChange, reservation }: TouchUpSheetProps) {
  const t = useTranslations("reservations");
  const tc = useTranslations("common");
  const recordTouchUp = useRecordTouchUp();

  const [amountUsed, setAmountUsed] = useState("");
  const [isFree, setIsFree] = useState(false);
  const [notes, setNotes] = useState("");

  if (!reservation) return null;

  const remaining = reservation.remainingAmount;

  const handleSubmit = () => {
    const amount = Number(amountUsed);
    if (!amountUsed || amount <= 0) {
      toast.error(tc("requiredField"));
      return;
    }
    if (amount > remaining) {
      toast.error(t("touchUpExceedsRemaining"));
      return;
    }

    recordTouchUp.mutate({
      id: reservation.id,
      data: {
        touchUpAmountUsed: amount,
        touchUpIsFree: isFree,
        notes: notes || undefined,
      },
    }, {
      onSuccess: () => {
        toast.success(t("touchUpRecorded"));
        setAmountUsed("");
        setIsFree(false);
        setNotes("");
        onOpenChange(false);
      },
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{t("recordTouchUp")}</SheetTitle>
          <SheetDescription className="sr-only">{t("recordTouchUp")}</SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-4 px-4">
          {/* Product Info */}
          <div className="rounded-md border border-border bg-muted/50 p-3">
            <p className="text-sm font-medium">{reservation.productName}</p>
            <p className="text-sm text-muted-foreground">
              {t("remaining")}: <span className="font-english">{remaining} {reservation.unit}</span>
            </p>
            {reservation.expiryDate && (
              <p className="text-xs text-muted-foreground mt-1">
                {t("expires")}: <span className="font-english">{reservation.expiryDate}</span>
              </p>
            )}
          </div>

          {/* Amount Used */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("touchUpAmount")}</label>
            <Input
              type="number"
              step="0.1"
              value={amountUsed}
              onChange={(e) => setAmountUsed(e.target.value)}
              className="font-english"
              placeholder={`max ${remaining}`}
            />
          </div>

          {/* Free Touch-Up Toggle */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isFree}
              onChange={(e) => setIsFree(e.target.checked)}
              className="rounded border-border"
            />
            <span className="text-sm">{t("touchUpIsFree")}</span>
          </label>

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("notes")}</label>
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>

        <SheetFooter>
          <Button onClick={handleSubmit} disabled={recordTouchUp.isPending}>
            {t("recordTouchUp")}
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {tc("cancel")}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
