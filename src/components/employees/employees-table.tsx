"use client";

import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { EmployeeStatusBadge } from "./employee-status-badge";
import { formatCurrency } from "@/lib/formatters";
import { Employee } from "@/types";

interface EmployeesTableProps {
  data: Employee[];
  onEdit?: (item: Employee) => void;
  onDelete?: (id: string) => void;
  selectedIds?: string[];
  onToggle?: (id: string) => void;
  onToggleAll?: () => void;
  isAllSelected?: boolean;
  isSomeSelected?: boolean;
}

export function EmployeesTable({ data, onEdit, onDelete, selectedIds, onToggle, onToggleAll, isAllSelected, isSomeSelected }: EmployeesTableProps) {
  const t = useTranslations("employees");
  const locale = useLocale();
  const router = useRouter();
  return (
    <div className="hidden md:block rounded-lg border border-border bg-card overflow-x-auto">
      <table className="w-full text-sm">
        <thead><tr className="border-b border-border">
          {onToggleAll && <th className="px-4 py-3 w-10"><Checkbox checked={isAllSelected ? true : isSomeSelected ? "indeterminate" : false} onCheckedChange={onToggleAll} /></th>}
          <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("employee")}</th>
          <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("phone")}</th>
          <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("status")}</th>
          <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("appointments")}</th>
          <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("revenue")}</th>
          <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("rating")}</th>
          <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("hireDate")}</th>
          <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("actions")}</th>
        </tr></thead>
        <tbody>{data.map((employee) => (
          <tr key={employee.id} className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors">
            {onToggle && <td className="px-4 py-3 w-10"><Checkbox checked={selectedIds?.includes(employee.id) ?? false} onCheckedChange={() => onToggle(employee.id)} /></td>}
            <td className="px-4 py-3"><div className="flex items-center gap-3"><Avatar size="sm"><AvatarFallback>{employee.name.charAt(0)}</AvatarFallback></Avatar><div><p className="font-medium text-foreground">{employee.name}</p><p className="text-xs text-muted-foreground">{employee.role}</p></div></div></td>
            <td className="px-4 py-3 font-english text-muted-foreground">{employee.phone}</td>
            <td className="px-4 py-3"><EmployeeStatusBadge status={employee.status} /></td>
            <td className="px-4 py-3 font-english text-muted-foreground">{employee.appointments}</td>
            <td className="px-4 py-3 font-english text-foreground">{formatCurrency(employee.revenue, locale)}</td>
            <td className="px-4 py-3 font-english text-muted-foreground">{employee.rating > 0 ? employee.rating : "—"}</td>
            <td className="px-4 py-3 font-english text-muted-foreground">{employee.hireDate}</td>
            <td className="px-4 py-3">
              <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon-xs"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => router.push(`/employees/${employee.id}`)}>{t("view")}</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit?.(employee)}>{t("edit")}</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onClick={() => onDelete?.(employee.id)}>{t("delete")}</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}
