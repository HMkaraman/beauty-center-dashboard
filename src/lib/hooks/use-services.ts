import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { servicesApi } from "@/lib/api/services";

export function useServices(params?: { page?: number; limit?: number; search?: string }) {
  return useQuery({
    queryKey: ["services", params],
    queryFn: () => servicesApi.list(params),
  });
}

export function useService(id: string) {
  return useQuery({
    queryKey: ["services", id],
    queryFn: () => servicesApi.get(id),
    enabled: !!id,
  });
}

export function useServiceDetails(id: string) {
  return useQuery({
    queryKey: ["services", id, "details"],
    queryFn: () => servicesApi.getDetails(id),
    enabled: !!id,
  });
}

export function useServiceInventory(id: string) {
  return useQuery({
    queryKey: ["services", id, "inventory"],
    queryFn: () => servicesApi.getInventory(id),
    enabled: !!id,
  });
}

export function useServiceEmployees(id: string) {
  return useQuery({
    queryKey: ["services", id, "employees"],
    queryFn: () => servicesApi.getEmployees(id),
    enabled: !!id,
  });
}

export function useCreateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: servicesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });
}

export function useUpdateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof servicesApi.update>[1] }) =>
      servicesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });
}

export function useUpdateServiceInventory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, requirements }: { id: string; requirements: { inventoryItemId: string; quantityRequired: number }[] }) =>
      servicesApi.updateInventory(id, requirements),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["services", variables.id] });
    },
  });
}

export function useUpdateServiceEmployees() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, employeeIds }: { id: string; employeeIds: string[] }) =>
      servicesApi.updateEmployees(id, employeeIds),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["services", variables.id] });
    },
  });
}

export function useDeleteService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: servicesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });
}

export function useBulkDeleteServices() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: servicesApi.bulkDelete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });
}

export function useBulkUpdateServiceStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: servicesApi.bulkUpdateStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });
}
