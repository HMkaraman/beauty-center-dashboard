import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { serviceCategoriesApi } from "@/lib/api/service-categories";

export function useServiceCategories(params?: { sectionId?: string }) {
  return useQuery({
    queryKey: ["service-categories", params],
    queryFn: () => serviceCategoriesApi.list(params),
  });
}

export function useCreateServiceCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: serviceCategoriesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-categories"] });
    },
  });
}

export function useUpdateServiceCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof serviceCategoriesApi.update>[1] }) =>
      serviceCategoriesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-categories"] });
    },
  });
}

export function useDeleteServiceCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: serviceCategoriesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-categories"] });
    },
  });
}
