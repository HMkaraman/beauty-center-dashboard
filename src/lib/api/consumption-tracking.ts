import { apiFetch } from "./client";
import type { SessionConsumptionLog } from "@/types";

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export const consumptionApi = {
  list: (params?: { appointmentId?: string; clientId?: string; page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.appointmentId) searchParams.set("appointmentId", params.appointmentId);
    if (params?.clientId) searchParams.set("clientId", params.clientId);
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));
    const qs = searchParams.toString();
    return apiFetch<PaginatedResponse<SessionConsumptionLog>>(`/consumption${qs ? `?${qs}` : ""}`);
  },
  get: (id: string) => apiFetch<SessionConsumptionLog>(`/consumption/${id}`),
  recordLaser: (data: {
    appointmentId: string;
    serviceId?: string;
    clientId?: string;
    actualShots: number;
    expectedMinShots?: number;
    expectedMaxShots?: number;
    deviceId?: string;
    deviceModel?: string;
    notes?: string;
  }) =>
    apiFetch<SessionConsumptionLog>("/consumption", {
      method: "POST",
      body: JSON.stringify({ ...data, consumptionType: "laser_shots" }),
    }),
  recordInjectable: (data: {
    appointmentId: string;
    serviceId?: string;
    clientId?: string;
    inventoryItemId?: string;
    productName: string;
    totalAllocated: number;
    amountUsed: number;
    unit: string;
    notes?: string;
  }) =>
    apiFetch<SessionConsumptionLog>("/consumption", {
      method: "POST",
      body: JSON.stringify({ ...data, consumptionType: "injectable" }),
    }),
  getReport: (params?: { serviceId?: string; startDate?: string; endDate?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.serviceId) searchParams.set("serviceId", params.serviceId);
    if (params?.startDate) searchParams.set("startDate", params.startDate);
    if (params?.endDate) searchParams.set("endDate", params.endDate);
    const qs = searchParams.toString();
    return apiFetch<{ data: unknown }>(`/consumption/report${qs ? `?${qs}` : ""}`);
  },
};
