import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { financeApi } from "@/lib/api/finance";
import type { TransactionType } from "@/types";

export function useTransactions(params?: {
  page?: number;
  limit?: number;
  search?: string;
  type?: TransactionType;
}) {
  return useQuery({
    queryKey: ["finance", params],
    queryFn: () => financeApi.list(params),
  });
}

export function useTransaction(id: string) {
  return useQuery({
    queryKey: ["finance", id],
    queryFn: () => financeApi.get(id),
    enabled: !!id,
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: financeApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance"] });
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof financeApi.update>[1] }) =>
      financeApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance"] });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: financeApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance"] });
    },
  });
}

export function useBulkDeleteTransactions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: financeApi.bulkDelete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance"] });
    },
  });
}
