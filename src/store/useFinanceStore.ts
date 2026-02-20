import { createEntityStore } from "./createEntityStore";
import { Transaction } from "@/types";

export const useFinanceStore = createEntityStore<Transaction>([]);
