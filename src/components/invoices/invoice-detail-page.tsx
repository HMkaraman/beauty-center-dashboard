"use client";

import { useCallback, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { ArrowRight, Pencil, Printer, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useInvoice } from "@/lib/hooks/use-invoices";
import { useSettings } from "@/lib/hooks/use-settings";
import { InvoiceStatusBadge } from "./invoice-status-badge";
import { InvoicePrintView } from "./invoice-print-view";
import { NewInvoiceSheet } from "./new-invoice-sheet";
import { QrCodeImage } from "./qr-code-image";
import { Price } from "@/components/ui/price";

interface InvoiceDetailPageProps {
  invoiceId: string;
}

type PrintMode = "print-a4" | "print-receipt-80" | "print-receipt-58";

function getInvoiceTypeTranslationKey(type?: string): string {
  switch (type) {
    case "credit_note": return "typeCreditNote";
    case "debit_note": return "typeDebitNote";
    case "simplified": return "typeSimplified";
    default: return "typeStandard";
  }
}

export function InvoiceDetailPage({ invoiceId }: InvoiceDetailPageProps) {
  const t = useTranslations("invoices");
  const tc = useTranslations("common");
  const router = useRouter();
  const { data: invoice, isLoading: invoiceLoading } = useInvoice(invoiceId);
  const { data: settings, isLoading: settingsLoading } = useSettings();
  const cleanupRef = useRef<(() => void) | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const handlePrint = useCallback((mode: PrintMode) => {
    // Clean up any previous handler
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }

    document.documentElement.classList.add(mode);

    const cleanup = () => {
      document.documentElement.classList.remove(mode);
      cleanupRef.current = null;
    };

    const onAfterPrint = () => cleanup();
    window.addEventListener("afterprint", onAfterPrint, { once: true });
    cleanupRef.current = () => {
      window.removeEventListener("afterprint", onAfterPrint);
      cleanup();
    };

    setTimeout(() => window.print(), 100);
  }, []);

  if (invoiceLoading || settingsLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="h-64 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">{t("invoiceDetail")} — Not found</p>
      </div>
    );
  }

  const taxableAmount = invoice.subtotal - (invoice.discountTotal ?? 0);

  // Group items by tax rate for breakdown
  const taxBreakdown: Record<number, { taxableAmount: number; vatAmount: number }> = {};
  for (const item of invoice.items) {
    const rate = item.taxRate ?? invoice.taxRate;
    if (!taxBreakdown[rate]) taxBreakdown[rate] = { taxableAmount: 0, vatAmount: 0 };
    const lineNet = item.total - (item.taxAmount ?? 0);
    taxBreakdown[rate].taxableAmount += lineNet;
    taxBreakdown[rate].vatAmount += item.taxAmount ?? 0;
  }

  const paymentLabel = (method?: string) => {
    if (!method) return "—";
    const map: Record<string, string> = {
      cash: t("methodCash"),
      card: t("methodCard"),
      bank_transfer: t("methodTransfer"),
    };
    return map[method] || method;
  };

  return (
    <>
      <div className="space-y-6 p-6 no-print">
        {/* Action Bar */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => router.push("/finance")}>
            <ArrowRight className="h-4 w-4 me-2 rtl:rotate-180" />
            {t("backToInvoices")}
          </Button>

          <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
            <Pencil className="h-4 w-4 me-2" />
            {tc("editItem")}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Printer className="h-4 w-4 me-2" />
                {t("print")}
                <ChevronDown className="h-3 w-3 ms-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handlePrint("print-a4")}>
                {t("printA4")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handlePrint("print-receipt-80")}>
                {t("printReceipt80")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handlePrint("print-receipt-58")}>
                {t("printReceipt58")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          </div>
        </div>

        {/* Header Card */}
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-xl font-bold text-foreground font-english">{invoice.invoiceNumber}</h1>
                <InvoiceStatusBadge status={invoice.status} />
              </div>
              <p className="text-sm text-muted-foreground">{t(getInvoiceTypeTranslationKey(invoice.invoiceType))}</p>
              <p className="text-sm text-muted-foreground font-english mt-1">{invoice.date}</p>
            </div>
            {invoice.uuid && (
              <p className="text-xs text-muted-foreground font-english break-all max-w-xs">UUID: {invoice.uuid}</p>
            )}
          </div>
        </div>

        {/* Two-column: Seller + Buyer */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Seller Info */}
          {settings && (
            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">{t("sellerInfo")}</h3>
              <div className="space-y-1 text-sm">
                <p className="font-medium text-foreground">{settings.businessName}</p>
                {settings.businessNameEn && (
                  <p className="text-muted-foreground font-english">{settings.businessNameEn}</p>
                )}
                {settings.businessAddress && <p className="text-muted-foreground">{settings.businessAddress}</p>}
                {settings.businessPhone && <p className="text-muted-foreground font-english">{settings.businessPhone}</p>}
                {(settings.taxRegistrationNumber || settings.taxNumber) && (
                  <p className="text-muted-foreground">
                    <span className="font-medium">{t("trn")}:</span>{" "}
                    <span className="font-english">{settings.taxRegistrationNumber || settings.taxNumber}</span>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Buyer Info */}
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">{t("buyerInfo")}</h3>
            <div className="space-y-1 text-sm">
              <p className="font-medium text-foreground">{invoice.buyerName || invoice.clientName}</p>
              <p className="text-muted-foreground font-english">{invoice.clientPhone}</p>
              {invoice.buyerTrn && (
                <p className="text-muted-foreground">
                  <span className="font-medium">{t("trn")}:</span>{" "}
                  <span className="font-english">{invoice.buyerTrn}</span>
                </p>
              )}
              {invoice.buyerAddress && <p className="text-muted-foreground">{invoice.buyerAddress}</p>}
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="rounded-lg border border-border bg-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">#</th>
                <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("description")}</th>
                <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("qty")}</th>
                <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("unitPrice")}</th>
                <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("discount")}</th>
                <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("taxRate")}</th>
                <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("taxAmount")}</th>
                <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("lineTotal")}</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-english text-muted-foreground">{i + 1}</td>
                  <td className="px-4 py-3 text-foreground">{item.description}</td>
                  <td className="px-4 py-3 font-english text-muted-foreground">{item.quantity}</td>
                  <td className="px-4 py-3 font-english text-muted-foreground"><Price value={item.unitPrice} /></td>
                  <td className="px-4 py-3 font-english text-muted-foreground"><Price value={item.discount} /></td>
                  <td className="px-4 py-3 font-english text-muted-foreground">{item.taxRate ?? invoice.taxRate}%</td>
                  <td className="px-4 py-3 font-english text-muted-foreground"><Price value={item.taxAmount ?? 0} /></td>
                  <td className="px-4 py-3 font-english font-medium text-foreground"><Price value={item.total} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Tax Breakdown + Totals */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Tax Breakdown */}
          {Object.keys(taxBreakdown).length > 0 && (
            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">{t("taxBreakdown")}</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-2 text-start text-xs text-muted-foreground">{t("taxRate")}</th>
                    <th className="pb-2 text-start text-xs text-muted-foreground">{t("taxableAmount")}</th>
                    <th className="pb-2 text-start text-xs text-muted-foreground">{t("vatAmount")}</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(taxBreakdown).map(([rate, data]) => (
                    <tr key={rate} className="border-b border-border last:border-0">
                      <td className="py-2 font-english text-muted-foreground">{rate}%</td>
                      <td className="py-2 font-english text-muted-foreground"><Price value={data.taxableAmount} /></td>
                      <td className="py-2 font-english text-muted-foreground"><Price value={data.vatAmount} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Totals */}
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t("subtotal")}</span>
                <span className="font-english text-foreground"><Price value={invoice.subtotal} /></span>
              </div>
              {(invoice.discountTotal ?? 0) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t("discount")}</span>
                  <span className="font-english text-foreground">-<Price value={invoice.discountTotal!} /></span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t("taxableAmount")}</span>
                <span className="font-english text-foreground"><Price value={taxableAmount} /></span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t("vatAmount")} ({invoice.taxRate}%)</span>
                <span className="font-english text-foreground"><Price value={invoice.taxAmount} /></span>
              </div>
              <div className="flex justify-between border-t border-border pt-2 font-bold">
                <span className="text-foreground">{t("grandTotal")}</span>
                <span className="font-english text-gold"><Price value={invoice.total} /></span>
              </div>
            </div>
          </div>
        </div>

        {/* QR Code */}
        {invoice.qrCode && (
          <div className="rounded-lg border border-border bg-card p-4 flex justify-center">
            <QrCodeImage data={invoice.qrCode} size={150} />
          </div>
        )}

        {/* Notes + Payment */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground mb-1">{t("paymentMethod")}</p>
            <p className="text-sm text-foreground">{paymentLabel(invoice.paymentMethod)}</p>
          </div>
          {invoice.notes && (
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground mb-1">{t("notes")}</p>
              <p className="text-sm text-foreground">{invoice.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Print Views (hidden on screen, visible on print) */}
      {settings && <InvoicePrintView invoice={invoice} settings={settings} />}

      <NewInvoiceSheet open={editOpen} onOpenChange={setEditOpen} editItem={invoice} />
    </>
  );
}
