"use client";

import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { InvoiceStatusBadge } from "./invoice-status-badge";
import { Invoice } from "@/types";
import { Price } from "@/components/ui/price";

interface InvoiceDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: Invoice | null;
}

export function InvoiceDetailSheet({ open, onOpenChange, invoice }: InvoiceDetailSheetProps) {
  const t = useTranslations("invoices");
  const locale = useLocale();
  const router = useRouter();

  if (!invoice) return null;

  const paymentLabel = (method?: string) => {
    if (!method) return "—";
    const map: Record<string, string> = { cash: t("methodCash"), card: t("methodCard"), bank_transfer: t("methodTransfer") };
    return map[method] || method;
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <span className="font-english">{invoice.invoiceNumber}</span>
            <InvoiceStatusBadge status={invoice.status} />
          </SheetTitle>
          <SheetDescription className="sr-only">{t("invoiceDetails")}</SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-5 px-4">
          {/* Client */}
          <div className="rounded-lg border border-border p-3 space-y-1">
            <p className="text-xs text-muted-foreground">{t("client")}</p>
            <p className="font-medium text-foreground">{invoice.clientName}</p>
            <p className="text-sm font-english text-muted-foreground">{invoice.clientPhone}</p>
          </div>

          {/* Items */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">{t("items")}</p>
            <div className="rounded-lg border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/30">
                    <th className="px-3 py-2 text-start text-xs text-muted-foreground">{t("description")}</th>
                    <th className="px-3 py-2 text-start text-xs text-muted-foreground">{t("qty")}</th>
                    <th className="px-3 py-2 text-start text-xs text-muted-foreground">{t("price")}</th>
                    <th className="px-3 py-2 text-start text-xs text-muted-foreground">{t("total")}</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, i) => (
                    <tr key={i} className="border-b border-border last:border-0">
                      <td className="px-3 py-2 text-foreground">{item.description}</td>
                      <td className="px-3 py-2 font-english text-muted-foreground">{item.quantity}</td>
                      <td className="px-3 py-2 font-english text-muted-foreground"><Price value={item.unitPrice} /></td>
                      <td className="px-3 py-2 font-english font-medium text-foreground"><Price value={item.total} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="rounded-lg border border-border p-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("subtotal")}</span>
              <span className="font-english text-foreground"><Price value={invoice.subtotal} /></span>
            </div>
            {invoice.taxRate > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t("tax")} ({invoice.taxRate}%)</span>
                <span className="font-english text-foreground"><Price value={invoice.taxAmount} /></span>
              </div>
            )}
            <div className="flex justify-between border-t border-border pt-2 font-bold">
              <span className="text-foreground">{t("total")}</span>
              <span className="font-english text-gold"><Price value={invoice.total} /></span>
            </div>
          </div>

          {/* Meta */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs text-muted-foreground">{t("date")}</p>
              <p className="text-sm font-english text-foreground">{invoice.date}</p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs text-muted-foreground">{t("paymentMethod")}</p>
              <p className="text-sm text-foreground">{paymentLabel(invoice.paymentMethod)}</p>
            </div>
          </div>

          {invoice.notes && (
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs text-muted-foreground">{t("notes")}</p>
              <p className="text-sm text-foreground">{invoice.notes}</p>
            </div>
          )}
        </div>

        <SheetFooter>
          <Button
            variant="default"
            onClick={() => {
              onOpenChange(false);
              router.push(`/invoices/${invoice.id}`);
            }}
          >
            {t("viewFullDetails")}
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t("close")}</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
