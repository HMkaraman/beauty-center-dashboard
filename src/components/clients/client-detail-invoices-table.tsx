"use client";

import { useTranslations, useLocale } from "next-intl";
import { InvoiceStatusBadge } from "@/components/invoices/invoice-status-badge";
import { Invoice } from "@/types";
import { Price } from "@/components/ui/price";

interface ClientDetailInvoicesTableProps {
  data: Invoice[];
}

export function ClientDetailInvoicesTable({ data }: ClientDetailInvoicesTableProps) {
  const t = useTranslations("clients");
  const tInv = useTranslations("invoices");
  const locale = useLocale();

  const paymentLabel = (method?: string) => {
    if (!method) return "—";
    const map: Record<string, string> = {
      cash: tInv("methodCash"),
      card: tInv("methodCard"),
      bank_transfer: tInv("methodTransfer"),
    };
    return map[method] || method;
  };

  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
        {t("noInvoices")}
      </div>
    );
  }

  return (
    <div className="hidden md:block rounded-lg border border-border bg-card overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("invoiceNumber")}</th>
            <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("date")}</th>
            <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("items")}</th>
            <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("total")}</th>
            <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("paymentMethod")}</th>
            <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("status")}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((invoice) => {
            const firstItem = invoice.items[0]?.description || "—";
            const extraCount = invoice.items.length - 1;
            return (
              <tr key={invoice.id} className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors">
                <td className="px-4 py-3 font-english font-medium text-foreground">{invoice.invoiceNumber}</td>
                <td className="px-4 py-3 font-english text-muted-foreground">{invoice.date}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {firstItem}{extraCount > 0 && <span className="text-xs opacity-60"> +{extraCount}</span>}
                </td>
                <td className="px-4 py-3 font-english font-medium text-foreground"><Price value={invoice.total} /></td>
                <td className="px-4 py-3 text-muted-foreground">{paymentLabel(invoice.paymentMethod)}</td>
                <td className="px-4 py-3"><InvoiceStatusBadge status={invoice.status} /></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
