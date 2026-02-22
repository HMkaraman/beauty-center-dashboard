import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { healingJourneysApi } from "@/lib/api/healing-journeys";

export function useHealingJourneys(clientId: string) {
  return useQuery({
    queryKey: ["healing-journeys", clientId],
    queryFn: () => healingJourneysApi.list(clientId),
    enabled: !!clientId,
  });
}

export function useHealingJourney(clientId: string, journeyId: string) {
  return useQuery({
    queryKey: ["healing-journeys", clientId, journeyId],
    queryFn: () => healingJourneysApi.get(clientId, journeyId),
    enabled: !!clientId && !!journeyId,
  });
}

export function useCreateHealingJourney() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ clientId, data }: { clientId: string; data: Parameters<typeof healingJourneysApi.create>[1] }) =>
      healingJourneysApi.create(clientId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["healing-journeys"] });
    },
  });
}

export function useUpdateHealingJourney() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ clientId, journeyId, data }: { clientId: string; journeyId: string; data: Parameters<typeof healingJourneysApi.update>[2] }) =>
      healingJourneysApi.update(clientId, journeyId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["healing-journeys"] });
    },
  });
}

export function useDeleteHealingJourney() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ clientId, journeyId }: { clientId: string; journeyId: string }) =>
      healingJourneysApi.delete(clientId, journeyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["healing-journeys"] });
    },
  });
}

export function useJourneyEntries(clientId: string, journeyId: string) {
  return useQuery({
    queryKey: ["journey-entries", journeyId],
    queryFn: () => healingJourneysApi.listEntries(clientId, journeyId),
    enabled: !!clientId && !!journeyId,
  });
}

export function useCreateJourneyEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ clientId, journeyId, data }: { clientId: string; journeyId: string; data: Record<string, unknown> }) =>
      healingJourneysApi.createEntry(clientId, journeyId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journey-entries"] });
      queryClient.invalidateQueries({ queryKey: ["healing-journeys"] });
    },
  });
}

export function useDeleteJourneyEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ clientId, journeyId, entryId }: { clientId: string; journeyId: string; entryId: string }) =>
      healingJourneysApi.deleteEntry(clientId, journeyId, entryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journey-entries"] });
      queryClient.invalidateQueries({ queryKey: ["healing-journeys"] });
    },
  });
}

export function useConsentAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ clientId, journeyId, data }: { clientId: string; journeyId: string; data: { action: string; signatureUrl?: string } }) =>
      healingJourneysApi.consent(clientId, journeyId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["healing-journeys"] });
    },
  });
}
