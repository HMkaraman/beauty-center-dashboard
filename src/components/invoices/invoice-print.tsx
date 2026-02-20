"use client";

import { useTranslations } from "next-intl";
import type { Invoice } from "@/types";

interface InvoicePrintProps {
  invoice: Invoice;
  businessName?: string;
  businessNameEn?: string;
  trn?: string;
  businessAddress?: string;
  businessPhone?: string;
}

export function InvoicePrint({
  invoice,
  businessName,
  businessNameEn,
  trn,
  businessAddress,
  businessPhone,
}: InvoicePrintProps) {
  const t = useTranslations("invoices");

  const isSimplified = !invoice.buyerTrn;
  const invoiceTypeLabel = isSimplified
    ? t("typeSimplified")
    : t("typeStandard");

  const isCreditNote = invoice.invoiceType === "credit_note";
  const isDebitNote = invoice.invoiceType === "debit_note";
  const documentLabel = isCreditNote
    ? t("creditNote")
    : isDebitNote
      ? t("debitNote")
      : invoiceTypeLabel;

  return (
    <div className="mx-auto max-w-[800px] bg-white p-8 text-black print:p-4" dir="rtl">
      {/* Header */}
      <div className="mb-6 border-b-2 border-gray-800 pb-4">
        <div className="flex items-start justify-between">
          <div>
            {businessName && <h1 className="text-2xl font-bold">{businessName}</h1>}
            {businessNameEn && <p className="text-sm text-gray-600 font-english">{businessNameEn}</p>}
            {businessAddress && <p className="mt-1 text-sm text-gray-600">{businessAddress}</p>}
            {businessPhone && <p className="text-sm text-gray-600">{businessPhone}</p>}
            {trn && <p className="mt-1 text-sm font-english">TRN: {trn}</p>}
          </div>
          <div className="text-left">
            <p className="text-lg font-bold">{documentLabel}</p>
            <p className="text-sm font-english">#{invoice.invoiceNumber}</p>
            {invoice.uuid && (
              <p className="text-xs text-gray-500 font-english">UUID: {invoice.uuid}</p>
            )}
            <p className="mt-1 text-sm">{invoice.date}</p>
          </div>
        </div>
      </div>

      {/* Buyer Info */}
      <div className="mb-6 grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-bold text-gray-600">{t("clientName")}</p>
          <p>{invoice.clientName}</p>
          {invoice.clientPhone && <p className="text-sm font-english">{invoice.clientPhone}</p>}
        </div>
        {invoice.buyerTrn && (
          <div className="text-left">
            <p className="text-sm font-bold text-gray-600">TRN</p>
            <p className="font-english">{invoice.buyerTrn}</p>
            {invoice.buyerName && <p>{invoice.buyerName}</p>}
            {invoice.buyerAddress && <p className="text-sm">{invoice.buyerAddress}</p>}
          </div>
        )}
      </div>

      {/* Original Invoice Reference for Credit/Debit Notes */}
      {invoice.originalInvoiceId && (
        <div className="mb-4 rounded bg-gray-50 p-3">
          <p className="text-sm">
            <span className="font-bold">{t("originalInvoice")}: </span>
            {invoice.originalInvoiceId}
          </p>
        </div>
      )}

      {/* Items Table */}
      <table className="mb-6 w-full border-collapse">
        <thead>
          <tr className="border-b-2 border-gray-800 bg-gray-50">
            <th className="px-3 py-2 text-right text-sm font-bold">#</th>
            <th className="px-3 py-2 text-right text-sm font-bold">{t("description")}</th>
            <th className="px-3 py-2 text-center text-sm font-bold">{t("qty")}</th>
            <th className="px-3 py-2 text-left text-sm font-bold font-english">{t("price")}</th>
            <th className="px-3 py-2 text-left text-sm font-bold font-english">{t("tax")}</th>
            <th className="px-3 py-2 text-left text-sm font-bold font-english">{t("total")}</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, index) => (
            <tr key={index} className="border-b border-gray-200">
              <td className="px-3 py-2 text-sm font-english">{index + 1}</td>
              <td className="px-3 py-2 text-sm">{item.description}</td>
              <td className="px-3 py-2 text-center text-sm font-english">{item.quantity}</td>
              <td className="px-3 py-2 text-left text-sm font-english">{item.unitPrice.toFixed(2)}</td>
              <td className="px-3 py-2 text-left text-sm font-english">
                {item.taxAmount != null ? item.taxAmount.toFixed(2) : "-"}
              </td>
              <td className="px-3 py-2 text-left text-sm font-english">{item.total.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="mb-6 flex justify-end">
        <div className="w-64 space-y-1">
          <div className="flex justify-between text-sm">
            <span>{t("subtotal")}</span>
            <span className="font-english">{invoice.subtotal.toFixed(2)}</span>
          </div>
          {invoice.discountTotal != null && invoice.discountTotal > 0 && (
            <div className="flex justify-between text-sm">
              <span>{t("discountPercent")}</span>
              <span className="font-english">-{invoice.discountTotal.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span>{t("tax")} ({invoice.taxRate}%)</span>
            <span className="font-english">{invoice.taxAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between border-t-2 border-gray-800 pt-1 font-bold">
            <span>{t("total")}</span>
            <span className="font-english">{invoice.total.toFixed(2)} {invoice.currency || "SAR"}</span>
          </div>
        </div>
      </div>

      {/* QR Code */}
      {invoice.qrCode && (
        <div className="mt-6 flex items-center justify-center border-t pt-4">
          <div className="text-center">
            <p className="mb-2 text-xs text-gray-500">ZATCA QR Code</p>
            <div className="inline-block rounded bg-gray-100 p-3">
              <p className="break-all text-xs font-english">{invoice.qrCode}</p>
            </div>
          </div>
        </div>
      )}

      {/* Notes */}
      {invoice.notes && (
        <div className="mt-4 border-t pt-3">
          <p className="text-sm font-bold">{t("notes")}</p>
          <p className="text-sm text-gray-600">{invoice.notes}</p>
        </div>
      )}
    </div>
  );
}
