"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { EmployeePerformanceTier } from "@/types";

const tierStyles: Record<EmployeePerformanceTier, string> = {
  star: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
  solid: "border-blue-500/30 bg-blue-500/10 text-blue-400",
  growing: "border-green-500/30 bg-green-500/10 text-green-400",
  new: "border-purple-500/30 bg-purple-500/10 text-purple-400",
};

const tierKeys: Record<EmployeePerformanceTier, string> = {
  star: "tierStar",
  solid: "tierSolid",
  growing: "tierGrowing",
  new: "tierNew",
};

interface EmployeePerformanceBadgeProps {
  tier: EmployeePerformanceTier;
}

export function EmployeePerformanceBadge({ tier }: EmployeePerformanceBadgeProps) {
  const t = useTranslations("employees");

  return (
    <Badge variant="outline" className={tierStyles[tier]}>
      {t(tierKeys[tier])}
    </Badge>
  );
}
