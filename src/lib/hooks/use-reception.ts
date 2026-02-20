import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import { appointmentsApi } from "@/lib/api/appointments";
import type { Appointment } from "@/types";

interface ReceptionStats {
  totalAppointments: number;
  waiting: number;
  inProgress: number;
  completed: number;
  todayRevenue: number;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export function useTodayAppointments() {
  const today = new Date().toISOString().split("T")[0];
  return useQuery({
    queryKey: ["reception", "today-appointments", today],
    queryFn: () => {
      const searchParams = new URLSearchParams();
      searchParams.set("date", today);
      searchParams.set("limit", "200");
      return apiFetch<PaginatedResponse<Appointment>>(`/appointments?${searchParams}`);
    },
    refetchInterval: 30 * 1000,
  });
}

export function useAppointmentsByRange(
  params: { dateFrom: string; dateTo: string },
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ["reception", "appointments-range", params.dateFrom, params.dateTo],
    queryFn: () => {
      const sp = new URLSearchParams();
      sp.set("dateFrom", params.dateFrom);
      sp.set("dateTo", params.dateTo);
      sp.set("limit", "500");
      return apiFetch<PaginatedResponse<Appointment>>(`/appointments?${sp}`);
    },
    enabled: options?.enabled !== false && !!params.dateFrom && !!params.dateTo,
    refetchInterval: 30 * 1000,
  });
}

export function useReceptionStats() {
  return useQuery({
    queryKey: ["reception", "stats"],
    queryFn: () => apiFetch<ReceptionStats>("/reception/stats"),
    refetchInterval: 30 * 1000,
  });
}

interface ProviderScheduleParams {
  date?: string;
  employeeId?: string;
  doctorId?: string;
}

interface ProviderScheduleResponse {
  workingHours: { start: string; end: string } | null;
  appointments: Array<{
    id: string;
    time: string;
    duration: number;
    clientName: string;
    service: string;
    status: string;
  }>;
  notWorking: boolean;
}

export function useProviderSchedule(params: ProviderScheduleParams) {
  const hasProvider = !!params.employeeId || !!params.doctorId;
  return useQuery({
    queryKey: ["reception", "provider-schedule", params],
    queryFn: () => {
      const sp = new URLSearchParams();
      if (params.date) sp.set("date", params.date);
      if (params.employeeId) sp.set("employeeId", params.employeeId);
      if (params.doctorId) sp.set("doctorId", params.doctorId);
      return apiFetch<ProviderScheduleResponse>(`/reception/provider-schedule?${sp}`);
    },
    enabled: !!params.date && hasProvider,
    staleTime: 30 * 1000,
  });
}

export interface TodayAvailabilityProvider {
  id: string;
  name: string;
  type: "employee" | "doctor";
  image: string | null;
  role: string;
  notWorking: boolean;
  workingHours: { start: string; end: string } | null;
  currentStatus: "free" | "busy" | "off";
  currentAppointment: {
    clientName: string;
    service: string;
    time: string;
    duration: number;
  } | null;
  nextAvailableTime: string | null;
  appointmentCount: number;
  appointments: Array<{
    id: string;
    time: string;
    duration: number;
    clientName: string;
    service: string;
    status: string;
  }>;
}

interface TodayAvailabilityResponse {
  providers: TodayAvailabilityProvider[];
}

export function useTodayAvailability() {
  return useQuery({
    queryKey: ["reception", "today-availability"],
    queryFn: () =>
      apiFetch<TodayAvailabilityResponse>("/reception/today-availability"),
    refetchInterval: 30 * 1000,
  });
}

export function useInvalidateReception() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["reception"] });
    queryClient.invalidateQueries({ queryKey: ["appointments"] });
  };
}
