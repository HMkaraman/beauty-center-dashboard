import { apiFetch } from "./client";
import type { HealingJourney, JourneyEntry } from "@/types";

export const healingJourneysApi = {
  list: (clientId: string) =>
    apiFetch<HealingJourney[]>(`/clients/${clientId}/healing-journeys`),

  get: (clientId: string, journeyId: string) =>
    apiFetch<{ journey: HealingJourney; entries: JourneyEntry[] }>(
      `/clients/${clientId}/healing-journeys/${journeyId}`
    ),

  create: (clientId: string, data: { title: string; description?: string; status: string; startDate: string; endDate?: string; primaryServiceId?: string }) =>
    apiFetch<HealingJourney>(`/clients/${clientId}/healing-journeys`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (clientId: string, journeyId: string, data: Partial<{ title: string; description?: string; status: string; startDate: string; endDate?: string; primaryServiceId?: string }>) =>
    apiFetch<HealingJourney>(`/clients/${clientId}/healing-journeys/${journeyId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (clientId: string, journeyId: string) =>
    apiFetch(`/clients/${clientId}/healing-journeys/${journeyId}`, {
      method: "DELETE",
    }),

  listEntries: (clientId: string, journeyId: string) =>
    apiFetch<JourneyEntry[]>(
      `/clients/${clientId}/healing-journeys/${journeyId}/entries`
    ),

  createEntry: (clientId: string, journeyId: string, data: Record<string, unknown>) =>
    apiFetch<JourneyEntry>(
      `/clients/${clientId}/healing-journeys/${journeyId}/entries`,
      { method: "POST", body: JSON.stringify(data) }
    ),

  deleteEntry: (clientId: string, journeyId: string, entryId: string) =>
    apiFetch(
      `/clients/${clientId}/healing-journeys/${journeyId}/entries?entryId=${entryId}`,
      { method: "DELETE" }
    ),

  consent: (clientId: string, journeyId: string, data: { action: string; signatureUrl?: string }) =>
    apiFetch(
      `/clients/${clientId}/healing-journeys/${journeyId}/consent`,
      { method: "POST", body: JSON.stringify(data) }
    ),
};
