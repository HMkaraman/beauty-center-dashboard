"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { usePnlReport, useTaxSummary } from "@/lib/hooks/use-finance";
import { Price } from "@/components/ui/price";

function getFirstDayOfMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

function getToday() {
  return new Date().toISOString().split("T")[0];
}

export function FinanceReportsTab() {
  const t = useTranslations("finance");
  const locale = useLocale();
  const [activeReport, setActiveReport] = useState<"pnl" | "tax">("pnl");
  const [startDate, setStartDate] = useState(getFirstDayOfMonth());
  const [endDate, setEndDate] = useState(getToday());

  const { data: pnl, isLoading: pnlLoading } = usePnlReport({ startDate, endDate });
  const { data: tax, isLoading: taxLoading } = useTaxSummary({ startDate, endDate });

  return (
    <div className="space-y-6">
      {/* Period selector */}
      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">{t("reports.startDate")}</label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-40 font-english"
            dir="ltr"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">{t("reports.endDate")}</label>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-40 font-english"
            dir="ltr"
          />
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={activeReport === "pnl" ? "default" : "outline"}
            onClick={() => setActiveReport("pnl")}
          >
            {t("reports.pnl")}
          </Button>
          <Button
            size="sm"
            variant={activeReport === "tax" ? "default" : "outline"}
            onClick={() => setActiveReport("tax")}
          >
            {t("reports.taxSummary")}
          </Button>
        </div>
      </div>

      {/* P&L Report */}
      {activeReport === "pnl" && (
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">{t("reports.pnl")}</h3>
          {pnlLoading ? (
            <div className="animate-pulse space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-8 bg-muted rounded" />
              ))}
            </div>
          ) : pnl ? (
            <div className="space-y-4">
              {/* Revenue section */}
              <div>
                <h4 className="text-sm font-semibold text-green-400 mb-2">{t("reports.revenueSection")}</h4>
                {pnl.revenue.lines.map((line, i) => (
                  <div key={i} className="flex justify-between py-1 text-sm">
                    <span className="text-muted-foreground">
                      {line.code && <span className="font-english text-xs me-2">{line.code}</span>}
                      {locale === "ar" ? line.name : line.nameEn}
                    </span>
                    <span className="font-english"><Price value={line.amount} /></span>
                  </div>
                ))}
                <div className="flex justify-between border-t border-border pt-1 font-semibold text-sm mt-1">
                  <span>{t("reports.grossRevenue")}</span>
                  <span className="font-english"><Price value={pnl.revenue.total} /></span>
                </div>
              </div>

              {/* Tax collected */}
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{t("reports.taxCollected")}</span>
                <span className="font-english"><Price value={pnl.taxCollected} /></span>
              </div>

              {/* Expenses section */}
              <div>
                <h4 className="text-sm font-semibold text-red-400 mb-2">{t("reports.expensesSection")}</h4>
                {pnl.expenses.lines.map((line, i) => (
                  <div key={i} className="flex justify-between py-1 text-sm">
                    <span className="text-muted-foreground">
                      {line.code && <span className="font-english text-xs me-2">{line.code}</span>}
                      {locale === "ar" ? line.name : line.nameEn}
                    </span>
                    <span className="font-english"><Price value={line.amount} /></span>
                  </div>
                ))}
                <div className="flex justify-between border-t border-border pt-1 font-semibold text-sm mt-1">
                  <span>{t("reports.totalExpenses")}</span>
                  <span className="font-english"><Price value={pnl.expenses.total} /></span>
                </div>
              </div>

              {/* Net Profit */}
              <div className="flex justify-between border-t-2 border-foreground pt-2 text-base font-bold">
                <span>{t("reports.netProfit")}</span>
                <span className={`font-english ${pnl.netProfit >= 0 ? "text-green-400" : "text-red-400"}`}>
                  <Price value={pnl.netProfit} />
                </span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{t("reports.margin")}</span>
                <span className="font-english">{pnl.margin}%</span>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">{t("noData")}</p>
          )}
        </div>
      )}

      {/* Tax Summary */}
      {activeReport === "tax" && (
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">{t("reports.taxSummary")}</h3>
          {taxLoading ? (
            <div className="animate-pulse space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-8 bg-muted rounded" />
              ))}
            </div>
          ) : tax ? (
            <div className="space-y-4">
              {/* Output VAT summary */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg border border-border p-4">
                  <p className="text-xs text-muted-foreground">{t("reports.taxableAmount")}</p>
                  <p className="text-lg font-bold font-english"><Price value={tax.outputVat.taxableAmount} /></p>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <p className="text-xs text-muted-foreground">{t("reports.vatAmount")}</p>
                  <p className="text-lg font-bold font-english"><Price value={tax.outputVat.vatAmount} /></p>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <p className="text-xs text-muted-foreground">{t("reports.netVatPayable")}</p>
                  <p className="text-lg font-bold font-english text-gold"><Price value={tax.netVatPayable} /></p>
                </div>
              </div>

              {/* By category */}
              {tax.byCategory.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">{t("reports.taxSummary")}</h4>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="py-2 text-start text-muted-foreground">{t("category")}</th>
                        <th className="py-2 text-start font-english text-muted-foreground">{t("reports.taxableAmount")}</th>
                        <th className="py-2 text-start font-english text-muted-foreground">{t("reports.vatAmount")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tax.byCategory.map((cat, i) => (
                        <tr key={i} className="border-b border-border/50">
                          <td className="py-2">
                            {locale === "ar" ? cat.categoryLabel.ar : cat.categoryLabel.en}
                            <span className="text-xs text-muted-foreground ms-1 font-english">({cat.taxRate}%)</span>
                          </td>
                          <td className="py-2 font-english"><Price value={cat.taxableAmount} /></td>
                          <td className="py-2 font-english"><Price value={cat.vatAmount} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Monthly breakdown */}
              {tax.monthly.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">{t("reports.monthlyBreakdown")}</h4>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="py-2 text-start text-muted-foreground font-english">{t("reports.period")}</th>
                        <th className="py-2 text-start text-muted-foreground">{t("reports.invoiceCount")}</th>
                        <th className="py-2 text-start font-english text-muted-foreground">{t("reports.taxableAmount")}</th>
                        <th className="py-2 text-start font-english text-muted-foreground">{t("reports.vatAmount")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tax.monthly.map((m, i) => (
                        <tr key={i} className="border-b border-border/50">
                          <td className="py-2 font-english">{m.month}</td>
                          <td className="py-2 font-english">{m.invoiceCount}</td>
                          <td className="py-2 font-english"><Price value={m.taxableAmount} /></td>
                          <td className="py-2 font-english"><Price value={m.vatAmount} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground">{t("noData")}</p>
          )}
        </div>
      )}
    </div>
  );
}
