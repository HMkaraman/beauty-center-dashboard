"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AppointmentStatusBadge } from "./appointment-status-badge";
import { formatCurrency } from "@/lib/formatters";
import { Appointment } from "@/types";

interface AppointmentCardProps {
  data: Appointment;
}

export function AppointmentCard({ data }: AppointmentCardProps) {
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
        <AppointmentStatusBadge status={data.status} />
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
