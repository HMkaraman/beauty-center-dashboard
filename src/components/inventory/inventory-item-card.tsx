"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { InventoryStatusBadge } from "./inventory-status-badge";
import { formatCurrency } from "@/lib/formatters";
import { InventoryItem } from "@/types";

interface InventoryItemCardProps {
  data: InventoryItem;
}

export function InventoryItemCard({ data }: InventoryItemCardProps) {
  const t = useTranslations("inventory");

  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: "0 8px 30px rgba(196, 149, 106, 0.15)" }}
      transition={{ duration: 0.2 }}
      className="rounded-lg border border-border bg-card p-4 md:hidden"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="font-medium text-foreground">{data.name}</p>
          <p className="text-xs font-english text-muted-foreground">{data.sku}</p>
        </div>
        <InventoryStatusBadge status={data.status} />
      </div>

      <p className="mt-1 text-xs text-muted-foreground">{data.category}</p>

      <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
        <div className="flex justify-between">
          <span>{t("quantity")}: <span className="font-english">{data.quantity}</span></span>
        </div>
        <div className="flex justify-between">
          <span>{t("unitPrice")}: <span className="font-english">{formatCurrency(data.unitPrice)}</span></span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
        <span className="text-xs text-muted-foreground">{t("totalValue")}</span>
        <p className="text-sm font-bold font-english text-foreground">
          {formatCurrency(data.totalValue)}
        </p>
      </div>
    </motion.div>
  );
}
