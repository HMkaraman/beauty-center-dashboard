"use client";

import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAccounts, useSeedAccounts } from "@/lib/hooks/use-finance";

const typeColors: Record<string, string> = {
  revenue: "text-green-400",
  cogs: "text-orange-400",
  expense: "text-red-400",
  asset: "text-blue-400",
  liability: "text-purple-400",
};

export function FinanceAccountsTab() {
  const t = useTranslations("finance");
  const tc = useTranslations("common");
  const locale = useLocale();
  const { data: accounts, isLoading } = useAccounts();
  const seedAccounts = useSeedAccounts();

  const handleSeed = () => {
    seedAccounts.mutate(undefined, {
      onSuccess: () => toast.success(t("accounts.seedSuccess")),
      onError: () => toast.error(tc("error")),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">{t("accounts.title")}</h3>
        <Button size="sm" variant="outline" onClick={handleSeed} disabled={seedAccounts.isPending}>
          {t("accounts.seedAccounts")}
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-card">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-8 animate-pulse bg-muted rounded" />
            ))}
          </div>
        ) : !accounts || accounts.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <p>{t("noData")}</p>
            <Button size="sm" className="mt-4" onClick={handleSeed} disabled={seedAccounts.isPending}>
              {t("accounts.seedAccounts")}
            </Button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-start font-medium text-muted-foreground font-english">{t("accounts.code")}</th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t("accounts.name")}</th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t("accounts.type")}</th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t("accounts.status")}</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account) => (
                <tr key={account.id} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="px-4 py-3 font-english font-mono text-xs">{account.code}</td>
                  <td className="px-4 py-3">
                    {locale === "ar" ? account.name : (account.nameEn || account.name)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium ${typeColors[account.type] || ""}`}>
                      {t(`accounts.type${account.type.charAt(0).toUpperCase() + account.type.slice(1)}` as Parameters<typeof t>[0])}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs ${account.isActive ? "text-green-400" : "text-muted-foreground"}`}>
                      {account.isActive ? t("accounts.active") : t("accounts.inactive")}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
