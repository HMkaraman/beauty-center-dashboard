import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { appointmentsApi } from "@/lib/api/appointments";
import type { AppointmentStatus } from "@/types";

export function useAppointments(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: AppointmentStatus;
}) {
  return useQuery({
    queryKey: ["appointments", params],
    queryFn: () => appointmentsApi.list(params),
  });
}

export function useAppointment(id: string) {
  return useQuery({
    queryKey: ["appointments", id],
    queryFn: () => appointmentsApi.get(id),
    enabled: !!id,
  });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: appointmentsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
}

export function useUpdateAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof appointmentsApi.update>[1];
    }) => appointmentsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
}

export function useDeleteAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: appointmentsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
}

export function useBulkDeleteAppointments() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: appointmentsApi.bulkDelete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
}

export function useBulkUpdateAppointmentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: appointmentsApi.bulkUpdateStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
}

export function useAvailableSlots(params: {
  date?: string;
  serviceId?: string;
  employeeId?: string;
  doctorId?: string;
  excludeId?: string;
}) {
  return useQuery({
    queryKey: ["available-slots", params],
    queryFn: () =>
      appointmentsApi.getAvailableSlots({
        date: params.date!,
        serviceId: params.serviceId!,
        employeeId: params.employeeId,
        doctorId: params.doctorId,
        excludeId: params.excludeId,
      }),
    enabled: !!params.date && !!params.serviceId,
    staleTime: 30 * 1000,
    gcTime: 2 * 60 * 1000,
    retry: 1,
  });
}

export function useAvailableDates(params: {
  serviceId?: string;
  employeeId?: string;
  doctorId?: string;
  excludeId?: string;
}) {
  return useQuery({
    queryKey: ["available-dates", params],
    queryFn: () =>
      appointmentsApi.getAvailableDates({
        serviceId: params.serviceId!,
        employeeId: params.employeeId,
        doctorId: params.doctorId,
        excludeId: params.excludeId,
      }),
    enabled: !!params.serviceId,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 1,
  });
}
