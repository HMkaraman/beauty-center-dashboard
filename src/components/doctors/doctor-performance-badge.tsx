"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { DoctorPerformanceTier } from "@/types";

const tierStyles: Record<DoctorPerformanceTier, string> = {
  star: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
  solid: "border-blue-500/30 bg-blue-500/10 text-blue-400",
  growing: "border-green-500/30 bg-green-500/10 text-green-400",
  new: "border-purple-500/30 bg-purple-500/10 text-purple-400",
};

const tierKeys: Record<DoctorPerformanceTier, string> = {
  star: "tierStar",
  solid: "tierSolid",
  growing: "tierGrowing",
  new: "tierNew",
};

interface DoctorPerformanceBadgeProps {
  tier: DoctorPerformanceTier;
}

export function DoctorPerformanceBadge({ tier }: DoctorPerformanceBadgeProps) {
  const t = useTranslations("doctors");

  return (
    <Badge variant="outline" className={tierStyles[tier]}>
      {t(tierKeys[tier])}
    </Badge>
  );
}
