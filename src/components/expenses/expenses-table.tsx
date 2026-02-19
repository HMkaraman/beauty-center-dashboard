"use client";
import { useTranslations, useLocale } from "next-intl";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { ExpenseStatusBadge } from "./expense-status-badge";
import { Expense } from "@/types";
import { Price } from "@/components/ui/price";

interface ExpensesTableProps { data: Expense[]; onEdit?: (item: Expense) => void; onDelete?: (id: string) => void; onActivity?: (item: Expense) => void; selectedIds?: string[]; onToggle?: (id: string) => void; onToggleAll?: () => void; isAllSelected?: boolean; isSomeSelected?: boolean; }

export function ExpensesTable({ data, onEdit, onDelete, onActivity, selectedIds, onToggle, onToggleAll, isAllSelected, isSomeSelected }: ExpensesTableProps) {
  const t = useTranslations("expenses");
  const locale = useLocale();
  return (
    <div className="hidden md:block rounded-lg border border-border bg-card overflow-x-auto"><table className="w-full text-sm">
      <thead><tr className="border-b border-border">
        {onToggleAll && <th className="px-4 py-3 w-10"><Checkbox checked={isAllSelected ? true : isSomeSelected ? "indeterminate" : false} onCheckedChange={onToggleAll} /></th>}
        <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("date")}</th>
        <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("description")}</th>
        <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("category")}</th>
        <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("amount")}</th>
        <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("paymentMethod")}</th>
        <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("status")}</th>
        <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("actions")}</th>
      </tr></thead>
      <tbody>{data.map((expense) => (
        <tr key={expense.id} className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors">
          {onToggle && <td className="px-4 py-3 w-10"><Checkbox checked={selectedIds?.includes(expense.id) ?? false} onCheckedChange={() => onToggle(expense.id)} /></td>}
          <td className="px-4 py-3 font-english text-muted-foreground">{expense.date}</td>
          <td className="px-4 py-3"><p className="font-medium text-foreground">{expense.description}</p></td>
          <td className="px-4 py-3 text-muted-foreground">{expense.category}</td>
          <td className="px-4 py-3 font-english text-foreground"><Price value={expense.amount} /></td>
          <td className="px-4 py-3 text-muted-foreground">{expense.paymentMethod}</td>
          <td className="px-4 py-3"><ExpenseStatusBadge status={expense.status} /></td>
          <td className="px-4 py-3"><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon-xs"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end"><DropdownMenuItem onClick={() => onEdit?.(expense)}>{t("edit")}</DropdownMenuItem><DropdownMenuItem onClick={() => onActivity?.(expense)}>{t("activityLog")}</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem variant="destructive" onClick={() => onDelete?.(expense.id)}>{t("delete")}</DropdownMenuItem></DropdownMenuContent></DropdownMenu></td>
        </tr>
      ))}</tbody>
    </table></div>
  );
}
