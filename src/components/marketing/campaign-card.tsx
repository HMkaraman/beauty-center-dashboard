"use client";

import { motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CampaignStatusBadge } from "./campaign-status-badge";
import { formatCurrency, formatNumber } from "@/lib/formatters";
import { Campaign } from "@/types";

interface CampaignCardProps {
  data: Campaign;
  onEdit?: (item: Campaign) => void;
  onDelete?: (id: string) => void;
}

export function CampaignCard({ data, onEdit, onDelete }: CampaignCardProps) {
  const t = useTranslations("marketing");
  const locale = useLocale();

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
        <div className="flex items-center gap-2">
          <CampaignStatusBadge status={data.status} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-xs">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit?.(data)}>{t("edit")}</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => onDelete?.(data.id)}>{t("delete")}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
        <div className="flex justify-between">
          <span>{t("budget")}: <span className="font-english">{formatCurrency(data.budget, locale)}</span></span>
        </div>
        <div className="flex justify-between">
          <span>{t("reach")}: <span className="font-english">{formatNumber(data.reach, locale)}</span></span>
          <span>{t("conversions")}: <span className="font-english">{formatNumber(data.conversions, locale)}</span></span>
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
