"use client";

import { motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AppointmentStatusBadge } from "./appointment-status-badge";
import { formatCurrency } from "@/lib/formatters";
import { Appointment, AppointmentStatus } from "@/types";

const STATUSES: AppointmentStatus[] = ["confirmed", "pending", "waiting", "in-progress", "cancelled", "completed", "no-show"];

const STATUS_KEYS: Record<AppointmentStatus, string> = {
  confirmed: "statusConfirmed",
  pending: "statusPending",
  cancelled: "statusCancelled",
  completed: "statusCompleted",
  "no-show": "statusNoShow",
  waiting: "statusWaiting",
  "in-progress": "statusInProgress",
};

interface AppointmentCardProps {
  data: Appointment;
  onEdit?: (item: Appointment) => void;
  onDelete?: (id: string) => void;
  onCheckout?: (item: Appointment) => void;
  onStatusChange?: (id: string, status: AppointmentStatus) => void;
}

export function AppointmentCard({ data, onEdit, onDelete, onCheckout, onStatusChange }: AppointmentCardProps) {
  const t = useTranslations("appointments");
  const locale = useLocale();
  const router = useRouter();

  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: "0 8px 30px rgba(196, 149, 106, 0.15)" }}
      transition={{ duration: 0.2 }}
      className="rounded-lg border border-border bg-card p-4 md:hidden"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar size="sm">
            <AvatarFallback>{data.clientName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-foreground">{data.clientName}</p>
            <p className="text-xs font-english text-muted-foreground">{data.clientPhone}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <AppointmentStatusBadge status={data.status} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-xs">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push(`/appointments/${data.id}`)}>{t("view")}</DropdownMenuItem>
              {(data.status === "confirmed" || data.status === "pending") && (
                <DropdownMenuItem onClick={() => onCheckout?.(data)}>{t("checkout")}</DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onEdit?.(data)}>{t("edit")}</DropdownMenuItem>
              {onStatusChange && (
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>{t("status")}</DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    {STATUSES.filter((s) => s !== data.status).map((status) => (
                      <DropdownMenuItem key={status} onClick={() => onStatusChange(data.id, status)}>
                        {t(STATUS_KEYS[status] as "statusConfirmed")}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => onDelete?.(data.id)}>{t("delete")}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
        <div className="flex justify-between">
          <span>{t("service")}: {data.service}</span>
        </div>
        <div className="flex justify-between">
          <span>{t("employee")}: {data.employee}</span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
        <div className="flex items-center gap-3 text-xs font-english text-muted-foreground">
          <span>{data.date}</span>
          <span>{data.time}</span>
          <span>{data.duration}{t("minutes")}</span>
        </div>
        <p className="text-sm font-bold font-english text-foreground">
          {formatCurrency(data.price, locale)}
        </p>
      </div>
    </motion.div>
  );
}
