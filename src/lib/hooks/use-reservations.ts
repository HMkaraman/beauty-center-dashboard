import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reservationsApi } from "@/lib/api/reservations";

export function useReservations(params?: { clientId?: string; status?: string; expiringBefore?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["reservations", params],
    queryFn: () => reservationsApi.list(params),
  });
}

export function useReservation(id: string) {
  return useQuery({
    queryKey: ["reservations", id],
    queryFn: () => reservationsApi.get(id),
    enabled: !!id,
  });
}

export function useUpdateReservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      reservationsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
      queryClient.invalidateQueries({ queryKey: ["client-reservations"] });
    },
  });
}

export function useRecordTouchUp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { touchUpAppointmentId?: string; touchUpAmountUsed: number; touchUpIsFree?: boolean; notes?: string } }) =>
      reservationsApi.recordTouchUp(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
      queryClient.invalidateQueries({ queryKey: ["client-reservations"] });
      queryClient.invalidateQueries({ queryKey: ["reservations-dashboard"] });
    },
  });
}

export function useReservationsDashboard() {
  return useQuery({
    queryKey: ["reservations-dashboard"],
    queryFn: () => reservationsApi.getDashboard(),
  });
}

export function useClientActiveReservations(clientId: string | undefined) {
  return useQuery({
    queryKey: ["client-reservations", clientId],
    queryFn: () => reservationsApi.getClientReservations(clientId!, "active"),
    enabled: !!clientId,
  });
}
