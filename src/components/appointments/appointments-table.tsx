"use client";

import { useTranslations } from "next-intl";
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
import { AppointmentStatusBadge } from "./appointment-status-badge";
import { formatCurrency } from "@/lib/formatters";
import { Appointment } from "@/types";

interface AppointmentsTableProps {
  data: Appointment[];
}

export function AppointmentsTable({ data }: AppointmentsTableProps) {
  const t = useTranslations("appointments");

  return (
    <div className="hidden md:block rounded-lg border border-border bg-card overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
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
              <td className="px-4 py-3 font-english text-foreground">{formatCurrency(appointment.price)}</td>
              <td className="px-4 py-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon-xs">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>{t("view")}</DropdownMenuItem>
                    <DropdownMenuItem>{t("edit")}</DropdownMenuItem>
                    <DropdownMenuItem>{t("confirm")}</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive">{t("delete")}</DropdownMenuItem>
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
