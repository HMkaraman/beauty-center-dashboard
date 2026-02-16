import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { marketingApi } from "@/lib/api/marketing";

export function useCampaigns(params?: { page?: number; limit?: number; search?: string }) {
  return useQuery({
    queryKey: ["marketing", params],
    queryFn: () => marketingApi.list(params),
  });
}

export function useCampaign(id: string) {
  return useQuery({
    queryKey: ["marketing", id],
    queryFn: () => marketingApi.get(id),
    enabled: !!id,
  });
}

export function useCreateCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: marketingApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marketing"] });
    },
  });
}

export function useUpdateCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof marketingApi.update>[1] }) =>
      marketingApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marketing"] });
    },
  });
}

export function useDeleteCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: marketingApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marketing"] });
    },
  });
}
