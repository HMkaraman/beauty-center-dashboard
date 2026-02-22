"use client";

import { useRef, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import SignaturePad from "signature_pad";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eraser } from "lucide-react";
import { uploadFileApi } from "@/lib/api/upload";
import type { HealingJourney, JourneyEntry } from "@/types";

interface ConsentSignatureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  journey: HealingJourney;
  entries: JourneyEntry[];
  clientName: string;
  onApprove: (signatureUrl: string) => void;
  onReject: () => void;
}

const entryTypeIcons: Record<string, string> = {
  session: "💉",
  prescription: "📋",
  note: "📝",
  photo: "📷",
  milestone: "🏆",
};

export function ConsentSignatureDialog({
  open,
  onOpenChange,
  journey,
  entries,
  clientName,
  onApprove,
  onReject,
}: ConsentSignatureDialogProps) {
  const t = useTranslations("clients");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const padRef = useRef<SignaturePad | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signatureError, setSignatureError] = useState(false);

  useEffect(() => {
    if (!open || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.scale(ratio, ratio);

    const pad = new SignaturePad(canvas, {
      backgroundColor: "rgb(255, 255, 255)",
    });
    padRef.current = pad;

    return () => {
      pad.off();
      padRef.current = null;
    };
  }, [open]);

  const handleClear = () => {
    padRef.current?.clear();
    setSignatureError(false);
  };

  const handleApprove = async () => {
    if (!padRef.current || padRef.current.isEmpty()) {
      setSignatureError(true);
      return;
    }

    setIsSubmitting(true);
    setSignatureError(false);
    try {
      const dataUrl = padRef.current.toDataURL("image/png");
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], "consent-signature.png", { type: "image/png" });
      const result = await uploadFileApi(file, "consent-signatures");
      onApprove(result.url);
    } catch {
      // upload error handled by parent
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("consentTitle")}</DialogTitle>
          <DialogDescription className="sr-only">{t("consentTitle")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Journey Summary */}
          <div className="rounded-lg border border-border bg-secondary/10 p-4 space-y-2">
            <h3 className="font-medium text-foreground">{journey.title}</h3>
            {journey.description && (
              <p className="text-sm text-muted-foreground">{journey.description}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {t("journeyStartDate")}: <span className="font-english">{journey.startDate}</span>
            </p>
            <p className="text-xs text-muted-foreground">
              {t("clientName")}: {clientName}
            </p>
          </div>

          {/* Entries Summary */}
          {entries.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-foreground">{t("entries")} ({entries.length})</h4>
              <div className="space-y-1.5 max-h-48 overflow-y-auto rounded-lg border border-border p-3">
                {entries.map((entry) => (
                  <div key={entry.id} className="flex items-center gap-2 text-sm">
                    <span>{entryTypeIcons[entry.type] || "📄"}</span>
                    <Badge variant="outline" className="text-xs">{t(`entryType_${entry.type}`)}</Badge>
                    <span className="font-english text-xs text-muted-foreground">{entry.date}</span>
                    {entry.type === "session" && entry.serviceName && (
                      <span className="text-foreground truncate">{entry.serviceName}</span>
                    )}
                    {entry.type === "prescription" && entry.prescriptionText && (
                      <span className="text-foreground truncate">{entry.prescriptionText.slice(0, 60)}</span>
                    )}
                    {entry.type === "milestone" && entry.milestoneLabel && (
                      <span className="text-foreground truncate">{entry.milestoneLabel}</span>
                    )}
                    {entry.type === "note" && entry.notes && (
                      <span className="text-foreground truncate">{entry.notes.slice(0, 60)}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Consent Declaration */}
          <div className="rounded-lg border border-border bg-amber-50 dark:bg-amber-950/20 p-4 space-y-2">
            <p className="text-sm text-foreground leading-relaxed" dir="rtl">
              {t("consentDeclarationAr")}
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed" dir="ltr">
              {t("consentDeclarationEn")}
            </p>
          </div>

          {/* Signature Canvas */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">{t("signatureLabel")}</label>
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs" onClick={handleClear}>
                <Eraser className="h-3.5 w-3.5" />
                {t("clearSignature")}
              </Button>
            </div>
            <div className="rounded-lg border-2 border-dashed border-border bg-white">
              <canvas
                ref={canvasRef}
                dir="ltr"
                className="w-full h-40 touch-none cursor-crosshair"
              />
            </div>
            <p className="text-xs text-muted-foreground">{t("signatureHint")}</p>
            {signatureError && (
              <p className="text-xs text-destructive">{t("signatureRequired")}</p>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="destructive"
            onClick={onReject}
            disabled={isSubmitting}
          >
            {t("consentReject")}
          </Button>
          <Button
            onClick={handleApprove}
            disabled={isSubmitting}
          >
            {isSubmitting ? "..." : t("consentApprove")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
