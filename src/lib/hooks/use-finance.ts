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

// Finance overview (real data)
export function useFinanceOverview(params?: { startDate?: string; endDate?: string }) {
  return useQuery({
    queryKey: ["finance-overview", params],
    queryFn: () => financeApi.overview(params),
  });
}

// P&L report
export function usePnlReport(params?: { startDate?: string; endDate?: string }) {
  return useQuery({
    queryKey: ["finance-pnl", params],
    queryFn: () => financeApi.pnlReport(params),
  });
}

// Tax summary
export function useTaxSummary(params?: { startDate?: string; endDate?: string }) {
  return useQuery({
    queryKey: ["finance-tax-summary", params],
    queryFn: () => financeApi.taxSummary(params),
  });
}

// Payments
export function useInvoicePayments(invoiceId: string) {
  return useQuery({
    queryKey: ["payments", invoiceId],
    queryFn: () => financeApi.getPayments(invoiceId),
    enabled: !!invoiceId,
  });
}

export function useRecordPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ invoiceId, data }: { invoiceId: string; data: Parameters<typeof financeApi.recordPayment>[1] }) =>
      financeApi.recordPayment(invoiceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["finance"] });
    },
  });
}

// Expense categories
export function useExpenseCategories() {
  return useQuery({
    queryKey: ["expense-categories"],
    queryFn: () => financeApi.listExpenseCategories(),
  });
}

export function useCreateExpenseCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: financeApi.createExpenseCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expense-categories"] });
    },
  });
}

export function useUpdateExpenseCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof financeApi.updateExpenseCategory>[1] }) =>
      financeApi.updateExpenseCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expense-categories"] });
    },
  });
}

export function useDeleteExpenseCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: financeApi.deleteExpenseCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expense-categories"] });
    },
  });
}

// Chart of accounts
export function useAccounts() {
  return useQuery({
    queryKey: ["accounts"],
    queryFn: () => financeApi.listAccounts(),
  });
}

export function useSeedAccounts() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: financeApi.seedAccounts,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
}

// Daily settlements
export function useDailySettlements(params?: { date?: string }) {
  return useQuery({
    queryKey: ["daily-settlements", params],
    queryFn: () => financeApi.listSettlements(params),
  });
}

export function useCreateSettlement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: financeApi.createSettlement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["daily-settlements"] });
    },
  });
}

// Financial periods
export function useFinancialPeriods() {
  return useQuery({
    queryKey: ["financial-periods"],
    queryFn: () => financeApi.listPeriods(),
  });
}

export function useClosePeriod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: financeApi.closePeriod,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financial-periods"] });
    },
  });
}
