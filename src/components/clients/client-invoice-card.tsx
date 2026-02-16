"use client";

import { useTranslations, useLocale } from "next-intl";
import { InvoiceStatusBadge } from "@/components/invoices/invoice-status-badge";
import { formatCurrency } from "@/lib/formatters";
import { Invoice } from "@/types";

interface ClientInvoiceCardProps {
  data: Invoice;
}

export function ClientInvoiceCard({ data }: ClientInvoiceCardProps) {
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

  const firstItem = data.items[0]?.description || "—";
  const extraCount = data.items.length - 1;

  return (
    <div className="rounded-lg border border-border bg-card p-4 md:hidden">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-medium font-english text-foreground">{data.invoiceNumber}</p>
          <p className="text-xs text-muted-foreground">
            {firstItem}{extraCount > 0 && <span className="opacity-60"> +{extraCount}</span>}
          </p>
        </div>
        <InvoiceStatusBadge status={data.status} />
      </div>
      <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
        <div className="flex justify-between">
          <span>{t("date")}: <span className="font-english">{data.date}</span></span>
          <span>{t("paymentMethod")}: {paymentLabel(data.paymentMethod)}</span>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-end border-t border-border pt-3">
        <p className="text-sm font-bold font-english text-foreground">{formatCurrency(data.total, locale)}</p>
      </div>
    </div>
  );
}
