"use client";

import { motion } from "framer-motion";
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

interface AppointmentCardProps {
  data: Appointment;
  onEdit?: (item: Appointment) => void;
  onDelete?: (id: string) => void;
}

export function AppointmentCard({ data, onEdit, onDelete }: AppointmentCardProps) {
  const t = useTranslations("appointments");

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
              <DropdownMenuItem onClick={() => onEdit?.(data)}>{t("edit")}</DropdownMenuItem>
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
          {formatCurrency(data.price)}
        </p>
      </div>
    </motion.div>
  );
}
