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
      <div className="print-a4-view hidden" dir="rtl">
        <div style={{ fontFamily: "Arial, sans-serif", fontSize: "12px", color: "#000" }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "20px", borderBottom: "2px solid #333", paddingBottom: "15px" }}>
            <h1 style={{ fontSize: "20px", margin: "0 0 4px" }}>{settings.businessName}</h1>
            {settings.businessNameEn && (
              <p style={{ fontSize: "14px", margin: "0 0 8px", direction: "ltr" }}>{settings.businessNameEn}</p>
            )}
            {settings.businessAddress && <p style={{ margin: "2px 0" }}>{settings.businessAddress}</p>}
            {settings.businessPhone && <p style={{ margin: "2px 0", direction: "ltr" }}>{settings.businessPhone}</p>}
            {(settings.taxRegistrationNumber || settings.taxNumber) && (
              <p style={{ margin: "6px 0 0", fontWeight: "bold" }}>
                الرقم الضريبي / TRN: {settings.taxRegistrationNumber || settings.taxNumber}
              </p>
            )}
          </div>

          {/* Document Type */}
          <div style={{ textAlign: "center", margin: "15px 0", padding: "8px", background: "#f5f5f5", border: "1px solid #ddd" }}>
            <strong style={{ fontSize: "16px" }}>{typeLabel.ar}</strong>
            <br />
            <span style={{ fontSize: "12px", direction: "ltr" }}>{typeLabel.en}</span>
          </div>

          {/* Invoice Meta */}
          <table style={{ width: "100%", marginBottom: "15px", fontSize: "11px" }}>
            <tbody>
              <tr>
                <td style={{ width: "50%" }}>
                  <strong>رقم الفاتورة / Invoice #:</strong> {invoice.invoiceNumber}
                </td>
                <td style={{ width: "50%", textAlign: "left" }}>
                  <strong>التاريخ / Date:</strong> {invoice.date}
                </td>
              </tr>
              {invoice.uuid && (
                <tr>
                  <td colSpan={2} style={{ fontSize: "9px", color: "#666" }}>
                    UUID: {invoice.uuid}
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Buyer Info (B2B) */}
          {(invoice.buyerName || invoice.buyerTrn) && (
            <div style={{ marginBottom: "15px", padding: "10px", border: "1px solid #ddd" }}>
              <strong>معلومات المشتري / Buyer Information</strong>
              <table style={{ width: "100%", marginTop: "5px", fontSize: "11px" }}>
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
            <div style={{ marginBottom: "15px", fontSize: "11px" }}>
              <strong>العميل / Client:</strong> {invoice.clientName} — {invoice.clientPhone}
            </div>
          )}

          {/* Items Table */}
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "15px" }}>
            <thead>
              <tr style={{ background: "#f5f5f5", borderBottom: "2px solid #333" }}>
                <th style={{ padding: "6px", textAlign: "right", borderLeft: "1px solid #ddd" }}>#</th>
                <th style={{ padding: "6px", textAlign: "right", borderLeft: "1px solid #ddd" }}>الوصف<br /><span style={{ fontSize: "9px" }}>Description</span></th>
                <th style={{ padding: "6px", textAlign: "center", borderLeft: "1px solid #ddd" }}>الكمية<br /><span style={{ fontSize: "9px" }}>Qty</span></th>
                <th style={{ padding: "6px", textAlign: "center", borderLeft: "1px solid #ddd" }}>السعر<br /><span style={{ fontSize: "9px" }}>Price</span></th>
                <th style={{ padding: "6px", textAlign: "center", borderLeft: "1px solid #ddd" }}>الخصم<br /><span style={{ fontSize: "9px" }}>Discount</span></th>
                <th style={{ padding: "6px", textAlign: "center", borderLeft: "1px solid #ddd" }}>الضريبة %<br /><span style={{ fontSize: "9px" }}>Tax %</span></th>
                <th style={{ padding: "6px", textAlign: "center", borderLeft: "1px solid #ddd" }}>مبلغ الضريبة<br /><span style={{ fontSize: "9px" }}>Tax Amt</span></th>
                <th style={{ padding: "6px", textAlign: "center" }}>الإجمالي<br /><span style={{ fontSize: "9px" }}>Total</span></th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #ddd" }}>
                  <td style={{ padding: "5px", textAlign: "center", borderLeft: "1px solid #eee" }}>{i + 1}</td>
                  <td style={{ padding: "5px", borderLeft: "1px solid #eee" }}>{item.description}</td>
                  <td style={{ padding: "5px", textAlign: "center", borderLeft: "1px solid #eee" }}>{item.quantity}</td>
                  <td style={{ padding: "5px", textAlign: "center", borderLeft: "1px solid #eee" }}>{item.unitPrice.toFixed(2)}</td>
                  <td style={{ padding: "5px", textAlign: "center", borderLeft: "1px solid #eee" }}>{item.discount.toFixed(2)}</td>
                  <td style={{ padding: "5px", textAlign: "center", borderLeft: "1px solid #eee" }}>{item.taxRate ?? invoice.taxRate}%</td>
                  <td style={{ padding: "5px", textAlign: "center", borderLeft: "1px solid #eee" }}>{(item.taxAmount ?? 0).toFixed(2)}</td>
                  <td style={{ padding: "5px", textAlign: "center" }}>{item.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Tax Breakdown */}
          {taxBreakdown.length > 0 && (
            <div style={{ marginBottom: "15px" }}>
              <strong>تفصيل الضريبة / Tax Breakdown</strong>
              <table style={{ width: "50%", borderCollapse: "collapse", marginTop: "5px", marginRight: "auto" }}>
                <thead>
                  <tr style={{ background: "#f5f5f5", borderBottom: "1px solid #ddd" }}>
                    <th style={{ padding: "4px 8px", textAlign: "right" }}>النسبة / Rate</th>
                    <th style={{ padding: "4px 8px", textAlign: "center" }}>المبلغ الخاضع / Taxable</th>
                    <th style={{ padding: "4px 8px", textAlign: "center" }}>الضريبة / VAT</th>
                  </tr>
                </thead>
                <tbody>
                  {taxBreakdown.map((row, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #eee" }}>
                      <td style={{ padding: "4px 8px" }}>{row.rate}%</td>
                      <td style={{ padding: "4px 8px", textAlign: "center" }}>{row.taxableAmount.toFixed(2)}</td>
                      <td style={{ padding: "4px 8px", textAlign: "center" }}>{row.vatAmount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Totals */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "20px" }}>
            <table style={{ width: "40%", borderCollapse: "collapse" }}>
              <tbody>
                <tr style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "4px 8px" }}>المجموع / Subtotal</td>
                  <td style={{ padding: "4px 8px", textAlign: "left" }}>{formatCurrency(invoice.subtotal, currency)}</td>
                </tr>
                {(invoice.discountTotal ?? 0) > 0 && (
                  <tr style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "4px 8px" }}>الخصم / Discount</td>
                    <td style={{ padding: "4px 8px", textAlign: "left" }}>-{formatCurrency(invoice.discountTotal!, currency)}</td>
                  </tr>
                )}
                <tr style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "4px 8px" }}>المبلغ الخاضع / Taxable</td>
                  <td style={{ padding: "4px 8px", textAlign: "left" }}>{formatCurrency(taxableAmount, currency)}</td>
                </tr>
                <tr style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "4px 8px" }}>الضريبة / VAT ({invoice.taxRate}%)</td>
                  <td style={{ padding: "4px 8px", textAlign: "left" }}>{formatCurrency(invoice.taxAmount, currency)}</td>
                </tr>
                <tr style={{ borderTop: "2px solid #333", fontWeight: "bold", fontSize: "14px" }}>
                  <td style={{ padding: "6px 8px" }}>الإجمالي / Grand Total</td>
                  <td style={{ padding: "6px 8px", textAlign: "left" }}>{formatCurrency(invoice.total, currency)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* QR Code */}
          {invoice.qrCode && (
            <div style={{ textAlign: "center", marginBottom: "15px" }}>
              <QrCodeImage data={invoice.qrCode} size={150} />
            </div>
          )}

          {/* Notes */}
          {invoice.notes && (
            <div style={{ marginBottom: "15px", padding: "8px", border: "1px solid #eee", fontSize: "11px" }}>
              <strong>ملاحظات / Notes:</strong> {invoice.notes}
            </div>
          )}

          {/* Footer */}
          <div style={{ textAlign: "center", fontSize: "10px", color: "#888", borderTop: "1px solid #ddd", paddingTop: "10px" }}>
            تم الإنشاء بواسطة {settings.businessName} / Generated by {settings.businessNameEn || settings.businessName}
          </div>
        </div>
      </div>

      {/* Receipt 80mm Layout */}
      <div className="print-receipt-80-view hidden" dir="rtl">
        <div style={{ fontFamily: "Arial, sans-serif", fontSize: "11px", color: "#000", maxWidth: "72mm", margin: "0 auto" }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "8px" }}>
            <strong style={{ fontSize: "14px" }}>{settings.businessName}</strong>
            {settings.businessNameEn && <div style={{ fontSize: "10px", direction: "ltr" }}>{settings.businessNameEn}</div>}
            {settings.businessAddress && <div style={{ fontSize: "9px" }}>{settings.businessAddress}</div>}
            {settings.businessPhone && <div style={{ fontSize: "9px", direction: "ltr" }}>{settings.businessPhone}</div>}
            {(settings.taxRegistrationNumber || settings.taxNumber) && (
              <div style={{ fontSize: "9px", marginTop: "2px" }}>
                الرقم الضريبي: {settings.taxRegistrationNumber || settings.taxNumber}
              </div>
            )}
          </div>

          <div style={{ borderTop: "1px dashed #000", margin: "4px 0" }} />

          {/* Document Type */}
          <div style={{ textAlign: "center", fontWeight: "bold", fontSize: "12px", margin: "4px 0" }}>
            {typeLabel.ar}
          </div>

          <div style={{ borderTop: "1px dashed #000", margin: "4px 0" }} />

          {/* Invoice Meta */}
          <div style={{ fontSize: "10px", marginBottom: "6px" }}>
            <div>رقم: {invoice.invoiceNumber}</div>
            <div>التاريخ: {invoice.date}</div>
            <div>العميل: {invoice.clientName}</div>
          </div>

          <div style={{ borderTop: "1px dashed #000", margin: "4px 0" }} />

          {/* Items */}
          {invoice.items.map((item, i) => (
            <div key={i} style={{ marginBottom: "4px", fontSize: "10px" }}>
              <div>{item.description}</div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>{item.quantity} × {item.unitPrice.toFixed(2)}</span>
                <span>{item.total.toFixed(2)}</span>
              </div>
            </div>
          ))}

          <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }} />

          {/* Totals */}
          <div style={{ fontSize: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>المجموع</span>
              <span>{invoice.subtotal.toFixed(2)}</span>
            </div>
            {(invoice.discountTotal ?? 0) > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>الخصم</span>
                <span>-{invoice.discountTotal!.toFixed(2)}</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>الضريبة ({invoice.taxRate}%)</span>
              <span>{invoice.taxAmount.toFixed(2)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: "13px", borderTop: "1px solid #000", paddingTop: "4px", marginTop: "4px" }}>
              <span>الإجمالي</span>
              <span>{formatCurrency(invoice.total, currency)}</span>
            </div>
          </div>

          {/* QR Code */}
          {invoice.qrCode && (
            <div style={{ textAlign: "center", margin: "8px 0" }}>
              <QrCodeImage data={invoice.qrCode} size={100} />
            </div>
          )}

          <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }} />

          {/* Thank You */}
          <div style={{ textAlign: "center", fontSize: "10px", margin: "6px 0" }}>
            <div>شكراً لزيارتكم</div>
            <div style={{ direction: "ltr" }}>Thank you for visiting</div>
          </div>
        </div>
      </div>

      {/* Receipt 58mm Layout */}
      <div className="print-receipt-58-view hidden" dir="rtl">
        <div style={{ fontFamily: "Arial, sans-serif", fontSize: "9px", color: "#000", maxWidth: "48mm", margin: "0 auto" }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "6px" }}>
            <strong style={{ fontSize: "11px" }}>{settings.businessName}</strong>
            {(settings.taxRegistrationNumber || settings.taxNumber) && (
              <div style={{ fontSize: "8px" }}>
                {settings.taxRegistrationNumber || settings.taxNumber}
              </div>
            )}
          </div>

          <div style={{ borderTop: "1px dashed #000", margin: "3px 0" }} />

          <div style={{ textAlign: "center", fontWeight: "bold", fontSize: "10px", margin: "3px 0" }}>
            {typeLabel.ar}
          </div>

          <div style={{ borderTop: "1px dashed #000", margin: "3px 0" }} />

          <div style={{ fontSize: "8px", marginBottom: "4px" }}>
            <div>{invoice.invoiceNumber}</div>
            <div>{invoice.date}</div>
            <div>{invoice.clientName}</div>
          </div>

          <div style={{ borderTop: "1px dashed #000", margin: "3px 0" }} />

          {/* Items */}
          {invoice.items.map((item, i) => (
            <div key={i} style={{ marginBottom: "3px", fontSize: "8px" }}>
              <div>{item.description}</div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>{item.quantity}×{item.unitPrice.toFixed(2)}</span>
                <span>{item.total.toFixed(2)}</span>
              </div>
            </div>
          ))}

          <div style={{ borderTop: "1px dashed #000", margin: "4px 0" }} />

          {/* Totals */}
          <div style={{ fontSize: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>المجموع</span>
              <span>{invoice.subtotal.toFixed(2)}</span>
            </div>
            {invoice.taxAmount > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>الضريبة</span>
                <span>{invoice.taxAmount.toFixed(2)}</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: "11px", borderTop: "1px solid #000", paddingTop: "2px", marginTop: "2px" }}>
              <span>الإجمالي</span>
              <span>{invoice.total.toFixed(2)}</span>
            </div>
          </div>

          {/* QR Code */}
          {invoice.qrCode && (
            <div style={{ textAlign: "center", margin: "6px 0" }}>
              <QrCodeImage data={invoice.qrCode} size={80} />
            </div>
          )}

          <div style={{ textAlign: "center", fontSize: "8px", margin: "4px 0" }}>
            شكراً لزيارتكم
          </div>
        </div>
      </div>
    </div>
  );
}
