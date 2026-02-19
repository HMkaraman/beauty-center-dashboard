import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { employeesApi } from "@/lib/api/employees";

export function useEmployees(params?: { page?: number; limit?: number; search?: string }) {
  return useQuery({
    queryKey: ["employees", params],
    queryFn: () => employeesApi.list(params),
  });
}

export function useEmployee(id: string) {
  return useQuery({
    queryKey: ["employees", id],
    queryFn: () => employeesApi.get(id),
    enabled: !!id,
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: employeesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof employeesApi.update>[1] }) =>
      employeesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
}

export function useEmployeeDetails(id: string) {
  return useQuery({
    queryKey: ["employees", id, "details"],
    queryFn: () => employeesApi.getDetails(id),
    enabled: !!id,
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: employeesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
}

export function useBulkDeleteEmployees() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: employeesApi.bulkDelete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
}

export function useBulkUpdateEmployeeStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: employeesApi.bulkUpdateStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
}
