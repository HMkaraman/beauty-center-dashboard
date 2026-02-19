import { CurrencyTaxCard } from "@/components/settings/currency-tax-card";
import { ExchangeRatesCard } from "@/components/settings/exchange-rates-card";

export default function FinancialSettingsPage() {
  return (
    <div className="space-y-6">
      <CurrencyTaxCard />
      <ExchangeRatesCard />
    </div>
  );
}
