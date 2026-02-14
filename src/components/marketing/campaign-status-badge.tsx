"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { CampaignStatus } from "@/types";

const statusStyles: Record<CampaignStatus, string> = {
  active: "border-green-500/30 bg-green-500/10 text-green-400",
  paused: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
  completed: "border-purple-500/30 bg-purple-500/10 text-purple-400",
  draft: "border-muted-foreground/30 bg-muted/50 text-muted-foreground",
};

const statusKeys: Record<CampaignStatus, string> = {
  active: "statusActive",
  paused: "statusPaused",
  completed: "statusCompleted",
  draft: "statusDraft",
};

interface CampaignStatusBadgeProps {
  status: CampaignStatus;
}

export function CampaignStatusBadge({ status }: CampaignStatusBadgeProps) {
  const t = useTranslations("marketing");

  return (
    <Badge variant="outline" className={statusStyles[status]}>
      {t(statusKeys[status])}
    </Badge>
  );
}
