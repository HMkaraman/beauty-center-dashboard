import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryApi, inventoryCategoryApi } from "@/lib/api/inventory";

export function useInventoryItems(params?: { page?: number; limit?: number; search?: string; categoryId?: string; productType?: string; expiringBefore?: string }) {
  return useQuery({
    queryKey: ["inventory", params],
    queryFn: () => inventoryApi.list(params),
  });
}

export function useInventoryItem(id: string) {
  return useQuery({
    queryKey: ["inventory", id],
    queryFn: () => inventoryApi.get(id),
    enabled: !!id,
  });
}

export function useCreateInventoryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: inventoryApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
  });
}

export function useUpdateInventoryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof inventoryApi.update>[1];
    }) => inventoryApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
  });
}

export function useDeleteInventoryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: inventoryApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
  });
}

export function useBulkDeleteInventoryItems() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: inventoryApi.bulkDelete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
  });
}

// Category hooks
export function useInventoryCategories() {
  return useQuery({
    queryKey: ["inventory-categories"],
    queryFn: () => inventoryCategoryApi.list(),
  });
}

export function useCreateInventoryCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: inventoryCategoryApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory-categories"] });
    },
  });
}

export function useUpdateInventoryCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof inventoryCategoryApi.update>[1] }) =>
      inventoryCategoryApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory-categories"] });
    },
  });
}

export function useDeleteInventoryCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: inventoryCategoryApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory-categories"] });
    },
  });
}
