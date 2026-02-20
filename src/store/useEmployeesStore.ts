import { createEntityStore } from "./createEntityStore";
import { Employee } from "@/types";

export const useEmployeesStore = createEntityStore<Employee>([]);
