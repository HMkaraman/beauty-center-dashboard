"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { DynamicIcon } from "./dynamic-icon";
import { ChangeBadge } from "./change-badge";
import { formatCurrency, formatNumber } from "@/lib/formatters";
import { KPIData } from "@/types";

interface KPICardProps {
  data: KPIData;
}

export function KPICard({ data }: KPICardProps) {
  const t = useTranslations();

  const formattedValue =
    data.format === "currency"
      ? formatCurrency(data.value)
      : formatNumber(data.value);

  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: "0 8px 30px rgba(196, 149, 106, 0.15)" }}
      transition={{ duration: 0.2 }}
      className="rounded-lg border border-border bg-gradient-to-br from-card to-card/80 p-5"
    >
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/15">
          <DynamicIcon name={data.icon} className="h-5 w-5 text-gold" />
        </div>
        <ChangeBadge change={data.change} />
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold font-english text-foreground">
          {formattedValue}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {t(data.label)}
        </p>
      </div>
    </motion.div>
  );
}
