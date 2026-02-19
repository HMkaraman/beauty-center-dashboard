"use client";
import { useTranslations, useLocale } from "next-intl";
import { MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { InventoryStatusBadge } from "./inventory-status-badge";
import { formatCurrency } from "@/lib/formatters";
import { InventoryItem } from "@/types";

interface InventoryTableProps { data: InventoryItem[]; onEdit?: (item: InventoryItem) => void; onDelete?: (id: string) => void; selectedIds?: string[]; onToggle?: (id: string) => void; onToggleAll?: () => void; isAllSelected?: boolean; isSomeSelected?: boolean; }

export function InventoryTable({ data, onEdit, onDelete, selectedIds, onToggle, onToggleAll, isAllSelected, isSomeSelected }: InventoryTableProps) {
  const t = useTranslations("inventory");
  const locale = useLocale();
  return (
    <div className="hidden md:block rounded-lg border border-border bg-card overflow-x-auto"><table className="w-full text-sm">
      <thead><tr className="border-b border-border">
        {onToggleAll && <th className="px-4 py-3 w-10"><Checkbox checked={isAllSelected ? true : isSomeSelected ? "indeterminate" : false} onCheckedChange={onToggleAll} /></th>}
        <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("name")}</th>
        <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("sku")}</th>
        <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("category")}</th>
        <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("quantity")}</th>
        <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("unitPrice")}</th>
        <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("totalValue")}</th>
        <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("status")}</th>
        <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("actions")}</th>
      </tr></thead>
      <tbody>{data.map((item) => (
        <tr key={item.id} className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors">
          {onToggle && <td className="px-4 py-3 w-10"><Checkbox checked={selectedIds?.includes(item.id) ?? false} onCheckedChange={() => onToggle(item.id)} /></td>}
          <td className="px-4 py-3"><div className="flex items-center gap-3"><Avatar size="sm"><AvatarFallback>{item.name.charAt(0)}</AvatarFallback></Avatar><p className="font-medium text-foreground">{item.name}</p></div></td>
          <td className="px-4 py-3 font-english text-muted-foreground">{item.sku}</td>
          <td className="px-4 py-3 text-muted-foreground">{item.category}</td>
          <td className="px-4 py-3 font-english text-muted-foreground">{item.quantity}</td>
          <td className="px-4 py-3 font-english text-foreground">{formatCurrency(item.unitPrice, locale)}</td>
          <td className="px-4 py-3 font-english text-foreground">{formatCurrency(item.totalValue, locale)}</td>
          <td className="px-4 py-3"><InventoryStatusBadge status={item.status} /></td>
          <td className="px-4 py-3"><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon-xs"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end"><DropdownMenuItem onClick={() => onEdit?.(item)}>{t("edit")}</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem variant="destructive" onClick={() => onDelete?.(item.id)}>{t("delete")}</DropdownMenuItem></DropdownMenuContent></DropdownMenu></td>
        </tr>
      ))}</tbody>
    </table></div>
  );
}
