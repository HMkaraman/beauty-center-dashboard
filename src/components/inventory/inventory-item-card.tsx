"use client";
import { motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { InventoryStatusBadge } from "./inventory-status-badge";
import { InventoryItem } from "@/types";
import { Price } from "@/components/ui/price";

interface InventoryItemCardProps { data: InventoryItem; onEdit?: (item: InventoryItem) => void; onDelete?: (id: string) => void; }

function getExpiryStatus(expiryDate?: string): "expired" | "expiring" | null {
  if (!expiryDate) return null;
  const now = new Date();
  const expiry = new Date(expiryDate);
  if (expiry < now) return "expired";
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  if (expiry <= thirtyDaysFromNow) return "expiring";
  return null;
}

export function InventoryItemCard({ data, onEdit, onDelete }: InventoryItemCardProps) {
  const t = useTranslations("inventory");
  const locale = useLocale();
  const expiryStatus = getExpiryStatus(data.expiryDate);
  return (
    <motion.div whileHover={{ y: -2, boxShadow: "0 8px 30px rgba(196, 149, 106, 0.15)" }} transition={{ duration: 0.2 }} className="rounded-lg border border-border bg-card p-4 md:hidden">
      <div className="flex items-start justify-between">
        <div><p className="font-medium text-foreground">{data.name}</p><p className="text-xs font-english text-muted-foreground">{data.sku}</p></div>
        <div className="flex items-center gap-2"><InventoryStatusBadge status={data.status} />
          <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon-xs"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end"><DropdownMenuItem onClick={() => onEdit?.(data)}>{t("edit")}</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem variant="destructive" onClick={() => onDelete?.(data.id)}>{t("delete")}</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
        </div>
      </div>
      <div className="mt-1 flex items-center gap-2 flex-wrap">
        <span className="text-xs text-muted-foreground">{data.categoryName || data.category}</span>
        {data.brand && <span className="text-xs text-muted-foreground/60">• {data.brand}</span>}
        {data.unitOfMeasure && <span className="text-xs text-muted-foreground/60">• {t(`unit_${data.unitOfMeasure}`)}</span>}
      </div>
      <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
        <div className="flex justify-between"><span>{t("quantity")}: <span className="font-english">{data.quantity}</span></span></div>
        <div className="flex justify-between"><span>{t("sellPrice")}: <span className="font-english"><Price value={data.unitPrice} /></span></span></div>
        {data.expiryDate && (
          <div className="flex justify-between">
            <span>{t("expiryDate")}: <span className={
              expiryStatus === "expired" ? "font-english text-destructive font-medium" :
              expiryStatus === "expiring" ? "font-english text-yellow-600 dark:text-yellow-400 font-medium" :
              "font-english"
            }>{data.expiryDate}{expiryStatus === "expired" ? ` (${t("expired")})` : expiryStatus === "expiring" ? ` (${t("expiringSoon")})` : ""}</span></span>
          </div>
        )}
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
        <span className="text-xs text-muted-foreground">{t("totalValue")}</span>
        <p className="text-sm font-bold font-english text-foreground"><Price value={data.totalValue} /></p>
      </div>
    </motion.div>
  );
}
