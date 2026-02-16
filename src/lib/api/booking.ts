export interface TenantInfo {
  name: string;
  nameEn: string;
  logo: string | null;
  phone: string | null;
  currency: string;
}

export interface BookingService {
  id: string;
  name: string;
  nameEn: string | null;
  category: string;
  duration: number;
  price: string;
}

export interface BookingEmployee {
  id: string;
  name: string;
  role: string;
  image: string | null;
}

export interface TimeSlot {
  time: string;
  employeeId: string;
  employeeName: string;
}

export interface BookingRequest {
  clientName: string;
  clientPhone: string;
  serviceId: string;
  employeeId: string;
  date: string;
  time: string;
}

const fetchJson = async <T>(url: string): Promise<T> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
};

export const bookingApi = {
  getTenantInfo: (slug: string) =>
    fetchJson<TenantInfo>(`/api/public/${slug}/info`),

  getServices: (slug: string) =>
    fetchJson<{ data: BookingService[] }>(`/api/public/${slug}/services`),

  getEmployees: (slug: string) =>
    fetchJson<{ data: BookingEmployee[] }>(`/api/public/${slug}/employees`),

  getDates: (slug: string, serviceId: string) =>
    fetchJson<{ dates: string[] }>(
      `/api/public/${slug}/dates?serviceId=${serviceId}`
    ),

  getAvailability: (
    slug: string,
    date: string,
    serviceId: string,
    employeeId?: string
  ) => {
    let url = `/api/public/${slug}/availability?date=${date}&serviceId=${serviceId}`;
    if (employeeId) url += `&employeeId=${employeeId}`;
    return fetchJson<{ slots: TimeSlot[] }>(url);
  },

  book: (slug: string, data: BookingRequest) =>
    fetch(`/api/public/${slug}/book`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(async (res) => {
      if (!res.ok) {
        const err = await res
          .json()
          .catch(() => ({ error: "Booking failed" }));
        throw new Error(err.error);
      }
      return res.json();
    }),
};
