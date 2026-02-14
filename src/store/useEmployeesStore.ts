import { createEntityStore } from "./createEntityStore";
import { employeesListData } from "@/lib/mock-data";
import { Employee } from "@/types";

export const useEmployeesStore = createEntityStore<Employee>(employeesListData);
