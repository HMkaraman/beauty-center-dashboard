"use client";

import { useTranslations, useLocale } from "next-intl";
import { MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { AppointmentStatusBadge } from "./appointment-status-badge";
import { formatCurrency } from "@/lib/formatters";
import { Appointment } from "@/types";

interface AppointmentsTableProps {
  data: Appointment[];
  onEdit?: (item: Appointment) => void;
  onDelete?: (id: string) => void;
  onCheckout?: (item: Appointment) => void;
  selectedIds?: string[];
  onToggle?: (id: string) => void;
  onToggleAll?: () => void;
  isAllSelected?: boolean;
  isSomeSelected?: boolean;
}

export function AppointmentsTable({ data, onEdit, onDelete, onCheckout, selectedIds, onToggle, onToggleAll, isAllSelected, isSomeSelected }: AppointmentsTableProps) {
  const t = useTranslations("appointments");
  const locale = useLocale();

  return (
    <div className="hidden md:block rounded-lg border border-border bg-card overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            {onToggleAll && <th className="px-4 py-3 w-10"><Checkbox checked={isAllSelected ? true : isSomeSelected ? "indeterminate" : false} onCheckedChange={onToggleAll} /></th>}
            <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("client")}</th>
            <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("service")}</th>
            <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("employee")}</th>
            <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("date")}</th>
            <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("time")}</th>
            <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("duration")}</th>
            <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("status")}</th>
            <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("price")}</th>
            <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("actions")}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((appointment) => (
            <tr key={appointment.id} className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors">
              {onToggle && <td className="px-4 py-3 w-10"><Checkbox checked={selectedIds?.includes(appointment.id) ?? false} onCheckedChange={() => onToggle(appointment.id)} /></td>}
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <Avatar size="sm">
                    <AvatarFallback>{appointment.clientName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-foreground">{appointment.clientName}</p>
                    <p className="text-xs font-english text-muted-foreground">{appointment.clientPhone}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-muted-foreground">{appointment.service}</td>
              <td className="px-4 py-3 text-muted-foreground">{appointment.employee}</td>
              <td className="px-4 py-3 font-english text-muted-foreground">{appointment.date}</td>
              <td className="px-4 py-3 font-english text-muted-foreground">{appointment.time}</td>
              <td className="px-4 py-3 font-english text-muted-foreground">{appointment.duration}{t("minutes")}</td>
              <td className="px-4 py-3">
                <AppointmentStatusBadge status={appointment.status} />
              </td>
              <td className="px-4 py-3 font-english text-foreground">{formatCurrency(appointment.price, locale)}</td>
              <td className="px-4 py-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon-xs">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {(appointment.status === "confirmed" || appointment.status === "pending") && (
                      <DropdownMenuItem onClick={() => onCheckout?.(appointment)}>{t("checkout")}</DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => onEdit?.(appointment)}>{t("edit")}</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive" onClick={() => onDelete?.(appointment.id)}>{t("delete")}</DropdownMenuItem>
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
