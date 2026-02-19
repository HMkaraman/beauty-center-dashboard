"use client";

import { useTranslations, useLocale } from "next-intl";
import { MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { ServiceStatusBadge } from "./service-status-badge";
import { Service } from "@/types";
import { Price } from "@/components/ui/price";

interface ServicesTableProps { data: Service[]; onEdit?: (item: Service) => void; onDelete?: (id: string) => void; onActivity?: (item: Service) => void; selectedIds?: string[]; onToggle?: (id: string) => void; onToggleAll?: () => void; isAllSelected?: boolean; isSomeSelected?: boolean; }

export function ServicesTable({ data, onEdit, onDelete, onActivity, selectedIds, onToggle, onToggleAll, isAllSelected, isSomeSelected }: ServicesTableProps) {
  const t = useTranslations("services");
  const locale = useLocale();
  return (
    <div className="hidden md:block rounded-lg border border-border bg-card overflow-x-auto">
      <table className="w-full text-sm">
        <thead><tr className="border-b border-border">
          {onToggleAll && <th className="px-4 py-3 w-10"><Checkbox checked={isAllSelected ? true : isSomeSelected ? "indeterminate" : false} onCheckedChange={onToggleAll} /></th>}
          <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("name")}</th>
          <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("category")}</th>
          <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("duration")}</th>
          <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("price")}</th>
          <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("status")}</th>
          <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("bookings")}</th>
          <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("actions")}</th>
        </tr></thead>
        <tbody>{data.map((service) => (
          <tr key={service.id} className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors">
            {onToggle && <td className="px-4 py-3 w-10"><Checkbox checked={selectedIds?.includes(service.id) ?? false} onCheckedChange={() => onToggle(service.id)} /></td>}
            <td className="px-4 py-3"><div className="flex items-center gap-3"><Avatar size="sm"><AvatarFallback>{service.name.charAt(0)}</AvatarFallback></Avatar><p className="font-medium text-foreground">{service.name}</p></div></td>
            <td className="px-4 py-3 text-muted-foreground">{service.category}</td>
            <td className="px-4 py-3 font-english text-muted-foreground">{service.duration}{t("minutes")}</td>
            <td className="px-4 py-3 font-english text-foreground"><Price value={service.price} /></td>
            <td className="px-4 py-3"><ServiceStatusBadge status={service.status} /></td>
            <td className="px-4 py-3 font-english text-muted-foreground">{service.bookings}</td>
            <td className="px-4 py-3">
              <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon-xs"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                <DropdownMenuContent align="end"><DropdownMenuItem onClick={() => onEdit?.(service)}>{t("edit")}</DropdownMenuItem><DropdownMenuItem onClick={() => onActivity?.(service)}>{t("activityLog")}</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem variant="destructive" onClick={() => onDelete?.(service.id)}>{t("delete")}</DropdownMenuItem></DropdownMenuContent>
              </DropdownMenu>
            </td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}
