import { apiFetch } from "./client";
import type { Transaction, TransactionType, FinanceOverview, PLReport, TaxSummary, Payment, ExpenseCategory, Account, DailySettlement, FinancialPeriod } from "@/types";

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export const financeApi = {
  list: (params?: { page?: number; limit?: number; search?: string; type?: TransactionType }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.search) searchParams.set("search", params.search);
    if (params?.type) searchParams.set("type", params.type);
    const qs = searchParams.toString();
    return apiFetch<PaginatedResponse<Transaction>>(`/finance${qs ? `?${qs}` : ""}`);
  },
  get: (id: string) => apiFetch<Transaction>(`/finance/${id}`),
  create: (data: Partial<Transaction>) =>
    apiFetch<Transaction>("/finance", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Transaction>) =>
    apiFetch<Transaction>(`/finance/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: string) => apiFetch(`/finance/${id}`, { method: "DELETE" }),
  bulkDelete: (ids: string[]) =>
    apiFetch<{ deleted: number }>("/finance/bulk", { method: "DELETE", body: JSON.stringify({ ids }) }),

  // Finance overview
  overview: (params?: { startDate?: string; endDate?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.startDate) searchParams.set("startDate", params.startDate);
    if (params?.endDate) searchParams.set("endDate", params.endDate);
    const qs = searchParams.toString();
    return apiFetch<FinanceOverview>(`/finance/overview${qs ? `?${qs}` : ""}`);
  },

  // P&L report
  pnlReport: (params?: { startDate?: string; endDate?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.startDate) searchParams.set("startDate", params.startDate);
    if (params?.endDate) searchParams.set("endDate", params.endDate);
    const qs = searchParams.toString();
    return apiFetch<PLReport>(`/finance/reports/pnl${qs ? `?${qs}` : ""}`);
  },

  // Tax summary report
  taxSummary: (params?: { startDate?: string; endDate?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.startDate) searchParams.set("startDate", params.startDate);
    if (params?.endDate) searchParams.set("endDate", params.endDate);
    const qs = searchParams.toString();
    return apiFetch<TaxSummary>(`/finance/reports/tax-summary${qs ? `?${qs}` : ""}`);
  },

  // Payments
  getPayments: (invoiceId: string) =>
    apiFetch<Payment[]>(`/invoices/${invoiceId}/payments`),
  recordPayment: (invoiceId: string, data: Partial<Payment>) =>
    apiFetch<Payment>(`/invoices/${invoiceId}/payments`, { method: "POST", body: JSON.stringify(data) }),

  // Expense categories
  listExpenseCategories: () =>
    apiFetch<ExpenseCategory[]>("/expense-categories"),
  createExpenseCategory: (data: Partial<ExpenseCategory>) =>
    apiFetch<ExpenseCategory>("/expense-categories", { method: "POST", body: JSON.stringify(data) }),
  updateExpenseCategory: (id: string, data: Partial<ExpenseCategory>) =>
    apiFetch<ExpenseCategory>(`/expense-categories/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteExpenseCategory: (id: string) =>
    apiFetch(`/expense-categories/${id}`, { method: "DELETE" }),

  // Chart of accounts
  listAccounts: () =>
    apiFetch<Account[]>("/finance/accounts"),
  createAccount: (data: Partial<Account>) =>
    apiFetch<Account>("/finance/accounts", { method: "POST", body: JSON.stringify(data) }),
  seedAccounts: () =>
    apiFetch<{ seeded: number }>("/finance/accounts/seed", { method: "POST" }),

  // Daily settlements
  listSettlements: (params?: { date?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.date) searchParams.set("date", params.date);
    const qs = searchParams.toString();
    return apiFetch<DailySettlement[]>(`/finance/daily-settlement${qs ? `?${qs}` : ""}`);
  },
  createSettlement: (data: Partial<DailySettlement>) =>
    apiFetch<DailySettlement>("/finance/daily-settlement", { method: "POST", body: JSON.stringify(data) }),

  // Financial periods
  listPeriods: () =>
    apiFetch<FinancialPeriod[]>("/finance/periods"),
  closePeriod: (id: string) =>
    apiFetch<FinancialPeriod>(`/finance/periods/${id}/close`, { method: "POST" }),
};
