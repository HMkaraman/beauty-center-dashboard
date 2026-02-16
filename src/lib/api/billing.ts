import { apiFetch } from "./client";

export interface SubscriptionInfo {
  id: string | null;
  plan: string;
  status: string;
  maxStaff: number;
  maxLocations: number;
  trialEndsAt: string | null;
  currentPeriodEnd: string | null;
}

export const billingApi = {
  getSubscription: () => apiFetch<SubscriptionInfo>("/billing"),
  createCheckout: (plan: string) =>
    apiFetch<{ url: string }>("/billing/checkout", {
      method: "POST",
      body: JSON.stringify({ plan }),
    }),
  createPortalSession: () =>
    apiFetch<{ url: string }>("/billing/portal", { method: "POST" }),
};
