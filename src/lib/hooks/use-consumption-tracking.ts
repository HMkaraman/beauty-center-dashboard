import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { consumptionApi } from "@/lib/api/consumption-tracking";

export function useConsumptionLogs(params?: { appointmentId?: string; clientId?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["consumption-logs", params],
    queryFn: () => consumptionApi.list(params),
    enabled: !!(params?.appointmentId || params?.clientId),
  });
}

export function useRecordLaserConsumption() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: consumptionApi.recordLaser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consumption-logs"] });
    },
  });
}

export function useRecordInjectableConsumption() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: consumptionApi.recordInjectable,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consumption-logs"] });
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
      queryClient.invalidateQueries({ queryKey: ["client-reservations"] });
    },
  });
}

export function useConsumptionReport(params?: { serviceId?: string; startDate?: string; endDate?: string }) {
  return useQuery({
    queryKey: ["consumption-report", params],
    queryFn: () => consumptionApi.getReport(params),
    enabled: false,
  });
}
