"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { InvoiceStatusBadge } from "./invoice-status-badge";
import { Invoice } from "@/types";
import { Price } from "@/components/ui/price";

interface InvoiceTableProps {
  data: Invoice[];
  onView?: (item: Invoice) => void;
  onVoid?: (id: string) => void;
  selectedIds?: string[];
  onToggle?: (id: string) => void;
  onToggleAll?: () => void;
  isAllSelected?: boolean;
  isSomeSelected?: boolean;
}

export function InvoiceTable({ data, onView, onVoid, selectedIds, onToggle, onToggleAll, isAllSelected, isSomeSelected }: InvoiceTableProps) {
  const t = useTranslations("invoices");
  const locale = useLocale();

  const paymentLabel = (method?: string) => {
    if (!method) return "—";
    const map: Record<string, string> = { cash: t("methodCash"), card: t("methodCard"), bank_transfer: t("methodTransfer") };
    return map[method] || method;
  };

  return (
    <div className="hidden md:block rounded-lg border border-border bg-card overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            {onToggleAll && <th className="px-4 py-3 w-10"><Checkbox checked={isAllSelected ? true : isSomeSelected ? "indeterminate" : false} onCheckedChange={onToggleAll} /></th>}
            <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("invoiceNumber")}</th>
            <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("date")}</th>
            <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("client")}</th>
            <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("items")}</th>
            <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("total")}</th>
            <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("paymentMethod")}</th>
            <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("status")}</th>
            <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("actions")}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((invoice) => {
            const firstItem = invoice.items[0]?.description || "—";
            const extraCount = invoice.items.length - 1;
            return (
              <tr key={invoice.id} className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors">
                {onToggle && <td className="px-4 py-3 w-10"><Checkbox checked={selectedIds?.includes(invoice.id) ?? false} onCheckedChange={() => onToggle(invoice.id)} /></td>}
                <td className="px-4 py-3 font-english font-medium text-foreground">
                  <Link href={`/invoices/${invoice.id}`} className="hover:text-gold underline-offset-4 hover:underline transition-colors">
                    {invoice.invoiceNumber}
                  </Link>
                </td>
                <td className="px-4 py-3 font-english text-muted-foreground">{invoice.date}</td>
                <td className="px-4 py-3">
                  <p className="font-medium text-foreground">{invoice.clientName}</p>
                  <p className="text-xs font-english text-muted-foreground">{invoice.clientPhone}</p>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {firstItem}{extraCount > 0 && <span className="text-xs opacity-60"> +{extraCount}</span>}
                </td>
                <td className="px-4 py-3 font-english font-medium text-foreground"><Price value={invoice.total} /></td>
                <td className="px-4 py-3 text-muted-foreground">{paymentLabel(invoice.paymentMethod)}</td>
                <td className="px-4 py-3"><InvoiceStatusBadge status={invoice.status} /></td>
                <td className="px-4 py-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-xs"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onView?.(invoice)}>{t("view")}</DropdownMenuItem>
                      {invoice.status !== "void" && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem variant="destructive" onClick={() => onVoid?.(invoice.id)}>{t("voidInvoice")}</DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
