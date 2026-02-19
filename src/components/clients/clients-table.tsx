"use client";

import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { ClientStatusBadge } from "./client-status-badge";
import { formatCurrency } from "@/lib/formatters";
import { Client } from "@/types";

interface ClientsTableProps {
  data: Client[];
  onEdit?: (item: Client) => void;
  onDelete?: (id: string) => void;
  selectedIds?: string[];
  onToggle?: (id: string) => void;
  onToggleAll?: () => void;
  isAllSelected?: boolean;
  isSomeSelected?: boolean;
}

export function ClientsTable({ data, onEdit, onDelete, selectedIds, onToggle, onToggleAll, isAllSelected, isSomeSelected }: ClientsTableProps) {
  const t = useTranslations("clients");
  const locale = useLocale();
  const router = useRouter();

  return (
    <div className="hidden md:block rounded-lg border border-border bg-card overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            {onToggleAll && <th className="px-4 py-3 w-10"><Checkbox checked={isAllSelected ? true : isSomeSelected ? "indeterminate" : false} onCheckedChange={onToggleAll} /></th>}
            <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("client")}</th>
            <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("phone")}</th>
            <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("status")}</th>
            <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("appointments")}</th>
            <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("totalSpent")}</th>
            <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("lastVisit")}</th>
            <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("joinDate")}</th>
            <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("actions")}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((client) => (
            <tr key={client.id} className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors">
              {onToggle && <td className="px-4 py-3 w-10"><Checkbox checked={selectedIds?.includes(client.id) ?? false} onCheckedChange={() => onToggle(client.id)} /></td>}
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <Avatar size="sm"><AvatarFallback>{client.name.charAt(0)}</AvatarFallback></Avatar>
                  <div>
                    <p className="font-medium text-foreground">{client.name}</p>
                    <p className="text-xs font-english text-muted-foreground">{client.email}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 font-english text-muted-foreground">{client.phone}</td>
              <td className="px-4 py-3"><ClientStatusBadge status={client.status} /></td>
              <td className="px-4 py-3 font-english text-muted-foreground">{client.totalAppointments}</td>
              <td className="px-4 py-3 font-english text-foreground">{formatCurrency(client.totalSpent, locale)}</td>
              <td className="px-4 py-3 font-english text-muted-foreground">{client.lastVisit}</td>
              <td className="px-4 py-3 font-english text-muted-foreground">{client.joinDate}</td>
              <td className="px-4 py-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><Button variant="ghost" size="icon-xs"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => router.push(`/clients/${client.id}`)}>{t("view")}</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit?.(client)}>{t("edit")}</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive" onClick={() => onDelete?.(client.id)}>{t("delete")}</DropdownMenuItem>
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
