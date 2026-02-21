"use client";

import { Invoice } from "@/types";
import { Settings } from "@/lib/api/settings";
import { QrCodeImage } from "./qr-code-image";

interface InvoicePrintViewProps {
  invoice: Invoice;
  settings: Settings;
}

function getInvoiceTypeLabel(invoice: Invoice): { ar: string; en: string } {
  switch (invoice.invoiceType) {
    case "credit_note":
      return { ar: "إشعار دائن", en: "Credit Note" };
    case "debit_note":
      return { ar: "إشعار مدين", en: "Debit Note" };
    case "simplified":
      return { ar: "فاتورة ضريبية مبسطة", en: "Simplified Tax Invoice" };
    default:
      return { ar: "فاتورة ضريبية", en: "Tax Invoice" };
  }
}

function getTaxBreakdown(invoice: Invoice) {
  const groups: Record<number, { taxableAmount: number; vatAmount: number }> = {};
  for (const item of invoice.items) {
    const rate = item.taxRate ?? invoice.taxRate;
    if (!groups[rate]) groups[rate] = { taxableAmount: 0, vatAmount: 0 };
    const lineNet = item.total - (item.taxAmount ?? 0);
    groups[rate].taxableAmount += lineNet;
    groups[rate].vatAmount += item.taxAmount ?? 0;
  }
  return Object.entries(groups).map(([rate, data]) => ({
    rate: Number(rate),
    ...data,
  }));
}

function formatCurrency(value: number, currency?: string) {
  return `${value.toFixed(2)} ${currency || ""}`.trim();
}

export function InvoicePrintView({ invoice, settings }: InvoicePrintViewProps) {
  const typeLabel = getInvoiceTypeLabel(invoice);
  const taxBreakdown = getTaxBreakdown(invoice);
  const currency = invoice.currency || settings.currency || "";
  const taxableAmount = invoice.subtotal - (invoice.discountTotal ?? 0);

  return (
    <div className="hidden print-only">
      {/* A4 Layout */}
      <div className="print-a4-view hidden inv-print" dir="rtl">
        {/* Header */}
        <div className="inv-print-header">
          <h1 className="inv-print-biz-name">{settings.businessName}</h1>
          {settings.businessNameEn && (
            <p className="inv-print-biz-name-en">{settings.businessNameEn}</p>
          )}
          {settings.businessAddress && <p className="inv-print-text-sm">{settings.businessAddress}</p>}
          {settings.businessPhone && <p className="inv-print-text-sm inv-print-ltr">{settings.businessPhone}</p>}
          {(settings.taxRegistrationNumber || settings.taxNumber) && (
            <p className="inv-print-trn">
              الرقم الضريبي / TRN: {settings.taxRegistrationNumber || settings.taxNumber}
            </p>
          )}
        </div>

        {/* Document Type Badge */}
        <div className="inv-print-type-badge">
          <strong className="inv-print-type-ar">{typeLabel.ar}</strong>
          <br />
          <span className="inv-print-type-en">{typeLabel.en}</span>
        </div>

        {/* Invoice Meta */}
        <table className="inv-print-meta">
          <tbody>
            <tr>
              <td className="inv-print-meta-cell">
                <strong>رقم الفاتورة / Invoice #:</strong> {invoice.invoiceNumber}
              </td>
              <td className="inv-print-meta-cell inv-print-text-left">
                <strong>التاريخ / Date:</strong> {invoice.date}
              </td>
            </tr>
            {invoice.uuid && (
              <tr>
                <td colSpan={2} className="inv-print-uuid">
                  UUID: {invoice.uuid}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Buyer Info (B2B) */}
        {(invoice.buyerName || invoice.buyerTrn) && (
          <div className="inv-print-buyer">
            <strong>معلومات المشتري / Buyer Information</strong>
            <table className="inv-print-buyer-table">
              <tbody>
                {invoice.buyerName && (
                  <tr>
                    <td><strong>الاسم / Name:</strong> {invoice.buyerName}</td>
                  </tr>
                )}
                {invoice.buyerTrn && (
                  <tr>
                    <td><strong>الرقم الضريبي / TRN:</strong> {invoice.buyerTrn}</td>
                  </tr>
                )}
                {invoice.buyerAddress && (
                  <tr>
                    <td><strong>العنوان / Address:</strong> {invoice.buyerAddress}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Client Info (B2C) */}
        {!invoice.buyerName && (
          <div className="inv-print-client">
            <strong>العميل / Client:</strong> {invoice.clientName} — {invoice.clientPhone}
          </div>
        )}

        {/* Items Table */}
        <table className="inv-print-table">
          <thead>
            <tr className="inv-print-table-header">
              <th className="inv-print-th">#</th>
              <th className="inv-print-th">الوصف<br /><span className="inv-print-th-en">Description</span></th>
              <th className="inv-print-th inv-print-text-center">الكمية<br /><span className="inv-print-th-en">Qty</span></th>
              <th className="inv-print-th inv-print-text-center">السعر<br /><span className="inv-print-th-en">Price</span></th>
              <th className="inv-print-th inv-print-text-center">الخصم<br /><span className="inv-print-th-en">Discount</span></th>
              <th className="inv-print-th inv-print-text-center">الضريبة %<br /><span className="inv-print-th-en">Tax %</span></th>
              <th className="inv-print-th inv-print-text-center">مبلغ الضريبة<br /><span className="inv-print-th-en">Tax Amt</span></th>
              <th className="inv-print-th inv-print-text-center">الإجمالي<br /><span className="inv-print-th-en">Total</span></th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, i) => (
              <tr key={i} className="inv-print-row">
                <td className="inv-print-td inv-print-text-center">{i + 1}</td>
                <td className="inv-print-td">{item.description}</td>
                <td className="inv-print-td inv-print-text-center">{item.quantity}</td>
                <td className="inv-print-td inv-print-text-center">{item.unitPrice.toFixed(2)}</td>
                <td className="inv-print-td inv-print-text-center">{item.discount.toFixed(2)}</td>
                <td className="inv-print-td inv-print-text-center">{item.taxRate ?? invoice.taxRate}%</td>
                <td className="inv-print-td inv-print-text-center">{(item.taxAmount ?? 0).toFixed(2)}</td>
                <td className="inv-print-td inv-print-text-center">{item.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Tax Breakdown */}
        {taxBreakdown.length > 0 && (
          <div className="inv-print-tax-section">
            <strong>تفصيل الضريبة / Tax Breakdown</strong>
            <table className="inv-print-tax-table">
              <thead>
                <tr className="inv-print-table-header">
                  <th className="inv-print-tax-th">النسبة / Rate</th>
                  <th className="inv-print-tax-th inv-print-text-center">المبلغ الخاضع / Taxable</th>
                  <th className="inv-print-tax-th inv-print-text-center">الضريبة / VAT</th>
                </tr>
              </thead>
              <tbody>
                {taxBreakdown.map((row, i) => (
                  <tr key={i} className="inv-print-row">
                    <td className="inv-print-tax-td">{row.rate}%</td>
                    <td className="inv-print-tax-td inv-print-text-center">{row.taxableAmount.toFixed(2)}</td>
                    <td className="inv-print-tax-td inv-print-text-center">{row.vatAmount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Totals */}
        <div className="inv-print-totals-wrap">
          <table className="inv-print-totals">
            <tbody>
              <tr className="inv-print-totals-row">
                <td className="inv-print-totals-label">المجموع / Subtotal</td>
                <td className="inv-print-totals-value">{formatCurrency(invoice.subtotal, currency)}</td>
              </tr>
              {(invoice.discountTotal ?? 0) > 0 && (
                <tr className="inv-print-totals-row">
                  <td className="inv-print-totals-label">الخصم / Discount</td>
                  <td className="inv-print-totals-value">-{formatCurrency(invoice.discountTotal!, currency)}</td>
                </tr>
              )}
              <tr className="inv-print-totals-row">
                <td className="inv-print-totals-label">المبلغ الخاضع / Taxable</td>
                <td className="inv-print-totals-value">{formatCurrency(taxableAmount, currency)}</td>
              </tr>
              <tr className="inv-print-totals-row">
                <td className="inv-print-totals-label">الضريبة / VAT ({invoice.taxRate}%)</td>
                <td className="inv-print-totals-value">{formatCurrency(invoice.taxAmount, currency)}</td>
              </tr>
              <tr className="inv-print-grand-total">
                <td className="inv-print-totals-label">الإجمالي / Grand Total</td>
                <td className="inv-print-totals-value">{formatCurrency(invoice.total, currency)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* QR Code */}
        {invoice.qrCode && (
          <div className="inv-print-qr">
            <QrCodeImage data={invoice.qrCode} size={150} />
          </div>
        )}

        {/* Notes */}
        {invoice.notes && (
          <div className="inv-print-notes">
            <strong>ملاحظات / Notes:</strong> {invoice.notes}
          </div>
        )}

        {/* Footer */}
        <div className="inv-print-footer">
          تم الإنشاء بواسطة {settings.businessName} / Generated by {settings.businessNameEn || settings.businessName}
        </div>
      </div>

      {/* Receipt 80mm Layout */}
      <div className="print-receipt-80-view hidden inv-print inv-receipt inv-receipt-80" dir="rtl">
        {/* Header */}
        <div className="inv-receipt-header">
          <strong className="inv-receipt-biz-name">{settings.businessName}</strong>
          {settings.businessNameEn && <div className="inv-receipt-biz-en">{settings.businessNameEn}</div>}
          {settings.businessAddress && <div className="inv-receipt-detail">{settings.businessAddress}</div>}
          {settings.businessPhone && <div className="inv-receipt-detail inv-print-ltr">{settings.businessPhone}</div>}
          {(settings.taxRegistrationNumber || settings.taxNumber) && (
            <div className="inv-receipt-detail inv-receipt-trn">
              الرقم الضريبي: {settings.taxRegistrationNumber || settings.taxNumber}
            </div>
          )}
        </div>

        <div className="inv-print-separator" />

        {/* Document Type */}
        <div className="inv-receipt-type">{typeLabel.ar}</div>

        <div className="inv-print-separator" />

        {/* Invoice Meta */}
        <div className="inv-receipt-meta">
          <div>رقم: {invoice.invoiceNumber}</div>
          <div>التاريخ: {invoice.date}</div>
          <div>العميل: {invoice.clientName}</div>
        </div>

        <div className="inv-print-separator" />

        {/* Items */}
        {invoice.items.map((item, i) => (
          <div key={i} className="inv-receipt-item">
            <div>{item.description}</div>
            <div className="inv-receipt-item-line">
              <span>{item.quantity} × {item.unitPrice.toFixed(2)}</span>
              <span>{item.total.toFixed(2)}</span>
            </div>
          </div>
        ))}

        <div className="inv-print-separator inv-print-separator-lg" />

        {/* Totals */}
        <div className="inv-receipt-totals">
          <div className="inv-receipt-totals-row">
            <span>المجموع</span>
            <span>{invoice.subtotal.toFixed(2)}</span>
          </div>
          {(invoice.discountTotal ?? 0) > 0 && (
            <div className="inv-receipt-totals-row">
              <span>الخصم</span>
              <span>-{invoice.discountTotal!.toFixed(2)}</span>
            </div>
          )}
          <div className="inv-receipt-totals-row">
            <span>الضريبة ({invoice.taxRate}%)</span>
            <span>{invoice.taxAmount.toFixed(2)}</span>
          </div>
          <div className="inv-receipt-grand-total">
            <span>الإجمالي</span>
            <span>{formatCurrency(invoice.total, currency)}</span>
          </div>
        </div>

        {/* QR Code */}
        {invoice.qrCode && (
          <div className="inv-print-qr inv-receipt-qr">
            <QrCodeImage data={invoice.qrCode} size={100} />
          </div>
        )}

        <div className="inv-print-separator" />

        {/* Thank You */}
        <div className="inv-receipt-thanks">
          <div>شكراً لزيارتكم</div>
          <div className="inv-print-ltr">Thank you for visiting</div>
        </div>
      </div>

      {/* Receipt 58mm Layout */}
      <div className="print-receipt-58-view hidden inv-print inv-receipt inv-receipt-58" dir="rtl">
        {/* Header */}
        <div className="inv-receipt-header">
          <strong className="inv-receipt-biz-name">{settings.businessName}</strong>
          {(settings.taxRegistrationNumber || settings.taxNumber) && (
            <div className="inv-receipt-detail">
              {settings.taxRegistrationNumber || settings.taxNumber}
            </div>
          )}
        </div>

        <div className="inv-print-separator" />

        <div className="inv-receipt-type">{typeLabel.ar}</div>

        <div className="inv-print-separator" />

        <div className="inv-receipt-meta">
          <div>{invoice.invoiceNumber}</div>
          <div>{invoice.date}</div>
          <div>{invoice.clientName}</div>
        </div>

        <div className="inv-print-separator" />

        {/* Items */}
        {invoice.items.map((item, i) => (
          <div key={i} className="inv-receipt-item">
            <div>{item.description}</div>
            <div className="inv-receipt-item-line">
              <span>{item.quantity}×{item.unitPrice.toFixed(2)}</span>
              <span>{item.total.toFixed(2)}</span>
            </div>
          </div>
        ))}

        <div className="inv-print-separator inv-print-separator-lg" />

        {/* Totals */}
        <div className="inv-receipt-totals">
          <div className="inv-receipt-totals-row">
            <span>المجموع</span>
            <span>{invoice.subtotal.toFixed(2)}</span>
          </div>
          {invoice.taxAmount > 0 && (
            <div className="inv-receipt-totals-row">
              <span>الضريبة</span>
              <span>{invoice.taxAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="inv-receipt-grand-total">
            <span>الإجمالي</span>
            <span>{invoice.total.toFixed(2)}</span>
          </div>
        </div>

        {/* QR Code */}
        {invoice.qrCode && (
          <div className="inv-print-qr inv-receipt-qr">
            <QrCodeImage data={invoice.qrCode} size={80} />
          </div>
        )}

        <div className="inv-receipt-thanks">
          شكراً لزيارتكم
        </div>
      </div>
    </div>
  );
}
