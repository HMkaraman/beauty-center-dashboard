"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { CampaignStatusBadge } from "./campaign-status-badge";
import { formatCurrency, formatNumber } from "@/lib/formatters";
import { Campaign } from "@/types";

interface CampaignCardProps {
  data: Campaign;
}

export function CampaignCard({ data }: CampaignCardProps) {
  const t = useTranslations("marketing");

  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: "0 8px 30px rgba(196, 149, 106, 0.15)" }}
      transition={{ duration: 0.2 }}
      className="rounded-lg border border-border bg-card p-4 md:hidden"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="font-medium text-foreground">{data.name}</p>
          <p className="text-xs font-english text-muted-foreground">{data.channel}</p>
        </div>
        <CampaignStatusBadge status={data.status} />
      </div>

      <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
        <div className="flex justify-between">
          <span>{t("budget")}: <span className="font-english">{formatCurrency(data.budget)}</span></span>
        </div>
        <div className="flex justify-between">
          <span>{t("reach")}: <span className="font-english">{formatNumber(data.reach)}</span></span>
          <span>{t("conversions")}: <span className="font-english">{formatNumber(data.conversions)}</span></span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
        <div className="flex items-center gap-3 text-xs font-english text-muted-foreground">
          <span>{data.startDate}</span>
          <span>→</span>
          <span>{data.endDate}</span>
        </div>
      </div>
    </motion.div>
  );
}
