"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ClientStatusBadge } from "./client-status-badge";
import { formatCurrency } from "@/lib/formatters";
import { Client } from "@/types";

interface ClientCardProps {
  data: Client;
}

export function ClientCard({ data }: ClientCardProps) {
  const t = useTranslations("clients");

  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: "0 8px 30px rgba(196, 149, 106, 0.15)" }}
      transition={{ duration: 0.2 }}
      className="rounded-lg border border-border bg-card p-4 md:hidden"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar size="sm">
            <AvatarFallback>{data.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-foreground">{data.name}</p>
            <p className="text-xs font-english text-muted-foreground">{data.email}</p>
          </div>
        </div>
        <ClientStatusBadge status={data.status} />
      </div>

      <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
        <div className="flex justify-between">
          <span>{t("phone")}: <span className="font-english">{data.phone}</span></span>
        </div>
        <div className="flex justify-between">
          <span>{t("appointments")}: <span className="font-english">{data.totalAppointments}</span></span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
        <div className="flex items-center gap-3 text-xs font-english text-muted-foreground">
          <span>{data.lastVisit}</span>
          <span>{data.joinDate}</span>
        </div>
        <p className="text-sm font-bold font-english text-foreground">
          {formatCurrency(data.totalSpent)}
        </p>
      </div>
    </motion.div>
  );
}
