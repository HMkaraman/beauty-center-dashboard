export interface CountryConfig {
  code: string;
  name: string;
  nameAr: string;
  defaultCurrency: string;
  defaultTaxRate: number;
  taxName: string;
  taxNameAr: string;
}

export const COUNTRIES: CountryConfig[] = [
  { code: "SA", name: "Saudi Arabia", nameAr: "المملكة العربية السعودية", defaultCurrency: "SAR", defaultTaxRate: 15, taxName: "VAT", taxNameAr: "ضريبة القيمة المضافة" },
  { code: "AE", name: "UAE", nameAr: "الإمارات العربية المتحدة", defaultCurrency: "AED", defaultTaxRate: 5, taxName: "VAT", taxNameAr: "ضريبة القيمة المضافة" },
  { code: "BH", name: "Bahrain", nameAr: "البحرين", defaultCurrency: "BHD", defaultTaxRate: 10, taxName: "VAT", taxNameAr: "ضريبة القيمة المضافة" },
  { code: "OM", name: "Oman", nameAr: "عمان", defaultCurrency: "OMR", defaultTaxRate: 5, taxName: "VAT", taxNameAr: "ضريبة القيمة المضافة" },
  { code: "KW", name: "Kuwait", nameAr: "الكويت", defaultCurrency: "KWD", defaultTaxRate: 0, taxName: "Tax", taxNameAr: "ضريبة" },
  { code: "QA", name: "Qatar", nameAr: "قطر", defaultCurrency: "QAR", defaultTaxRate: 0, taxName: "Tax", taxNameAr: "ضريبة" },
  { code: "IQ", name: "Iraq", nameAr: "العراق", defaultCurrency: "IQD", defaultTaxRate: 15, taxName: "Tax", taxNameAr: "ضريبة" },
  { code: "JO", name: "Jordan", nameAr: "الأردن", defaultCurrency: "JOD", defaultTaxRate: 16, taxName: "Sales Tax", taxNameAr: "ضريبة المبيعات" },
  { code: "EG", name: "Egypt", nameAr: "مصر", defaultCurrency: "EGP", defaultTaxRate: 14, taxName: "VAT", taxNameAr: "ضريبة القيمة المضافة" },
  { code: "LB", name: "Lebanon", nameAr: "لبنان", defaultCurrency: "LBP", defaultTaxRate: 11, taxName: "VAT", taxNameAr: "ضريبة القيمة المضافة" },
  { code: "TR", name: "Turkey", nameAr: "تركيا", defaultCurrency: "TRY", defaultTaxRate: 20, taxName: "KDV", taxNameAr: "ضريبة القيمة المضافة" },
  { code: "MA", name: "Morocco", nameAr: "المغرب", defaultCurrency: "MAD", defaultTaxRate: 20, taxName: "VAT", taxNameAr: "ضريبة القيمة المضافة" },
  { code: "TN", name: "Tunisia", nameAr: "تونس", defaultCurrency: "TND", defaultTaxRate: 19, taxName: "VAT", taxNameAr: "ضريبة القيمة المضافة" },
];

export function getCountryByCode(code: string): CountryConfig | undefined {
  return COUNTRIES.find((c) => c.code === code);
}
