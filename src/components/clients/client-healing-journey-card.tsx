"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { HealingJourneyStatusBadge } from "./client-healing-journeys-table";
import type { HealingJourney } from "@/types";

interface ClientHealingJourneyCardProps {
  data: HealingJourney;
  onView: (journey: HealingJourney) => void;
  onEdit: (journey: HealingJourney) => void;
  onDelete: (journey: HealingJourney) => void;
}

export function ClientHealingJourneyCard({ data, onView, onEdit, onDelete }: ClientHealingJourneyCardProps) {
  const t = useTranslations("clients");

  return (
    <div className="rounded-lg border border-border bg-card p-4 md:hidden">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-medium text-foreground">{data.title}</p>
          {data.description && (
            <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{data.description}</p>
          )}
        </div>
        <HealingJourneyStatusBadge status={data.status} />
      </div>
      <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
        <div className="flex justify-between">
          <span>{t("journeyStartDate")}: <span className="font-english">{data.startDate}</span></span>
          <span>{t("entries")}: <span className="font-english">{data.entriesCount}</span></span>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-end gap-1 border-t border-border pt-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onView(data)}>
          <Eye className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(data)}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => onDelete(data)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
