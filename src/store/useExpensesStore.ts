import { createEntityStore } from "./createEntityStore";
import { Expense } from "@/types";

export const useExpensesStore = createEntityStore<Expense>([]);
