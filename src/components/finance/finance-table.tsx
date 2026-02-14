"use client";

import { useTranslations } from "next-intl";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TransactionTypeBadge } from "./transaction-type-badge";
import { formatCurrency } from "@/lib/formatters";
import { Transaction } from "@/types";

interface FinanceTableProps {
  data: Transaction[];
}

export function FinanceTable({ data }: FinanceTableProps) {
  const t = useTranslations("finance");

  return (
    <div className="hidden md:block rounded-lg border border-border bg-card overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("date")}</th>
            <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("description")}</th>
            <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("category")}</th>
            <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("type")}</th>
            <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("amount")}</th>
            <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("actions")}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((transaction) => (
            <tr key={transaction.id} className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors">
              <td className="px-4 py-3 font-english text-muted-foreground">{transaction.date}</td>
              <td className="px-4 py-3 font-medium text-foreground">{transaction.description}</td>
              <td className="px-4 py-3 text-muted-foreground">{transaction.category}</td>
              <td className="px-4 py-3">
                <TransactionTypeBadge type={transaction.type} />
              </td>
              <td className="px-4 py-3 font-english text-foreground">{formatCurrency(transaction.amount)}</td>
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
