import { CurrencyTaxCard } from "@/components/settings/currency-tax-card";
import { ExchangeRatesCard } from "@/components/settings/exchange-rates-card";
import { TaxRegistrationCard } from "@/components/settings/tax-registration-card";
import { EInvoicingCard } from "@/components/settings/e-invoicing-card";
import { InvoiceNumberingCard } from "@/components/settings/invoice-numbering-card";

export default function FinancialSettingsPage() {
  return (
    <div className="space-y-6">
      <CurrencyTaxCard />
      <TaxRegistrationCard />
      <InvoiceNumberingCard />
      <EInvoicingCard />
      <ExchangeRatesCard />
    </div>
  );
}
