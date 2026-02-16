"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { ClientValueTier } from "@/types";

const tierStyles: Record<ClientValueTier, string> = {
  vip: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
  regular: "border-blue-500/30 bg-blue-500/10 text-blue-400",
  "at-risk": "border-red-500/30 bg-red-500/10 text-red-400",
  new: "border-green-500/30 bg-green-500/10 text-green-400",
};

const tierKeys: Record<ClientValueTier, string> = {
  vip: "tierVip",
  regular: "tierRegular",
  "at-risk": "tierAtRisk",
  new: "tierNew",
};

interface ClientValueTierBadgeProps {
  tier: ClientValueTier;
}

export function ClientValueTierBadge({ tier }: ClientValueTierBadgeProps) {
  const t = useTranslations("clients");

  return (
    <Badge variant="outline" className={tierStyles[tier]}>
      {t(tierKeys[tier])}
    </Badge>
  );
}
