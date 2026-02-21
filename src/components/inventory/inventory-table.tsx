"use client";
import { useTranslations, useLocale } from "next-intl";
import { MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { InventoryStatusBadge } from "./inventory-status-badge";
import { InventoryItem } from "@/types";
import { Price } from "@/components/ui/price";

interface InventoryTableProps { data: InventoryItem[]; onEdit?: (item: InventoryItem) => void; onDelete?: (id: string) => void; onActivity?: (item: InventoryItem) => void; selectedIds?: string[]; onToggle?: (id: string) => void; onToggleAll?: () => void; isAllSelected?: boolean; isSomeSelected?: boolean; }

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

export function InventoryTable({ data, onEdit, onDelete, onActivity, selectedIds, onToggle, onToggleAll, isAllSelected, isSomeSelected }: InventoryTableProps) {
  const t = useTranslations("inventory");
  const locale = useLocale();
  return (
    <div className="hidden md:block rounded-lg border border-border bg-card overflow-x-auto"><table className="w-full text-sm">
      <thead><tr className="border-b border-border">
        {onToggleAll && <th className="px-4 py-3 w-10"><Checkbox checked={isAllSelected ? true : isSomeSelected ? "indeterminate" : false} onCheckedChange={onToggleAll} /></th>}
        <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("name")}</th>
        <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("sku")}</th>
        <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("brand")}</th>
        <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("category")}</th>
        <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("productType")}</th>
        <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("quantity")}</th>
        <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("sellPrice")}</th>
        <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("expiryDate")}</th>
        <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("status")}</th>
        <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("actions")}</th>
      </tr></thead>
      <tbody>{data.map((item) => {
        const expiryStatus = getExpiryStatus(item.expiryDate);
        return (
        <tr key={item.id} className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors">
          {onToggle && <td className="px-4 py-3 w-10"><Checkbox checked={selectedIds?.includes(item.id) ?? false} onCheckedChange={() => onToggle(item.id)} /></td>}
          <td className="px-4 py-3"><div className="flex items-center gap-3"><Avatar size="sm"><AvatarFallback>{item.name.charAt(0)}</AvatarFallback></Avatar><p className="font-medium text-foreground">{item.name}</p></div></td>
          <td className="px-4 py-3 font-english text-muted-foreground">{item.sku}</td>
          <td className="px-4 py-3 text-muted-foreground">{item.brand || "—"}</td>
          <td className="px-4 py-3 text-muted-foreground">{item.categoryName || item.category}</td>
          <td className="px-4 py-3">{item.productType ? <span className="inline-flex items-center rounded-full bg-secondary/50 px-2 py-0.5 text-xs font-medium">{t(`productType_${item.productType}`)}</span> : "—"}</td>
          <td className="px-4 py-3 font-english text-muted-foreground">{item.quantity}{item.unitOfMeasure ? <span className="ms-1 text-xs text-muted-foreground/60">{t(`unit_${item.unitOfMeasure}`)}</span> : null}</td>
          <td className="px-4 py-3 font-english text-foreground"><Price value={item.unitPrice} /></td>
          <td className="px-4 py-3 font-english">
            {item.expiryDate ? (
              <span className={
                expiryStatus === "expired" ? "text-destructive font-medium" :
                expiryStatus === "expiring" ? "text-yellow-600 dark:text-yellow-400 font-medium" :
                "text-muted-foreground"
              }>
                {item.expiryDate}
                {expiryStatus === "expired" && <span className="ms-1 text-xs">({t("expired")})</span>}
                {expiryStatus === "expiring" && <span className="ms-1 text-xs">({t("expiringSoon")})</span>}
              </span>
            ) : "—"}
          </td>
          <td className="px-4 py-3"><InventoryStatusBadge status={item.status} /></td>
          <td className="px-4 py-3"><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon-xs"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end"><DropdownMenuItem onClick={() => onEdit?.(item)}>{t("edit")}</DropdownMenuItem><DropdownMenuItem onClick={() => onActivity?.(item)}>{t("activityLog")}</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem variant="destructive" onClick={() => onDelete?.(item.id)}>{t("delete")}</DropdownMenuItem></DropdownMenuContent></DropdownMenu></td>
        </tr>
        );
      })}</tbody>
    </table></div>
  );
}
