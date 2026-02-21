"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import type { InvoiceDesign } from "@/lib/invoice-design";
import { SPACING_MULTIPLIERS } from "@/lib/invoice-design";

interface InvoiceDesignPreviewProps {
  design: InvoiceDesign;
  businessName?: string;
  businessNameEn?: string;
  logoUrl?: string;
}

const SAMPLE_ITEMS = [
  { desc: "قص وتصفيف شعر", descEn: "Haircut & Styling", qty: 1, price: 150, disc: 0, tax: 15, taxAmt: 22.5, total: 172.5 },
  { desc: "صبغة شعر", descEn: "Hair Coloring", qty: 1, price: 300, disc: 30, tax: 15, taxAmt: 40.5, total: 310.5 },
  { desc: "تنظيف بشرة", descEn: "Facial Cleansing", qty: 1, price: 200, disc: 0, tax: 15, taxAmt: 30, total: 230 },
];

const SAMPLE = {
  invoiceNumber: "INV-2024-0042",
  date: "2024-12-15",
  uuid: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  clientName: "سارة أحمد",
  clientPhone: "+966 55 123 4567",
  subtotal: 650,
  discount: 30,
  taxable: 620,
  taxAmount: 93,
  total: 713,
  taxRate: 15,
};

export function InvoiceDesignPreview({ design, businessName, businessNameEn, logoUrl }: InvoiceDesignPreviewProps) {
  const t = useTranslations("settings.invoiceDesign");
  const sp = SPACING_MULTIPLIERS[design.sectionSpacing];

  const isModern = design.template === "modern";
  const isElegant = design.template === "elegant";
  const isCompact = design.template === "compact";

  const fontFamilyCSS = useMemo(() => {
    switch (design.fontFamily) {
      case "tajawal": return "'Tajawal', sans-serif";
      case "cairo": return "'Cairo', sans-serif";
      default: return "'Noto Kufi Arabic', sans-serif";
    }
  }, [design.fontFamily]);

  const tableHeaderBg = isModern ? design.accentColor : isElegant ? "transparent" : design.secondaryColor;
  const tableHeaderColor = isModern ? "#fff" : "#000";
  const headerBorder = isElegant
    ? `1px solid ${design.accentColor}`
    : isCompact
      ? "none"
      : `2px solid ${design.primaryColor}`;

  return (
    <div className="overflow-hidden rounded-lg border border-border" style={{ height: 680 }}>
      <div className="bg-muted/50 px-3 py-2 text-xs font-medium text-muted-foreground border-b border-border">
        {t("preview")}
      </div>
      <div className="overflow-auto" style={{ height: 648, background: "#e8e8e8", padding: 12 }} dir="ltr">
        <div
          style={{
            width: "210mm",
            transform: "scale(0.48)",
            transformOrigin: "top left",
          }}
        >
          <div
            style={{
              fontFamily: fontFamilyCSS,
              fontSize: design.bodyFontSize,
              color: "#1a1a1a",
              direction: "rtl",
              padding: design.pageMargin,
              background: "#fff",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              minHeight: "297mm",
            }}
          >
          {/* Header */}
          <div
            style={{
              textAlign: isModern || isCompact ? "initial" : "center",
              marginBottom: 16 * sp,
              borderBottom: headerBorder,
              paddingBottom: 12 * sp,
              ...(isModern || isCompact
                ? { display: "flex", flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center" }
                : {}),
            }}
          >
            {logoUrl && (
              <img
                src={logoUrl}
                alt=""
                style={{
                  display: "block",
                  width: isCompact ? 80 : 120,
                  maxHeight: isCompact ? 40 : 60,
                  objectFit: "contain",
                  ...(design.logoPosition === "center" && !isModern && !isCompact
                    ? { margin: "0 auto 8px" }
                    : design.logoPosition === "left" && !isModern && !isCompact
                      ? { marginLeft: "auto", marginBottom: 8 }
                      : { marginBottom: isModern || isCompact ? 0 : 8 }),
                }}
              />
            )}
            <div style={{ textAlign: isModern || isCompact ? "right" : "center", flex: isModern || isCompact ? 1 : undefined }}>
              <div style={{ fontSize: design.businessNameSize, fontWeight: 700, marginBottom: 2 }}>
                {businessName || "مركز الجمال"}
              </div>
              {businessNameEn && (
                <div style={{ fontSize: Math.round(design.businessNameSize * 0.67), fontFamily: "'Outfit', sans-serif", color: "#444", marginBottom: 6, direction: "ltr" }}>
                  {businessNameEn}
                </div>
              )}
              {design.tagline && (
                <div style={{ fontSize: design.bodyFontSize - 1, color: design.accentColor, marginBottom: 2 }}>
                  {design.tagline}
                </div>
              )}
              {design.taglineEn && (
                <div style={{ fontSize: design.bodyFontSize - 2, color: design.accentColor, direction: "ltr", marginBottom: 2 }}>
                  {design.taglineEn}
                </div>
              )}
              <div style={{ fontSize: design.bodyFontSize - 1, color: "#555" }}>الرياض، المملكة العربية السعودية</div>
              <div style={{ fontSize: design.bodyFontSize - 1, color: "#555", direction: "ltr" }}>+966 50 000 0000</div>
              <div style={{ fontSize: design.bodyFontSize, fontWeight: 700, marginTop: 4 }}>
                الرقم الضريبي / TRN: 300000000000003
              </div>
            </div>
          </div>

          {/* Modern accent bar */}
          {isModern && (
            <div style={{ height: 3, backgroundColor: design.accentColor, marginBottom: 12 * sp }} />
          )}

          {/* Type Badge */}
          <div
            style={{
              textAlign: "center",
              margin: isModern ? `${12 * sp}px auto` : `${12 * sp}px 0`,
              padding: isCompact ? "3px 8px" : "6px 12px",
              ...(isModern
                ? { backgroundColor: design.accentColor, borderRadius: 20, display: "block", width: "auto" }
                : isElegant
                  ? { borderBottom: `1px solid ${design.accentColor}`, background: "transparent" }
                  : isCompact
                    ? { backgroundColor: design.secondaryColor, borderRadius: 4 }
                    : { backgroundColor: design.secondaryColor, border: "1px solid #ddd" }),
            }}
          >
            <strong style={{
              fontSize: isCompact ? 11 : 14,
              ...(isModern ? { color: "#fff" } : {}),
              ...(isElegant ? { textDecoration: "underline", textDecorationColor: design.accentColor } : {}),
            }}>
              فاتورة ضريبية
            </strong>
            <br />
            <span style={{
              fontSize: isCompact ? 8 : 10,
              fontFamily: "'Outfit', sans-serif",
              ...(isModern ? { color: "rgba(255,255,255,0.8)" } : { color: "#555" }),
            }}>
              Tax Invoice
            </span>
          </div>

          {/* Meta */}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 * sp, fontSize: design.bodyFontSize }}>
            <span><strong>رقم الفاتورة / Invoice #: </strong>{SAMPLE.invoiceNumber}</span>
            <span><strong>التاريخ / Date: </strong>{SAMPLE.date}</span>
          </div>
          {design.showUuid && (
            <div style={{ fontSize: 7, color: "#888", textAlign: "center", marginBottom: 8 * sp }}>
              UUID: {SAMPLE.uuid}
            </div>
          )}

          {/* Client */}
          <div style={{ fontSize: design.bodyFontSize, marginBottom: 12 * sp, color: "#333" }}>
            <strong>العميل / Client: </strong>{SAMPLE.clientName} — {SAMPLE.clientPhone}
          </div>

          {/* Items Table */}
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 12 * sp }}>
            <thead>
              <tr style={{
                backgroundColor: tableHeaderBg,
                borderBottom: isElegant ? `2px solid ${design.accentColor}` : `2px solid ${design.primaryColor}`,
              }}>
                {["#", "الوصف", "الكمية", "السعر", "الخصم", "ض %", "مبلغ الضريبة", "الإجمالي"].map((h, i) => (
                  <th key={i} style={{
                    padding: isCompact ? 3 : 5,
                    textAlign: i === 1 ? "right" : "center",
                    fontSize: design.tableHeaderSize,
                    fontWeight: 700,
                    color: tableHeaderColor,
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SAMPLE_ITEMS.map((item, i) => (
                <tr key={i} style={{
                  borderBottom: "1px solid #eee",
                  backgroundColor: isCompact && i % 2 === 1 ? design.secondaryColor : undefined,
                }}>
                  <td style={{ padding: isCompact ? 3 : 4, textAlign: "center", fontSize: design.bodyFontSize - 1, fontFamily: "'Outfit', sans-serif" }}>{i + 1}</td>
                  <td style={{ padding: isCompact ? 3 : 4, textAlign: "right", fontSize: design.bodyFontSize - 1 }}>{item.desc}</td>
                  <td style={{ padding: isCompact ? 3 : 4, textAlign: "center", fontSize: design.bodyFontSize - 1, fontFamily: "'Outfit', sans-serif" }}>{item.qty}</td>
                  <td style={{ padding: isCompact ? 3 : 4, textAlign: "center", fontSize: design.bodyFontSize - 1, fontFamily: "'Outfit', sans-serif" }}>{item.price.toFixed(2)}</td>
                  <td style={{ padding: isCompact ? 3 : 4, textAlign: "center", fontSize: design.bodyFontSize - 1, fontFamily: "'Outfit', sans-serif" }}>{item.disc.toFixed(2)}</td>
                  <td style={{ padding: isCompact ? 3 : 4, textAlign: "center", fontSize: design.bodyFontSize - 1, fontFamily: "'Outfit', sans-serif" }}>{item.tax}%</td>
                  <td style={{ padding: isCompact ? 3 : 4, textAlign: "center", fontSize: design.bodyFontSize - 1, fontFamily: "'Outfit', sans-serif" }}>{item.taxAmt.toFixed(2)}</td>
                  <td style={{ padding: isCompact ? 3 : 4, textAlign: "center", fontSize: design.bodyFontSize - 1, fontFamily: "'Outfit', sans-serif" }}>{item.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Tax Breakdown */}
          {design.showTaxBreakdown && (
            <div style={{ marginBottom: 12 * sp }}>
              <strong style={{ fontSize: design.bodyFontSize }}>تفصيل الضريبة / Tax Breakdown</strong>
              <table style={{ width: "50%", borderCollapse: "collapse", marginTop: 5 }}>
                <thead>
                  <tr style={{ backgroundColor: tableHeaderBg, borderBottom: `2px solid ${design.primaryColor}` }}>
                    <th style={{ padding: 4, fontSize: design.tableHeaderSize, fontWeight: 700, color: tableHeaderColor }}>النسبة</th>
                    <th style={{ padding: 4, fontSize: design.tableHeaderSize, fontWeight: 700, textAlign: "center", color: tableHeaderColor }}>المبلغ الخاضع</th>
                    <th style={{ padding: 4, fontSize: design.tableHeaderSize, fontWeight: 700, textAlign: "center", color: tableHeaderColor }}>الضريبة</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: 3, fontSize: design.bodyFontSize - 1 }}>15%</td>
                    <td style={{ padding: 3, fontSize: design.bodyFontSize - 1, textAlign: "center", fontFamily: "'Outfit', sans-serif" }}>{SAMPLE.taxable.toFixed(2)}</td>
                    <td style={{ padding: 3, fontSize: design.bodyFontSize - 1, textAlign: "center", fontFamily: "'Outfit', sans-serif" }}>{SAMPLE.taxAmount.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Totals */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 * sp }}>
            <div style={{ width: "45%" }}>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #eee", padding: "3px 0" }}>
                <span style={{ fontSize: design.bodyFontSize - 1, color: "#555" }}>المجموع / Subtotal</span>
                <span style={{ fontSize: design.bodyFontSize - 1, fontFamily: "'Outfit', sans-serif" }}>{SAMPLE.subtotal.toFixed(2)} SAR</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #eee", padding: "3px 0" }}>
                <span style={{ fontSize: design.bodyFontSize - 1, color: "#555" }}>الخصم / Discount</span>
                <span style={{ fontSize: design.bodyFontSize - 1, fontFamily: "'Outfit', sans-serif" }}>-{SAMPLE.discount.toFixed(2)} SAR</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #eee", padding: "3px 0" }}>
                <span style={{ fontSize: design.bodyFontSize - 1, color: "#555" }}>الضريبة / VAT (15%)</span>
                <span style={{ fontSize: design.bodyFontSize - 1, fontFamily: "'Outfit', sans-serif" }}>{SAMPLE.taxAmount.toFixed(2)} SAR</span>
              </div>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                borderTop: `2px solid ${isModern || isElegant ? design.accentColor : design.primaryColor}`,
                paddingTop: isModern ? 6 : 5,
                paddingBottom: isModern ? 6 : 0,
                paddingLeft: isModern ? 6 : 0,
                paddingRight: isModern ? 6 : 0,
                marginTop: 2,
                ...(isModern ? { backgroundColor: `${design.accentColor}15`, borderRadius: 4 } : {}),
              }}>
                <strong style={{ fontSize: design.bodyFontSize + 2 }}>الإجمالي / Grand Total</strong>
                <strong style={{
                  fontSize: design.bodyFontSize + 2,
                  fontFamily: "'Outfit', sans-serif",
                  ...(isModern ? { color: design.accentColor } : {}),
                }}>
                  {SAMPLE.total.toFixed(2)} SAR
                </strong>
              </div>
            </div>
          </div>

          {/* QR Code placeholder */}
          {design.showQrCode && (
            <div style={{ textAlign: "center", marginBottom: 12 * sp }}>
              <div style={{
                width: 80,
                height: 80,
                margin: "0 auto",
                border: "1px solid #ddd",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 8,
                color: "#999",
              }}>
                QR Code
              </div>
            </div>
          )}

          {/* Notes */}
          {design.showNotes && (
            <div style={{ marginBottom: 12 * sp, padding: 8, border: "1px solid #eee", fontSize: design.bodyFontSize - 1 }}>
              <strong>ملاحظات / Notes:</strong> شكراً لثقتكم بنا
            </div>
          )}

          {/* Footer */}
          <div style={{
            textAlign: "center",
            fontSize: design.bodyFontSize - 2,
            color: "#999",
            borderTop: "1px solid #ddd",
            paddingTop: 8,
            marginTop: 20,
          }}>
            {design.footerText || design.footerTextEn
              ? (
                <>
                  {design.footerText && <div>{design.footerText}</div>}
                  {design.footerTextEn && <div style={{ direction: "ltr" }}>{design.footerTextEn}</div>}
                </>
              )
              : (
                <>
                  تم الإنشاء بواسطة {businessName || "مركز الجمال"} / Generated by {businessNameEn || businessName || "Beauty Center"}
                </>
              )}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
