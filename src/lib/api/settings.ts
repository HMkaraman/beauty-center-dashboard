import { apiFetch } from "./client";

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
  locale?: string;
  timezone?: string;
  taxRate: number;
  nextInvoiceNumber?: number;
  smsEnabled?: number | boolean;
  emailEnabled?: number | boolean;
  [key: string]: unknown;
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
};
