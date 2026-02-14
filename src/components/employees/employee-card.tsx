"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { EmployeeStatusBadge } from "./employee-status-badge";
import { formatCurrency } from "@/lib/formatters";
import { Employee } from "@/types";

interface EmployeeCardProps {
  data: Employee;
}

export function EmployeeCard({ data }: EmployeeCardProps) {
  const t = useTranslations("employees");

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
            <p className="text-xs text-muted-foreground">{data.role}</p>
          </div>
        </div>
        <EmployeeStatusBadge status={data.status} />
      </div>

      <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
        <div className="flex justify-between">
          <span>{t("phone")}: <span className="font-english">{data.phone}</span></span>
        </div>
        <div className="flex justify-between">
          <span>{t("appointments")}: <span className="font-english">{data.appointments}</span></span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
        <span className="text-xs font-english text-muted-foreground">{data.hireDate}</span>
        <p className="text-sm font-bold font-english text-foreground">
          {formatCurrency(data.revenue)}
        </p>
      </div>
    </motion.div>
  );
}
