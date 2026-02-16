"use client";
import { motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ExpenseStatusBadge } from "./expense-status-badge";
import { formatCurrency } from "@/lib/formatters";
import { Expense } from "@/types";

interface ExpenseCardProps { data: Expense; onEdit?: (item: Expense) => void; onDelete?: (id: string) => void; }

export function ExpenseCard({ data, onEdit, onDelete }: ExpenseCardProps) {
  const t = useTranslations("expenses");
  const locale = useLocale();
  return (
    <motion.div whileHover={{ y: -2, boxShadow: "0 8px 30px rgba(196, 149, 106, 0.15)" }} transition={{ duration: 0.2 }} className="rounded-lg border border-border bg-card p-4 md:hidden">
      <div className="flex items-start justify-between">
        <div><p className="font-medium text-foreground">{data.description}</p><p className="text-xs text-muted-foreground">{data.category}</p></div>
        <div className="flex items-center gap-2"><ExpenseStatusBadge status={data.status} />
          <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon-xs"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end"><DropdownMenuItem onClick={() => onEdit?.(data)}>{t("edit")}</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem variant="destructive" onClick={() => onDelete?.(data.id)}>{t("delete")}</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
        </div>
      </div>
      <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
        <div className="flex justify-between"><span>{t("date")}: <span className="font-english">{data.date}</span></span></div>
        <div className="flex justify-between"><span>{t("paymentMethod")}: {data.paymentMethod}</span></div>
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
        <span className="text-xs font-english text-muted-foreground">{data.date}</span>
        <p className="text-sm font-bold font-english text-foreground">{formatCurrency(data.amount, locale)}</p>
      </div>
    </motion.div>
  );
}
