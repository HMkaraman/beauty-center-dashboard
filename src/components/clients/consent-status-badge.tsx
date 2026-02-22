"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import type { ConsentStatus } from "@/types";

const config: Record<ConsentStatus, { labelKey: string; className: string }> = {
  pending: {
    labelKey: "consentStatus_pending",
    className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  },
  approved: {
    labelKey: "consentStatus_approved",
    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  rejected: {
    labelKey: "consentStatus_rejected",
    className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
};

export function ConsentStatusBadge({ status }: { status?: ConsentStatus | null }) {
  const t = useTranslations("clients");
  if (!status) return null;
  const { labelKey, className } = config[status];
  return <Badge className={className}>{t(labelKey)}</Badge>;
}
