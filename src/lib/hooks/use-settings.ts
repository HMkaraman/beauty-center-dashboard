import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsApi } from "@/lib/api/settings";
import type { Settings, WorkingHours } from "@/lib/api/settings";

export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: () => settingsApi.get(),
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Settings>) => settingsApi.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });
}

export function useWorkingHours() {
  return useQuery({
    queryKey: ["settings", "working-hours"],
    queryFn: () => settingsApi.getWorkingHours(),
  });
}

export function useUpdateWorkingHours() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: WorkingHours[]) => settingsApi.updateWorkingHours(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings", "working-hours"] });
    },
  });
}

export function useFetchExchangeRates() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => settingsApi.fetchExchangeRates(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });
}
