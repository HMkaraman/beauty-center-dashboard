import { apiFetch } from "./client";

export interface ExchangeRateEntry {
  rate: number;
  isManual: boolean;
  updatedAt: string;
}

export interface Settings {
  id?: string;
  tenantId?: string;
  businessName: string;
  businessNameEn?: string;
  phone?: string;
  email?: string;
  address?: string;
  taxNumber?: string;
  currency: string;
  country?: string;
  locale?: string;
  timezone?: string;
  taxRate: number;
  taxEnabled?: number | boolean;
  exchangeRates?: string | null;
  nextInvoiceNumber?: number;
  nextCreditNoteNumber?: number;
  smsEnabled?: number | boolean;
  emailEnabled?: number | boolean;
  taxRegistrationNumber?: string;
  businessAddress?: string;
  businessPhone?: string;
  invoicePrefix?: string;
  eInvoicingEnabled?: number | boolean;
  eInvoicingMode?: string;
  zatcaEnvironment?: string;
}

export interface WorkingHours {
  id?: string;
  tenantId?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isOpen: number | boolean;
  day?: string;
  openTime?: string;
  closeTime?: string;
  [key: string]: unknown;
}

export const settingsApi = {
  get: () => apiFetch<Settings>("/settings"),
  update: (data: Partial<Settings>) =>
    apiFetch<Settings>("/settings", { method: "PATCH", body: JSON.stringify(data) }),
  getWorkingHours: () => apiFetch<WorkingHours[]>("/settings/working-hours"),
  updateWorkingHours: (data: WorkingHours[]) =>
    apiFetch<WorkingHours[]>("/settings/working-hours", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  fetchExchangeRates: () =>
    apiFetch<{ exchangeRates: Record<string, ExchangeRateEntry> }>(
      "/settings/exchange-rates/fetch",
      { method: "POST" }
    ),
};
