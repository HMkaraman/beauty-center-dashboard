"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { ConsentStatusBadge } from "./consent-status-badge";
import type { HealingJourney, HealingJourneyStatus } from "@/types";

interface ClientHealingJourneysTableProps {
  data: HealingJourney[];
  onView: (journey: HealingJourney) => void;
  onEdit: (journey: HealingJourney) => void;
  onDelete: (journey: HealingJourney) => void;
  canEdit?: (journey: HealingJourney) => boolean;
}

function StatusBadge({ status }: { status: HealingJourneyStatus }) {
  const t = useTranslations("clients");
  const config: Record<HealingJourneyStatus, { label: string; className: string }> = {
    active: { label: t("journeyStatusActive"), className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
    completed: { label: t("journeyStatusCompleted"), className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
    paused: { label: t("journeyStatusPaused"), className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  };
  const { label, className } = config[status];
  return <Badge className={className}>{label}</Badge>;
}

export function ClientHealingJourneysTable({ data, onView, onEdit, onDelete, canEdit = () => true }: ClientHealingJourneysTableProps) {
  const t = useTranslations("clients");

  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
        {t("noJourneys")}
      </div>
    );
  }

  return (
    <div className="hidden md:block rounded-lg border border-border bg-card overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("journeyTitle")}</th>
            <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("journeyStatus")}</th>
            <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("journeyStartDate")}</th>
            <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("entries")}</th>
            <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("actions")}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((journey) => (
            <tr key={journey.id} className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors">
              <td className="px-4 py-3 text-foreground font-medium">{journey.title}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <StatusBadge status={journey.status} />
                  <ConsentStatusBadge status={journey.consentStatus} />
                </div>
              </td>
              <td className="px-4 py-3 font-english text-muted-foreground">{journey.startDate}</td>
              <td className="px-4 py-3 font-english text-muted-foreground">{journey.entriesCount}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onView(journey)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  {canEdit(journey) && (
                    <>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(journey)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => onDelete(journey)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export { StatusBadge as HealingJourneyStatusBadge };
