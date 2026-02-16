const getToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("portal_token");
};

const portalFetch = async <T>(
  path: string,
  options?: RequestInit
): Promise<T> => {
  const token = getToken();
  const res = await fetch(`/api/public/portal${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });
  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem("portal_token");
      localStorage.removeItem("portal_client");
      window.location.href = "/portal";
    }
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      (errorData as Record<string, string>)?.error || "Request failed"
    );
  }
  return res.json();
};

export interface PortalClient {
  id: string;
  name: string;
  phone: string;
  email: string | null;
}

export interface PortalAppointment {
  id: string;
  service: string;
  employee: string;
  date: string;
  time: string;
  duration: number;
  status: string;
  price: string;
  notes: string | null;
}

export interface PortalInvoice {
  id: string;
  invoiceNumber: string;
  date: string;
  subtotal: string;
  taxAmount: string;
  total: string;
  status: string;
  paymentMethod: string | null;
}

export const portalApi = {
  sendOtp: (phone: string, tenantSlug: string) =>
    portalFetch<{ success: boolean; message: string; code?: string }>(
      "/send-otp",
      {
        method: "POST",
        body: JSON.stringify({ phone, tenantSlug }),
      }
    ),

  verifyOtp: (phone: string, code: string, tenantSlug: string) =>
    portalFetch<{ token: string; client: PortalClient }>("/verify-otp", {
      method: "POST",
      body: JSON.stringify({ phone, code, tenantSlug }),
    }),

  getAppointments: () =>
    portalFetch<{ upcoming: PortalAppointment[]; past: PortalAppointment[] }>(
      "/appointments"
    ),

  cancelAppointment: (id: string) =>
    portalFetch<{ success: boolean }>(`/appointments/${id}/cancel`, {
      method: "POST",
    }),

  getInvoices: () =>
    portalFetch<{ data: PortalInvoice[] }>("/invoices"),

  getProfile: () =>
    portalFetch<PortalClient>("/profile"),

  updateProfile: (data: { name?: string; email?: string }) =>
    portalFetch<{ success: boolean }>("/profile", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
};
