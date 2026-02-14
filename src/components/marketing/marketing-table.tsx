"use client";

import { useTranslations } from "next-intl";
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

interface MarketingTableProps {
  data: Campaign[];
}

export function MarketingTable({ data }: MarketingTableProps) {
  const t = useTranslations("marketing");

  return (
    <div className="hidden md:block rounded-lg border border-border bg-card overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("name")}</th>
            <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("channel")}</th>
            <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("status")}</th>
            <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("startDate")}</th>
            <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("endDate")}</th>
            <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("budget")}</th>
            <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("reach")}</th>
            <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("conversions")}</th>
            <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("actions")}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((campaign) => (
            <tr key={campaign.id} className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors">
              <td className="px-4 py-3 font-medium text-foreground">{campaign.name}</td>
              <td className="px-4 py-3 font-english text-muted-foreground">{campaign.channel}</td>
              <td className="px-4 py-3"><CampaignStatusBadge status={campaign.status} /></td>
              <td className="px-4 py-3 font-english text-muted-foreground">{campaign.startDate}</td>
              <td className="px-4 py-3 font-english text-muted-foreground">{campaign.endDate}</td>
              <td className="px-4 py-3 font-english text-foreground">{formatCurrency(campaign.budget)}</td>
              <td className="px-4 py-3 font-english text-muted-foreground">{formatNumber(campaign.reach)}</td>
              <td className="px-4 py-3 font-english text-muted-foreground">{formatNumber(campaign.conversions)}</td>
              <td className="px-4 py-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon-xs">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>{t("view")}</DropdownMenuItem>
                    <DropdownMenuItem>{t("edit")}</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive">{t("delete")}</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
