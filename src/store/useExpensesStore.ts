import { createEntityStore } from "./createEntityStore";
import { expensesListData } from "@/lib/mock-data";
import { Expense } from "@/types";

export const useExpensesStore = createEntityStore<Expense>(expensesListData);
