"use client";

import { motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { EmployeeStatusBadge } from "./employee-status-badge";
import { formatCurrency } from "@/lib/formatters";
import { Employee } from "@/types";

interface EmployeeCardProps {
  data: Employee;
  onEdit?: (item: Employee) => void;
  onDelete?: (id: string) => void;
}

export function EmployeeCard({ data, onEdit, onDelete }: EmployeeCardProps) {
  const t = useTranslations("employees");
  const locale = useLocale();
  const router = useRouter();
  return (
    <motion.div whileHover={{ y: -2, boxShadow: "0 8px 30px rgba(196, 149, 106, 0.15)" }} transition={{ duration: 0.2 }} className="rounded-lg border border-border bg-card p-4 md:hidden">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3"><Avatar size="sm"><AvatarFallback>{data.name.charAt(0)}</AvatarFallback></Avatar><div><p className="font-medium text-foreground">{data.name}</p><p className="text-xs text-muted-foreground">{data.role}</p></div></div>
        <div className="flex items-center gap-2">
          <EmployeeStatusBadge status={data.status} />
          <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon-xs"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end"><DropdownMenuItem onClick={() => router.push(`/employees/${data.id}`)}>{t("view")}</DropdownMenuItem><DropdownMenuItem onClick={() => onEdit?.(data)}>{t("edit")}</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem variant="destructive" onClick={() => onDelete?.(data.id)}>{t("delete")}</DropdownMenuItem></DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
        <div className="flex justify-between"><span>{t("phone")}: <span className="font-english">{data.phone}</span></span></div>
        <div className="flex justify-between"><span>{t("appointments")}: <span className="font-english">{data.appointments}</span></span></div>
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
        <span className="text-xs font-english text-muted-foreground">{data.hireDate}</span>
        <p className="text-sm font-bold font-english text-foreground">{formatCurrency(data.revenue, locale)}</p>
      </div>
    </motion.div>
  );
}
