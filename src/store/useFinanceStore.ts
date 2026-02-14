import { createEntityStore } from "./createEntityStore";
import { financeTransactionsData } from "@/lib/mock-data";
import { Transaction } from "@/types";

export const useFinanceStore = createEntityStore<Transaction>(financeTransactionsData);
